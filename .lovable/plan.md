

# Stock + Receipt + Average Cost — Pro Version

## Current Problems

1. **Dual stock tracking**: `products.current_stock` is updated on save, but `InventoryContext` recalculates from receipts. These can diverge.
2. **No avg_cost column**: Average cost is calculated on-the-fly in `InventoryContext` but not persisted in `products`.
3. **Receipt edit does NOT adjust stock**: `EditReceiptDialog.handleSave` updates receipt data but never reverses old stock or applies new stock changes.
4. **Receipt delete does NOT adjust stock**: `ReceiptsContext.deleteReceipt` deletes from DB but never restores stock.
5. **No transaction safety**: Stock updates happen one-by-one in a loop after receipt creation; if one fails, data is inconsistent.

## Solution: Server-Side Stock Management via Edge Function

Move all stock logic into a Supabase Edge Function that runs in a transaction. The client calls one endpoint; the server handles receipt + stock atomically.

## Database Changes (Migration)

Add `avg_cost` column to `products`:
```sql
ALTER TABLE products ADD COLUMN IF NOT EXISTS avg_cost numeric NOT NULL DEFAULT 0;
```

## New Edge Function: `manage-receipt`

**`supabase/functions/manage-receipt/index.ts`**

Handles three actions: `create`, `update`, `delete`.

**Create logic:**
1. Insert receipt + receipt_items
2. For each item:
   - If purchase/increase: apply weighted avg cost formula, add to stock
   - If sales/reduce: subtract from stock (no avg_cost change)
   - If product doesn't exist: create it

**Update logic (the critical fix):**
1. Fetch old receipt + items
2. Reverse old stock effects (undo old items)
3. Delete old receipt_items, insert new ones
4. Apply new stock effects (apply new items)
5. Recalculate avg_cost for affected products

**Delete logic:**
1. Fetch receipt + items
2. Reverse stock effects
3. Delete receipt (cascades to items)

**Average cost formula (purchase only):**
```
new_avg = ((old_stock * old_avg) + (qty * price)) / (old_stock + qty)
```

**Reversal formula (undo a purchase):**
```
If (old_stock - qty) > 0:
  reversed_avg = ((old_stock * old_avg) - (qty * price)) / (old_stock - qty)
Else:
  reversed_avg = 0
```

Sales never change avg_cost.

## Files Changed

| File | Change |
|------|--------|
| **Migration** | Add `avg_cost` to products |
| `supabase/functions/manage-receipt/index.ts` | New edge function with transactional stock logic |
| `src/services/receiptService.ts` | Call edge function instead of direct Supabase inserts |
| `src/hooks/usePOSData.ts` | Remove client-side `updateStock` loop (edge function handles it) |
| `src/contexts/ReceiptsContext.tsx` | `updateReceipt` and `deleteReceipt` call edge function; refresh products after |
| `src/contexts/ProductsContext.tsx` | Export `refreshProducts` for use after receipt operations |
| `src/components/EditReceiptDialog.tsx` | Pass old receipt items to `onSave` so service can reverse stock |
| `src/contexts/InventoryContext.tsx` | Read `avg_cost` from products table instead of recalculating; keep receipt-based stock as cross-check |
| `src/pages/Inventory.tsx` | Display avg_cost from products |

## Key Behavioral Changes

- **Receipt edit**: Fully reversible. Old items' stock effect is undone, new items applied. Avg cost recalculated.
- **Receipt delete**: Stock restored. Avg cost recalculated.
- **No edit time restriction**: Already removed (no 1-day limit exists in current code).
- **Negative stock prevention**: Edge function checks `new_stock >= 0` for sales; returns error if insufficient.
- **Reprint**: Already works (no changes needed).
- **Atomic operations**: All DB changes in one edge function call with transaction.

## Execution Order

1. Database migration (add `avg_cost`)
2. Create `manage-receipt` edge function
3. Update `receiptService.ts` to call edge function
4. Update `usePOSData.ts` to remove client-side stock loop
5. Update `ReceiptsContext` for edit/delete with stock reversal
6. Update `InventoryContext` to use products' `avg_cost`
7. Update `EditReceiptDialog` to pass old items for reversal

