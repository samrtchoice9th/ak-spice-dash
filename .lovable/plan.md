

# Purchase Page POS Upgrade + Mobile-First UI for All Pages

## Overview
Two tasks: (1) Rewrite the Purchase page to match the Sales POS-style UI (memoized rows, item search, sticky total bar, validation, localStorage draft, success modal). (2) Apply mobile-first improvements across all pages.

## 1. Purchase Page -- Match Sales POS Style

### New files
- **`src/hooks/usePurchaseData.ts`** -- Clone of `useSalesData.ts` with `type: 'purchase'`, draft key `pos-purchase-draft`, and stock update using `'purchase'` type
- **`src/components/purchase/PurchaseRow.tsx`** -- Reuses `SalesRowComponent` pattern (React.memo, item search, qty stepper, price, total, delete/duplicate). Can literally reuse `SalesRowComponent` by making it generic, OR create a thin wrapper. Simplest: reuse `SalesRowComponent` directly since the UI is identical.
- **`src/components/purchase/SaveSuccessModal.tsx`** -- Same as sales version but says "Purchase saved successfully"

### Rewritten `src/pages/Purchase.tsx`
- Uses `usePurchaseData` hook (same interface as `useSalesData`)
- Renders `SalesRowComponent` rows (same component reused)
- `TotalBar` at bottom with "Purchase" context
- `SaveSuccessModal` after save
- No longer uses `DataTable` component

### Implementation approach
Rather than duplicating all sales components, make `useSalesData` accept a `type` parameter:
- Rename to a generic hook or add `type` param: `usePOSData(type: 'sales' | 'purchase')`
- Draft key changes based on type
- Stock update type changes based on type
- Everything else identical

This avoids code duplication. Files changed:
- **Rename `useSalesData.ts` → `usePOSData.ts`** with a `type` parameter
- **Update `Sales.tsx`** to call `usePOSData('sales')`
- **Rewrite `Purchase.tsx`** to use `usePOSData('purchase')` + same SalesRow/TotalBar components
- **Create `src/components/purchase/PurchaseSuccessModal.tsx`** or make `SaveSuccessModal` accept a `type` prop for the title text

## 2. Mobile-First UI Updates (All Pages)

### `src/App.tsx` -- Layout
- Add `px-4 pt-2` padding to `<main>` on mobile for consistent spacing
- Ensure content doesn't overlap with TopNavigation

### `src/pages/Dashboard.tsx`
- Stack stat cards in single column on mobile (already `grid-cols-1` but add tighter spacing)
- Reduce heading size on mobile
- Make quick actions full width

### `src/pages/Report.tsx`
- Stack header + filter vertically on mobile (currently `flex justify-between` breaks on small screens)
- Make date filter full width on mobile
- Table cells: smaller padding, truncate long text
- Summary cards: single column on mobile

### `src/pages/Inventory.tsx`
- Already has responsive classes -- minor tweaks to padding
- Hide less important columns on mobile (already done with `hidden sm:table-cell`)

### `src/pages/ReceiptPage.tsx`
- Already has `p-4 sm:p-6` -- good
- Reduce title size on mobile

### `src/pages/Settings.tsx`
- Tab buttons: full width on mobile, stack vertically if needed
- Table: card layout on mobile instead of table rows

### `src/components/TopNavigation.tsx`
- Already mobile-only (`xl:hidden`) -- good as-is

### General mobile patterns to apply
- All page titles: `text-lg` on mobile, `text-2xl` on desktop
- Consistent `px-4` padding on mobile across all pages
- Touch targets minimum 44px
- No horizontal scroll on any page

## Execution Order
1. Create `usePOSData.ts` (generalized from `useSalesData`)
2. Update `Sales.tsx` to use `usePOSData('sales')`
3. Make `SaveSuccessModal` accept type prop
4. Rewrite `Purchase.tsx` with POS style
5. Mobile-first updates to Dashboard, Report, Inventory, ReceiptPage, Settings, App layout

## Files Changed Summary
| File | Action |
|------|--------|
| `src/hooks/usePOSData.ts` | New (generalized from useSalesData) |
| `src/hooks/useSalesData.ts` | Delete (replaced by usePOSData) |
| `src/pages/Sales.tsx` | Update import to usePOSData |
| `src/pages/Purchase.tsx` | Rewrite with POS components |
| `src/components/sales/SaveSuccessModal.tsx` | Add `type` prop |
| `src/pages/Dashboard.tsx` | Mobile spacing/sizing |
| `src/pages/Report.tsx` | Mobile-first layout |
| `src/pages/Settings.tsx` | Mobile card layout |
| `src/App.tsx` | Main content padding |

