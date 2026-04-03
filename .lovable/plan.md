

# Inventory Page: Stock Edit & Update — Issues Found

## Problems

### 1. Receipt Items Not Scoped by Shop (Security)
In `handleRenameItem` (line 595), receipt_items are renamed globally — `eq("item_name", old_name)` without filtering by shop. Since the edge function uses the service role key (bypasses RLS), this could rename items in other shops if multi-shop is ever re-enabled. Same issue in `handleDeleteItem` (line 613).

**Fix**: Filter receipt_items through a subquery on receipts scoped by `shop_id`.

### 2. No Duplicate Name Check on Rename
If a user renames "CARDAMOM" to "CINNAMON" and "CINNAMON" already exists, the products table has a unique constraint on `(name, shop_id)` that will throw an error — but the error message is generic ("Failed to update product"). Should check upfront and return a clear message.

### 3. Stock Edit is Unaudited
When stock is changed via the Edit dialog (e.g., from 50kg to 45kg), it directly sets `current_stock` on the product without creating an adjustment receipt. This means the 5kg difference is invisible in transaction history — no audit trail.

**Fix**: When `new_stock` differs from current stock, create an "adjustment" receipt to record the change.

### 4. Minor: `handleDeleteItem` Deletes Receipt Items but Leaves Orphan Receipts
Deleting all `receipt_items` for an item can leave receipts with zero items (if a receipt only had that one item). These orphan receipts still appear in the Receipts page.

**Fix**: After deleting receipt_items, clean up any receipts that now have zero items.

## Changes

| File | Change |
|------|--------|
| `supabase/functions/manage-receipt/index.ts` | 1. Scope receipt_items rename/delete by shop via receipts join. 2. Add duplicate name check in rename. 3. Create adjustment receipt when stock changes. 4. Clean up orphan receipts after item deletion. |

## Implementation Details

### handleRenameItem fixes
```typescript
// Check for duplicate name
if (old_name !== new_name) {
  const { data: existing } = await db.from("products")
    .select("id").eq("name", new_name).eq("shop_id", shopId).maybeSingle();
  if (existing) return jsonResponse({ error: `Product "${new_name}" already exists` }, 400);
}

// Scope receipt_items by shop: get receipt IDs first
const { data: shopReceipts } = await db.from("receipts")
  .select("id").eq("shop_id", shopId);
const receiptIds = (shopReceipts || []).map(r => r.id);
if (receiptIds.length > 0) {
  await db.from("receipt_items").update({ item_name: new_name })
    .eq("item_name", old_name).in("receipt_id", receiptIds);
}

// If stock changed, create adjustment receipt
if (new_stock !== undefined && new_stock !== product.current_stock) {
  // insert adjustment receipt with qty = difference
}
```

### handleDeleteItem fixes
```typescript
// Get shop receipt IDs, delete only those receipt_items
// Then clean up receipts with zero remaining items
```

