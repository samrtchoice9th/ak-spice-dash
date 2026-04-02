

# Sales/Purchase Item Search & Stock Adjustment — Code Review

## Findings

### Sales & Purchase `ItemSearch.tsx` — Working correctly
- Debounced (300ms) async search from `ProductsContext`
- Shows item name + price in dropdown
- Auto-fills name, price, qty on select, then focuses qty field
- Keyboard navigation (ArrowUp/Down/Enter) works
- Outside click closes dropdown
- No bugs found

### Stock Adjustment — Two issues found

**Issue 1: `useItemDropdown.ts` — Infinite re-render risk (Performance bug)**

Line 12: `const itemNames = products.map(product => product.name)` creates a new array on every render. This array is in the `useEffect` dependency on line 20, causing the filter to re-run on every single render — not just when `value` changes. With many products, this causes unnecessary CPU work and potential lag.

**Fix**: Memoize `itemNames` with `useMemo`.

**Issue 2: Stock Adjustment dropdown shows ALL items when field is empty**

Unlike `ItemSearch` (Sales/Purchase) which hides the dropdown when the input is empty, `useItemDropdown` filters with `"".includes("")` which returns `true` — so opening the dropdown shows the entire product list unfiltered. For large inventories this is slow and overwhelming.

**Fix**: Return empty list when value is empty, matching the Sales/Purchase behavior.

## Changes

| File | Change |
|------|--------|
| `src/hooks/useItemDropdown.ts` | Memoize `itemNames`, skip filter when value is empty |

## Technical Detail

```typescript
// Before (line 12-20):
const itemNames = products.map(product => product.name); // new array every render
useEffect(() => { ... }, [value, itemNames]); // runs every render

// After:
const itemNames = useMemo(() => products.map(p => p.name), [products]);
useEffect(() => {
  if (!value.trim()) { setFilteredItems([]); setIsOpen(false); return; }
  const filtered = itemNames.filter(item => item.toLowerCase().includes(value.toLowerCase()));
  setFilteredItems(filtered);
  setSelectedIndex(-1);
}, [value, itemNames]);
```

Two small fixes, one file changed.

