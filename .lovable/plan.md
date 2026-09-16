# Report Page — Year & Month Picker

## Goal
Add a Year selector and a Month selector to the Report page. Picking a year + month shows every day of that month with daily sales and purchase totals.

## Changes (all in `src/pages/Report.tsx`)

1. **Year + Month dropdowns**
   - New `selectedYear` and `selectedMonth` state (default: current year/month).
   - Year select: range from 2024 to current year.
   - Month select: all 12 months by name.
   - Placed next to the existing quick-filter dropdown in the header.

2. **How the two controls work together**
   - Changing year or month switches the page into "custom month" mode: it fetches that month via `refreshReceipts(year, month)` and the daily table covers that whole month.
   - Changing the quick filter (Today / This Week / This Month / Last Month) takes over again as before; the year/month pickers sync to match (e.g. Last Month sets pickers to last month).

3. **Every-day-of-month table**
   - When a year + month is selected, the table lists **all days** of that month (1st → last day), newest first.
   - Days with no transactions show `Rs 0.00`, so the full month is visible at a glance.

4. **Summary cards** continue to show total sales / purchases for the selected month, matching the table.

## Technical details
- `refreshReceipts(year, month)` already exists in `ReceiptsContext` and fetches exactly one month — reused as-is; no backend changes.
- Data is grouped by `receipt.date` (Sri Lanka time stored values) into a `yyyy-MM-dd` map, then merged onto the full list of days in the month (`eachDayOfInterval` from date-fns).
- Quick filters "Today" and "This Week" still filter the currently loaded current month only (existing behavior, unchanged).
- Loading spinner behavior stays the same while a new month loads.
