# Fix Two Receipt/Stock Issues

## Issue 1 — Item search dropdown shows only after 2 characters

**Root cause** (`src/hooks/useItemDropdown.ts`):
The effect closes the dropdown when value is empty (`setIsOpen(false)`), but never re-opens it when the user starts typing. Once closed, the next keystroke filters items but the panel stays hidden until the user clicks/focuses again — making it feel like "needs 2 characters".

**Fix:** When `value` becomes non-empty after being empty, set `isOpen` to `true` in the same effect, so the first typed character immediately reveals the list.

```ts
useEffect(() => {
  if (!value.trim()) {
    setFilteredItems([]);
    setIsOpen(false);
    return;
  }
  const filtered = itemNames.filter(i => i.toLowerCase().includes(value.toLowerCase()));
  setFilteredItems(filtered);
  setSelectedIndex(-1);
  setIsOpen(true);   // <-- add this
}, [value, itemNames]);
```

No other files touched.

---

## Issue 2 — Stock Adjustment save fails: `receipts_type_check` violation

**Root cause:**
- DB CHECK constraint on `receipts.type` only allows `'purchase'` and `'sales'`.
- Current Stock Adjustment flow (`src/hooks/useTableData.ts` → `handleSave`) calls `addReceipt({ type: 'increase' | 'reduce', ... })`, which the DB rejects.
- Per your request, Stock Adjustment should **not create any receipt** — it should only update the product's stock in inventory.

**Fix scope (frontend only, no DB migration):**

1. **`src/hooks/useTableData.ts` — `handleSave`**
   For `type === 'adjustment'`:
   - Skip `addReceipt` entirely (no increase/reduce receipts inserted).
   - For each valid row, call `updateStock(itemName, qty, 'increase' | 'reduce')` from `ProductsContext` (which uses `productService.updateStock` → direct `products` table update, no receipts).
   - Keep WAC/cost handling out of scope (sticking to "stock update only" as you said).
   - On success: toast "Stock updated successfully", clear rows, refresh products.
   - On failure: toast error, keep rows so user can retry.

2. **No changes** to purchase/sales flow — those continue to create receipts as today.

3. **Receipt page filtering** — already only displays receipts that exist in the DB. Since adjustments will no longer be saved, they simply won't appear in receipts/reports. ✅ matches your requirement.

### Stock Adjustment ↔ Inventory connection re-check

Verified the flow after the fix:
- `useTableData.handleSave` (adjustment) → `productsContext.updateStock` → `productService.updateStock` → direct `products` table UPSERT/UPDATE → `refreshProducts` → Inventory page sees new `current_stock`.
- No edge function call, no `receipts` insert, no constraint violation.

---

## Out of scope
- Not touching `manage-receipt` edge function (only sales/purchase use it now).
- Not changing the DB constraint (no migration needed — adjustments stop writing to receipts).
- No audit log, no UI redesign for stock adjustment, no historical migration of past `increase`/`reduce` receipts (the constraint already blocks them, so none exist).

## Files to edit
- `src/hooks/useItemDropdown.ts` — 1-line fix
- `src/hooks/useTableData.ts` — replace adjustment branch in `handleSave`
