## Goal

Make receipt edits update inventory the same way a real ERP would: always reverse the original effect with the **original stored quantities/prices**, then apply the new effect — never overwrite using only the new values, and never leave the database half-updated when validation fails.

## Why the current bug happens

`supabase/functions/manage-receipt/index.ts → handleUpdate()` already follows the right shape (reverse → update → reapply), but it has three real holes that match the symptoms you describe:

1. **No pre-validation on update.** If the new state is `sales` and stock isn't enough, it deletes the old `receipt_items`, inserts new ones, then throws inside `applyStockEffect`. The receipt is now corrupt and stock is partially reversed → "sometimes inventory stays unchanged / only subtracts 200".
2. **`adjustment` type is silently ignored.** `isPurchaseType` / `isSalesType` don't cover `adjustment`, so reversing or applying an adjustment-typed receipt is a no-op. Editing an adjustment leaves stock untouched.
3. **Frontend cache staleness.** `usePOSData` / `ReceiptsContext` keep optimistic copies. After a type-flip edit, the UI reads the old `current_stock` until `refreshProducts()` resolves, which makes the bug look intermittent.

## Fix (backend, single file: `supabase/functions/manage-receipt/index.ts`)

### 1. Add one signed-effect helper, use it everywhere

```ts
// +qty for stock-in, -qty for stock-out, 0 for unknown
function getInventoryDelta(type: string, qty: number): number {
  switch (type) {
    case "purchase":
    case "increase":
    case "return_in":   // future-proof
      return qty;
    case "sales":
    case "reduce":
    case "adjustment":  // fixes silent no-op
    case "damage":
    case "return_out":
      return -qty;
    default:
      return 0;
  }
}
```

Rewrite `applyStockEffect` / `reverseStockEffect` on top of this so the two paths can never disagree. WAC math stays the same: avg_cost only moves on stock-in (purchase/increase/return_in).

### 2. Rewrite `handleUpdate` as: validate → reverse → write → apply, with rollback

```text
1. Load old receipt + receipt_items (these are the source of truth for reversal).
2. Authorization check (unchanged).
3. SIMULATE the new stock for every affected product:
     simulated = current_stock
                 - getInventoryDelta(oldType, oldItem.qty)   // reverse old
                 + getInventoryDelta(newType, newItem.qty)   // apply new
   If any simulated < 0  → return 400 "Insufficient stock for X"
                              BEFORE touching the DB.
4. Reverse old effects (using OLD type + OLD qty + OLD price for WAC).
5. Update receipts row (type, total, updated_at).
6. Replace receipt_items.
7. Apply new effects.
8. If step 5/6/7 throws, run the reverse of whatever already ran so we
   end on the original stock numbers, then re-throw.
```

Step 3 is the key new guarantee — it makes "half-applied" impossible for the type-flip case in your example.

### 3. Make reads consistent within one update

Each `applyStockEffect` / `reverseStockEffect` already re-reads `current_stock` from the DB before writing, so sequential items in the same receipt compose correctly. We keep that pattern; the new simulation in step 3 aggregates per product so multi-line edits validate as a group.

## Fix (frontend, minimal)

Only one change, to kill the "stale UI" symptom:

- `src/pages/ReceiptPage.tsx → handleSaveReceipt`: after `updateReceipt` resolves, `await refreshProducts()` **and** `await refreshReceipts(selectedYear, selectedMonth)` before closing the dialog. The dialog already shows "Updating…"; this just makes sure the next render reads fresh DB values.
- Surface the server's real error message in the existing toast (already wired via `extractEdgeError` from the previous turn — no new code).

No new tables, no new UI, no audit log, no preview, no confirmation modal (per your answers).

## Walk-through of your example

Start: stock = 1000. Mistaken `purchase` 200 → stock = 1200 (`avg_cost` updated by WAC).

User edits the same receipt to `sales`, qty 200:

1. Simulate: `1200 - (+200 reverse purchase) + (-200 apply sales) = 800` → ✅ passes.
2. Reverse old purchase: stock = 1000, avg_cost rolled back.
3. Update receipt row to `sales`.
4. Replace items.
5. Apply sales: stock = 800.

Result: **800kg**, deterministic, every time. If stock had only been 150, step 1 would have returned `400 "Insufficient stock"` and nothing would have been written.

## Out of scope (confirmed)

- Audit/history table
- New transaction-type enum values (damage / return_in / return_out)
- Stock-preview UI and confirmation modal
- Changes to create/delete/pay_due flows
