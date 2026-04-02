

# Fix: Item Search Dropdown Hidden Behind Other Rows

## Problem
The search dropdown (z-50) gets clipped/hidden behind subsequent table rows. The `<tr>` elements with `focus-within:bg-accent/30` and the table's `overflow-hidden` on the wrapper create stacking contexts that prevent the dropdown from rendering above sibling rows.

## Root Cause
In `Sales.tsx` and `Purchase.tsx`, the desktop table wrapper has `overflow-hidden`:
```html
<div className="border rounded-lg overflow-hidden bg-card">
```
This clips the absolutely-positioned dropdown inside any `<td>`.

## Fix (2 changes)

### 1. `src/pages/Sales.tsx` — Remove `overflow-hidden` from table wrapper
Change `overflow-hidden` to `overflow-visible` so the dropdown can escape the table bounds.

### 2. `src/pages/Purchase.tsx` — Same change
Apply identical fix.

Both files: change `"border rounded-lg overflow-hidden bg-card"` to `"border rounded-lg overflow-visible bg-card"`.

