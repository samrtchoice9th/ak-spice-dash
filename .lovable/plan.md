

# Settings Page — Items Panel Audit & Fixes

## Issues Found

### 1. Edit Only Updates `name` — No Duplicate Check (Bug)
`handleEditProduct` (line 56) updates the name without checking if the new name already exists. User could rename "Turmeric" to "Chilli" when "Chilli" already exists, creating duplicates.

### 2. AddItemDialog Uses `alert()` Instead of Toast (UX)
Lines 32, 64, 68 use browser `alert()` — inconsistent with the rest of the app which uses toast notifications. Also uses hardcoded `text-gray-700`, `border-gray-300`, `focus:ring-blue-500` instead of theme tokens.

### 3. AddItemDialog localStorage Sync Is Fragile (Bug)
Lines 50-56: After adding a product to the DB, it also writes to `localStorage('spiceItems')`. This is legacy code — the dropdown now reads from ProductsContext. The localStorage write is dead code that can cause stale data.

### 4. InventoryContext Depends on Receipts (Performance)
The Settings page imports `useInventory` which depends on `useReceipts`. Since receipts are now month-filtered, the inventory data shown (price/stock) on Settings page may only reflect current month's receipts — not all-time data. **However**, lines 326-327 and 363-364 use `inventory.find()` to display price/stock. The `products` table has `current_stock` and `avg_cost` directly — no need to go through inventory context.

### 5. No Search/Filter for Items List (Performance)
With many products, no way to search. Should add a search input.

### 6. Delete Doesn't Clean Up Related Data
`deleteProduct` in productService just deletes from `products` table. It doesn't warn about or clean up receipt_items referencing this product name. This is acceptable since receipt_items store the name as text (not FK), but user should be warned.

### 7. Edit Dialog Missing Enter Key Support
The edit dialog (line 521) has no `onKeyDown` handler for Enter to save.

## Plan

### Fix 1: Add duplicate name check to edit
Before saving, check if another product already has the new name (case-insensitive).

### Fix 2: Replace alert() with toast in AddItemDialog
Use the `useToast` hook. Also replace hardcoded colors with theme tokens.

### Fix 3: Remove localStorage sync from AddItemDialog
Remove the dead `spiceItems` localStorage code.

### Fix 4: Use products table directly instead of inventory context
Display `product.avg_cost` and `product.current_stock` directly from the products array. Remove `useInventory` import from Settings page.

### Fix 5: Add search input to items list
Simple text filter above the items list.

### Fix 6: Add Enter key support to edit dialog
Add `onKeyDown` handler to the edit name input.

### Fix 7: Add item count display
Show "X items" count in the header.

## Files Changed

| File | Change |
|------|--------|
| `src/pages/Settings.tsx` | Add duplicate check on edit, use products directly (remove useInventory), add search, add Enter key on edit dialog, add item count |
| `src/components/AddItemDialog.tsx` | Replace alert() with toast, remove localStorage sync, fix hardcoded colors |

