

# Mobile-First UI/UX Audit & Fix — AK SPICE POS

## Audit Findings

### Already Good
- Sales/Purchase pages: card-based mobile layout, 44px touch targets, sticky TotalBar, overflow-visible
- Customers/Suppliers pages: card-based lists, proper spacing, touch-friendly
- CustomerDetail/SupplierDetail: responsive grid, proper padding
- TopNavigation: scrollable bottom nav with role-based filtering
- PaymentSection: responsive grid layout

### Issues Found

| # | Page/Component | Problem | Severity |
|---|----------------|---------|----------|
| 1 | **ReceiptsTable** | Full `<table>` on mobile — cramped action buttons (4 buttons in a row), no card view | Critical |
| 2 | **Inventory page** | Full `<table>` on mobile — 8 columns, horizontal scroll required, tiny edit/delete buttons (p-1) | Critical |
| 3 | **Settings (Items tab)** | Full `<table>` on mobile, tiny action buttons | High |
| 4 | **StockAdjustment** | Uses old DataTable with full table layout, no mobile card view | High |
| 5 | **Hardcoded colors** | Dashboard, DashboardStats, ReceiptSummaryCards, ReceiptsTable, Inventory, Settings all use `bg-white`, `text-gray-800` instead of `bg-card`, `text-foreground` — breaks dark mode | Medium |
| 6 | **Receipt page padding** | Uses `p-4 sm:p-6 lg:p-8` — excessive on mobile | Low |
| 7 | **Inventory action buttons** | `p-1` with 16px icons = ~26px touch target, below 44px minimum | High |

## Plan

### 1. ReceiptsTable → Mobile Card View
- Detect `isMobile` via `useIsMobile()`
- On mobile: render each receipt as a card showing type badge, date, amount, due status
- Action buttons as icon-only row with `h-10 w-10` (44px) touch targets
- Keep desktop table unchanged

### 2. Inventory Page → Mobile Card View
- On mobile: render each item as a card with name, stock, value, status badge
- Edit/Delete as `h-10 w-10` icon buttons
- Summary cards: `grid-cols-2` (already done, just fix colors)

### 3. Settings Items Tab → Mobile Card View
- On mobile: product cards instead of table rows
- Touch-friendly edit/delete buttons

### 4. StockAdjustment Mobile Layout
- The page uses the old `DataTable` component which renders a plain table
- Add mobile detection and card-based row rendering in `TableRowComponent`

### 5. Fix Hardcoded Colors (Theme Tokens)
- Replace `bg-white` → `bg-card`, `text-gray-800` → `text-foreground`, `text-gray-900` → `text-foreground`, `border-gray-200` → `border-border`, `text-gray-600` → `text-muted-foreground` across:
  - `DashboardStats.tsx`
  - `ReceiptSummaryCards.tsx`
  - `ReceiptsTable.tsx`
  - `Inventory.tsx`
  - `Settings.tsx`
  - `Dashboard.tsx`
  - `ReceiptPage.tsx`
  - `DataTableContainer.tsx`

### 6. Increase Touch Targets
- Inventory: edit/delete buttons → `h-10 w-10` with `p-2`
- Settings: same treatment
- ReceiptsTable: action buttons → icon-only `h-10 w-10` on mobile

## Files Changed

| File | Change |
|------|--------|
| `src/components/ReceiptsTable.tsx` | Add mobile card view, fix colors, 44px buttons |
| `src/pages/Inventory.tsx` | Add mobile card view, fix colors, 44px buttons |
| `src/pages/Settings.tsx` | Add mobile card view for items tab, fix colors |
| `src/components/DashboardStats.tsx` | Replace hardcoded colors with theme tokens |
| `src/components/ReceiptSummaryCards.tsx` | Replace hardcoded colors with theme tokens |
| `src/pages/Dashboard.tsx` | Fix hardcoded colors |
| `src/pages/ReceiptPage.tsx` | Fix padding for mobile |
| `src/components/DataTableContainer.tsx` | Fix hardcoded colors |
| `src/components/TableRow.tsx` | Add mobile card layout for stock adjustment |
| `src/components/TableHeader.tsx` | Hide on mobile when card view active |

No backend or database changes required.

