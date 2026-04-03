

# Fix: Dropdown Reopens After Item Selection

## Root Cause

When the user selects an item from the dropdown:
1. `selectItem()` calls `setIsOpen(false)` — dropdown closes
2. `onSelect()` updates the parent's `value` to the selected product name (e.g., "COCO SEEDS")
3. The `useEffect` on `value` triggers a 300ms debounce
4. After 300ms, the filter runs — "COCO SEEDS" matches itself in the product list
5. `setIsOpen(true)` fires — **dropdown reopens**

This is why the dropdown reappears showing the selected item after selection.

## Fix — `src/components/sales/ItemSearch.tsx`

Add a ref flag `justSelected` that suppresses the debounced reopening after a selection:

1. Add `const justSelectedRef = useRef(false);`
2. In `selectItem`: set `justSelectedRef.current = true` before closing
3. In the debounce callback: if `justSelectedRef.current` is true, reset it and skip setting `isOpen(true)`

This is a 3-line addition to one file.

