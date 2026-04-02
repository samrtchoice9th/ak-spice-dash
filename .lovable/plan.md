

# Sales POS UI + Logic Upgrade

## Overview
Replace the current Sales page (which uses the generic `DataTable` component) with a dedicated, fast POS-style interface. New sales-specific components with memoized rows, async item search, sticky total bar, localStorage draft, validation, and a post-save print modal.

## New Files

### `src/hooks/useSalesData.ts` -- Sales state management
- Structured row state: `{ id, item_id, name, qty, price, total }`
- `addRow()`, `deleteRow(id)`, `duplicateRow(id)`, `updateRow(id, field, value)`
- Auto-calc `total = qty * price` on qty/price change
- `grandTotal` via reduce, `distinctItems` count
- Keyboard handler: Enter moves itemName->qty->price->next row (adds row if last)
- Validation: returns `errors` map (row ID -> field -> message). Blocks save if name empty, qty <= 0, or price <= 0
- localStorage draft: save to `pos-sales-draft` on every row change, restore on mount, clear on save
- Save: reuses `addReceipt` + `updateStock` from existing contexts, same logic as current `useTableData`

### `src/components/sales/ItemSearch.tsx` -- Async autocomplete
- Uses `useProducts()` context (already loaded from Supabase)
- 300ms debounced filter on product list
- Dropdown shows item name + price per item
- On select: sets name, price from product, qty = 1, returns focus ref key for qty
- Arrow key + Enter navigation in dropdown
- Replaces `ItemSearchDropdown` for sales only

### `src/components/sales/SalesRow.tsx` -- Memoized row component
- Wrapped in `React.memo`, only re-renders when its row data or errors change
- Desktop: table row with Item Search | Qty (with +/- stepper buttons) | Price | Total | Actions (delete/duplicate)
- Mobile: card layout with larger touch-friendly inputs
- Qty input: allows decimals (step=0.01), +/- buttons, red border + inline error on validation fail
- Active row highlight: light blue background on `focus-within`
- Delete and duplicate icon buttons per row

### `src/components/sales/TotalBar.tsx` -- Sticky bottom bar
- `fixed bottom-0` with z-index, always visible
- Shows: items count (left), grand total in large font (center), Save button (right)
- Save button disabled during save or when validation errors exist

### `src/components/sales/SaveSuccessModal.tsx` -- Post-save modal
- After successful save, shows dialog: "Sale saved successfully!"
- Two buttons: "Print Receipt" (triggers existing thermal print via `printToRawBT`) and "Close"
- No print button in main UI -- print only offered after save

### `src/pages/Sales.tsx` -- Rewritten page
- Uses `useSalesData` hook
- Renders list of `SalesRow` components with ref-based keyboard navigation
- `TotalBar` at bottom
- `SaveSuccessModal` shown after save
- `pb-24` padding to clear sticky bar
- No `DataTable` usage

## Unchanged Files
- `Purchase.tsx` continues using `DataTable` (no changes)
- `StockAdjustment.tsx` unchanged
- All contexts, services, print utilities unchanged
- `DataTable.tsx`, `TableRow.tsx`, `ActionButtons.tsx` kept for Purchase/Adjustment use

## Technical Details

**Performance**: `React.memo` on `SalesRow` with stable `useCallback` handlers. Debounced search avoids filtering on every keystroke.

**Validation schema** (inline, not zod -- keeps it lightweight for per-keystroke checks):
```text
name: required (non-empty after trim)
qty: must be > 0
price: must be > 0
```
Red border + small error text below invalid fields. Save button checks all rows.

**localStorage draft format**:
```json
{ "rows": [...], "timestamp": 1234567890 }
```
Restored on mount if < 24 hours old. Cleared on successful save.

**Qty stepper**: [-] button decrements by 0.25, [+] increments by 0.25. Manual input allows any decimal.

## Execution Order
1. Create `useSalesData` hook
2. Create `ItemSearch` component
3. Create `SalesRow` component
4. Create `TotalBar` component
5. Create `SaveSuccessModal` component
6. Rewrite `Sales.tsx`

