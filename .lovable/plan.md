

# Receipt Page Audit — Issues & Performance Improvements

## Bugs Found

### 1. `now` is re-created every render (stale comparison)
`const now = new Date()` on line 16 of `ReceiptPage.tsx` creates a new Date on every render. The `isCurrentMonth` check works but `now` is not stable — minor issue, but wasteful.

### 2. Missing `refreshReceipts` in useEffect dependency array
Line 25-27: `useEffect` depends on `selectedYear` and `selectedMonth` but not `refreshReceipts`. React will warn about missing deps. Since `refreshReceipts` is a `useCallback` with `[user]` dependency, it should be included.

### 3. Double fetch on mount
- `ReceiptsContext` fetches current month on mount (line 80-82)
- `ReceiptPage` useEffect also calls `refreshReceipts(selectedYear, selectedMonth)` immediately
- Result: **two identical API calls** on page load

### 4. `updateReceipt` in context calls `refreshReceipts()` without month params (line 99)
After editing a receipt, context calls `refreshReceipts()` with no args — fetches current month. Then `ReceiptPage.handleSaveReceipt` calls `refreshReceipts(selectedYear, selectedMonth)` again. That's **two fetches**, and the first one overwrites state with wrong month data if user is viewing a past month.

### 5. RawBT print uses random invoice number instead of receipt ID
Line 525: `printToRawBT` still generates a random invoice number, unlike the native print which was already fixed.

### 6. `printReceiptNative` uses `new Date()` instead of receipt's saved date/time
Lines 388-389: Native print shows current date/time (`formattedDate`, `formattedTime`) instead of the receipt's `receipt.date` and `receipt.time`. The preview content (line 169-170) correctly uses `receipt.date`/`receipt.time`, but the actual print function does not.

### 7. Hardcoded colors in EditReceiptDialog
Lines 142 and 170: `text-gray-800` and `text-gray-500` instead of theme tokens (`text-foreground`, `text-muted-foreground`).

### 8. ReceiptSummaryCards not memoized
With up to 3,000 receipts, `.filter()` runs on every render. Should use `useMemo`.

### 9. ReceiptsTable renders all rows at once
With 3,000 receipts, rendering 3,000 DOM nodes causes lag. No virtualization or pagination.

## Performance Improvements

### 10. Add receipt count display
Show "Showing X receipts" so user knows data loaded correctly.

### 11. Add search/filter within month
Users often need to find a specific receipt — add a simple text search by item name or amount.

## Plan

### Fix 1: Stable `now` reference + fix useEffect deps
Use `useMemo` for `now`, add `refreshReceipts` to useEffect deps.

### Fix 2: Remove double fetch
Remove the auto-fetch in `ReceiptsContext` mount effect. Let pages control when to fetch. Or skip the initial fetch if year/month params will come from the page.

### Fix 3: Fix `updateReceipt` in context
Pass through year/month params or remove the internal `refreshReceipts()` call since ReceiptPage already calls it after save.

### Fix 4: Fix RawBT invoice number
Use `receipt.id` like native print.

### Fix 5: Fix native print date/time
Use `receipt.date` and `receipt.time` instead of `new Date()`.

### Fix 6: Fix hardcoded colors in EditReceiptDialog
Replace `text-gray-800` → `text-foreground`, `text-gray-500` → `text-muted-foreground`.

### Fix 7: Memoize ReceiptSummaryCards
Wrap filter computations in `useMemo`.

### Fix 8: Add pagination to ReceiptsTable
Show 50 receipts per page with Load More or page buttons. This prevents DOM overload with 3,000 receipts.

### Fix 9: Add receipt count + search
Add a search input to filter by item name or amount within the loaded month.

## Files Changed

| File | Change |
|------|--------|
| `src/pages/ReceiptPage.tsx` | Fix double fetch, stable now, useEffect deps |
| `src/contexts/ReceiptsContext.tsx` | Remove redundant refresh in updateReceipt |
| `src/components/ReceiptPrintHandler.tsx` | Fix RawBT invoice number, fix native print date/time |
| `src/components/EditReceiptDialog.tsx` | Fix hardcoded colors |
| `src/components/ReceiptSummaryCards.tsx` | Add useMemo for filters |
| `src/components/ReceiptsTable.tsx` | Add pagination (50 per page), search filter, receipt count |

