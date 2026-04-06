

# Inventory Page Audit — Issues & Fixes

## Critical Bugs

### 1. Products Missing from Inventory List (Data Bug)
`InventoryContext` builds inventory by iterating **receipts first**, then enriching with product data. Since receipts are now **month-filtered**, any product with zero receipts in the selected month **won't appear at all** in the inventory list. A product with 100kg stock but no transactions this month = invisible.

**Fix**: Build inventory starting from the `products` table as the base, then enrich with receipt totals. Every product always appears.

### 2. Total Purchased / Total Sold Only Shows Current Month (Data Bug)
Since `receipts` array is month-filtered, `totalPurchased` and `totalSold` only reflect the current month — not all-time totals. This is misleading. The column headers say "Total Purchased" / "Total Sold" but show monthly data.

**Fix**: Since we can't fetch all receipts (performance), use the products table for stock/avg_cost (already correct) and either: (a) remove totalPurchased/totalSold columns, or (b) rename them to "This Month Purchased/Sold", or (c) fetch all-time totals from a DB query. Option (b) is simplest and most honest.

### 3. Edit Dialog Missing Duplicate Name Check
Same bug that was fixed in Settings — user can rename an item to an existing name, causing duplicates.

### 4. No Enter Key Support in Edit Dialog

### 5. No Search/Filter for Large Inventories
No way to find a specific item quickly.

### 6. Computations Not Memoized
`totalInventoryValue`, `lowStockItems`, and `inventory.filter(item => item.currentStock > 0)` run on every render.

## Plan

### Fix 1: Rebuild InventoryContext — Products-First Approach
Start from `products` array. Every product gets an entry. Then layer receipt data on top for monthly purchased/sold figures.

```typescript
const inventory = useMemo(() => {
  const itemMap = new Map<string, InventoryItem>();
  
  // Step 1: Every product gets an entry
  for (const p of products) {
    itemMap.set(p.name, {
      itemName: p.name,
      totalPurchased: 0,
      totalSold: 0,
      currentStock: p.current_stock,
      averagePurchasePrice: p.avg_cost ?? 0,
      totalPurchaseValue: 0,
      totalSalesValue: 0,
    });
  }
  
  // Step 2: Enrich with monthly receipt data
  receipts.forEach(receipt => { ... });
  
  return Array.from(itemMap.values()).sort(...);
}, [receipts, products]);
```

### Fix 2: Rename Columns
- "Total Purchased" → "Purchased (Month)"
- "Total Sold" → "Sold (Month)"
- Mobile cards: same labels

### Fix 3: Add Duplicate Name Check to Edit
Check `products.some(p => p.name.toLowerCase() === editName.trim().toLowerCase() && p.name !== editingItem)` before saving.

### Fix 4: Add Enter Key Support
Add `onKeyDown` handler to edit inputs.

### Fix 5: Add Search Filter
Add search input above the inventory table with `useMemo` filtering.

### Fix 6: Memoize Summary Computations
Wrap `totalInventoryValue`, `lowStockItems`, and in-stock count in `useMemo`.

## Files Changed

| File | Change |
|------|--------|
| `src/contexts/InventoryContext.tsx` | Products-first inventory building |
| `src/pages/Inventory.tsx` | Duplicate check, Enter key, search filter, memoize summaries, rename column headers |

