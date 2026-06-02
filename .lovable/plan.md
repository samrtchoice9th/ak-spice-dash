## Goal
Extend the Report page so users can view sales/purchase totals for **last month** in addition to Today, This Week, and All Time.

## Changes (frontend only — `src/pages/Report.tsx`)

1. **Extend `DateFilter` type**
   - Add `'month'` (current month) and `'lastMonth'` options.
   - New type: `'today' | 'week' | 'month' | 'lastMonth' | 'all'`.

2. **Update filter logic in `filteredReports` useMemo**
   - `month`: `startOfMonth(now)` → `endOfMonth(now)` (using `date-fns`).
   - `lastMonth`: `startOfMonth(subMonths(now, 1))` → `endOfMonth(subMonths(now, 1))`.

3. **Cross-month data fetch**
   - `useReceipts` currently only loads the current month. When the user picks **Last Month**, call `refreshReceipts(year, month-1)` so the data is actually present.
   - When switching back to Today/This Week/Month, reload current month.
   - "All Time" stays as-is (still bounded by what's loaded; acceptable since `getAllReceipts` isn't wired into context — out of scope).

4. **Update the Select dropdown**
   - Add `<SelectItem value="month">This Month</SelectItem>`
   - Add `<SelectItem value="lastMonth">Last Month</SelectItem>`
   - Order: Today → This Week → This Month → Last Month → All Time.

5. **Header label**
   - Show the active period under the title (e.g. "Last Month — Nov 2025") so the user knows which range they're looking at.

## Out of scope
- Backend changes, new tables, audit logs.
- Custom date-range picker (can add later if requested).
- Changing All Time to load beyond what context provides.

## Technical notes
- All work in `src/pages/Report.tsx`.
- Use `date-fns` helpers already in the project: `startOfMonth`, `endOfMonth`, `subMonths`, `format`.
- Trigger `refreshReceipts(y, m)` inside a `useEffect` keyed on `dateFilter`.
