

# Receipt Page: Month Filter + Load Optimization

## Current State
- `receiptService.getAllReceipts()` fetches up to 5,000 receipts at once
- No month/date filter — all receipts load every time
- Summary cards and table show everything unfiltered

## Plan

### 1. Add Month Picker to ReceiptPage
- Add a month/year selector (default: current month) at the top of the page
- Use two state variables: `selectedMonth` (0-11) and `selectedYear`
- Pass selected month to both `ReceiptSummaryCards` and `ReceiptsTable`

### 2. Add `getReceiptsByMonth()` to receiptService
- New method that filters by `date` column using `.gte()` and `.lt()` on the first and last day of the selected month
- Limit to 3,000 receipts per month query (more than enough)
- Remove the 5,000 global fetch — only fetch the selected month

### 3. Update ReceiptsContext
- Add `fetchReceiptsByMonth(year, month)` method
- Keep `receipts` state but populate it with month-filtered data
- `refreshReceipts` becomes `refreshReceipts(year?, month?)` — defaults to current month

### 4. Summary Cards Update
- Summary cards compute from the filtered (monthly) receipts — automatically shows selected month totals

### 5. ReceiptsTable
- No changes needed — it already renders whatever `receipts` array it receives

## Files Changed

| File | Change |
|------|--------|
| `src/pages/ReceiptPage.tsx` | Add month/year picker, pass filter to context |
| `src/services/receiptService.ts` | Add `getReceiptsByMonth(year, month)` with date range filter, limit 3000 |
| `src/contexts/ReceiptsContext.tsx` | Update `refreshReceipts` to accept year/month params, fetch filtered data |

