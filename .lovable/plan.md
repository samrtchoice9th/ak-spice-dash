# Full Code Audit Report — AK SPICE POS

---

## 🔴 Critical Issues (Must Fix Immediately)

### 1. Race Condition: Non-Atomic Stock Operations in Edge Function

The `handleCreate` function in `manage-receipt/index.ts` inserts the receipt (step 1), then inserts items (step 2), then applies stock effects one-by-one in a loop (step 3). If stock update fails mid-loop (e.g., insufficient stock on item 3 of 5), items 1-2 already had stock modified but the receipt exists with all items. There is no rollback of partial stock changes. The receipt items rollback on line 290 only covers the items insert failure, not stock failures.

**Fix**: Validate all stock availability upfront before any mutations. Move the stock check loop before the receipt insert.

### 2. Inventory Page: Direct Supabase Client Calls Bypass Edge Function

`Inventory.tsx` lines 48-52 directly call `supabase.from('receipt_items').update(...)` to rename items, and lines 311-316 directly delete receipt_items. This bypasses the edge function's stock management, potentially corrupting stock calculations. Renaming an item in `receipt_items` without updating the product name atomically can also cause orphaned inventory entries.

**Fix**: Create edge function actions for item rename and item deletion, or at minimum do the product + receipt_items rename in a transaction via the edge function.

### 3. `handleDelete` in Edge Function Missing `shopId` Filter (using only one shop id for all users)

`handleDelete` (line 395) reads `shopId` from the receipt itself but does NOT verify the requesting user belongs to that shop. Any authenticated user who knows a receipt ID could delete it via the edge function, since the service role key bypasses RLS. The `handleUpdate` has the same issue — it uses the passed `shopId` but doesn't verify the user owns the receipt.

**Fix**: Add authorization checks: verify `receipt.shop_id === shopId` (user's shop) before allowing delete/update.

### 4. Paid Amount Not Validated Against Total on Save

In `usePOSData.ts` line 211, `paid_amount` is set to `paidAmount` when a contact is selected, but there's no validation that `paidAmount <= totalAmount`. The `PaymentSection` sets `max={grandTotal}` on the HTML input but doesn't enforce it programmatically — a user can type any value. The edge function also doesn't validate this.

**Fix**: Add server-side validation in edge function: `paid_amount <= totalAmount`.

---

## 🟡 Medium Issues

### 5. Security: `payments` Table Missing UPDATE RLS Policy

The security scan confirms payments can be updated by any shop member without restriction. While the app doesn't currently call update on payments, the table is unprotected.

**Fix**: Add UPDATE RLS policy matching the existing SELECT/INSERT/DELETE pattern.

### 6. Security: `get_user_shop_id` Non-Deterministic

Uses `LIMIT 1` without `ORDER BY`. In a single-shop system this is fine today, but if a user ever appears in multiple shop_members rows, the result is unpredictable. The security scan flagged this as an error.

**Fix**: Add `ORDER BY created_at ASC` or add a unique constraint on `(user_id)` in `shop_members` to enforce single membership.

### 7. Security: Leaked Password Protection Disabled

Supabase auth setting. Users can sign up with passwords known to be in breach databases.

**Fix**: Enable leaked password protection in Supabase Auth settings. (this functon available only pro users)

### 8. `ReceiptsContext` Fetches Up to 5000 Receipts on Every Load

Line 17 in `receiptService.ts` uses `.limit(5000)`. All receipts are loaded into memory and passed through multiple contexts (Inventory, Report, Dashboard). As the business grows, this will cause slow page loads and high memory usage.

**Fix**: Implement pagination or date-range filtering for receipts. Consider server-side aggregation for reports and dashboard stats.

### 9. `InventoryContext` Recalculates on Every Render

`calculateInventory()` runs on every render of `InventoryProvider` since it's not memoized. It iterates all receipts and products each time any child component re-renders.

**Fix**: Wrap `calculateInventory()` in `useMemo` with `[receipts, products]` as dependencies.

### 10. `EditReceiptDialog` Doesn't Preserve Payment Data

When editing a receipt, the `handleSave` in `EditReceiptDialog.tsx` only sends `type`, `items`, and `totalAmount`. The edge function's `handleUpdate` only updates those fields. If the type changes (e.g., sales→purchase), the `paid_amount`, `due_amount`, `customer_id`, and `supplier_id` are not updated, leaving orphaned payment references.

**Fix**: Include payment fields in the update flow, or clear them when type changes.

### 11. `handleItemSelect` in `SalesRow` Calls `onUpdate` Three Times Synchronously

Lines 32-34 call `onUpdate` for name, price, and qty separately, causing three state updates and three re-renders. React 18 batches these in event handlers but the `setTimeout` on line 35 may cause the third update to miss batching.

**Fix**: Create a single `updateMultipleFields` function in `usePOSData` that batches all three updates.

### 12. Report Page Only Shows Sales and Purchase Types

`Report.tsx` line 42-43 only accumulates `sales` and `purchase` types. Adjustment, increase, and reduce receipts are ignored, so the report doesn't reflect the full financial picture.

**Fix**: Decide whether adjustments should appear in reports; if so, add them.

### 13. ReceiptsTable Type Badge Only Shows Sales/Purchase

`ReceiptsTable.tsx` line 99-101 only has two badge styles (sales=green, everything else=blue labeled "Purchase"). Adjustment, increase, and reduce types all show as "Purchase".

**Fix**: Add distinct badge colors/labels for all receipt types.

---

## 🟢 Improvements

### 14. No Loading/Error States on Delete Operations

`ReceiptPage.handleDeleteReceipt` and `Inventory` delete operations don't show loading indicators or toast on success/failure (ReceiptPage catch only logs to console).

### 15. Dashboard Stats Not Memoized

`totalSales` and `totalPurchases` on Dashboard are computed inline without `useMemo`. With 6000+ receipts, these reduce operations run on every render.

### 16. Settings Page Has Hardcoded Shop Info in Receipt Preview

`ReceiptPreview` component (line 227) has hardcoded "YOUR SHOP" and a fixed phone number/address rather than pulling from actual shop data.

### 17. No Confirmation Before Clearing Saved Draft

When a sale is saved, the draft is cleared immediately. If the save fails after clearing, the user loses their work. The clear should happen only after confirmed success (it currently does — this is correct).

### 18. Product `price` Field Ambiguous

Products have both `price` (selling price) and `avg_cost` (weighted average). The ItemSearch dropdown shows `product.price`, but Settings shows `inventoryItem.averagePurchasePrice`. The `price` field on products is set to 0 when auto-created, making the dropdown show Rs.0.00 for new items.

---

## 🚀 Recommended Fix Plan (Priority Order)


| Priority | Issue                                                         | Effort                  |
| -------- | ------------------------------------------------------------- | ----------------------- |
| 1        | Add authorization check in edge function delete/update        | Small — 5 lines         |
| 2        | Add payments UPDATE RLS policy                                | Small — 1 migration     |
| 3        | Validate paid_amount <= totalAmount server-side               | Small — 3 lines         |
| 4        | Move Inventory.tsx direct DB calls to edge function           | Medium                  |
| 5        | Add stock pre-validation before mutations in handleCreate     | Medium                  |
| 6        | Memoize InventoryContext calculation                          | Small — wrap in useMemo |
| 7        | Fix ReceiptsTable type badges for all receipt types           | Small                   |
| 8        | Fix EditReceiptDialog to handle payment fields on type change | Medium                  |
| 9        | Add deterministic ORDER BY to get_user_shop_id                | Small — 1 migration     |
| 10       | Enable leaked password protection                             | Config change           |
| 11       | Plan receipts pagination for scalability                      | Large — future          |
