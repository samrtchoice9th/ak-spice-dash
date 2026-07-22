
# Receipt Page — 100 Default + Preserve Position on Edit

## Changes

### 1. Default page size 50 → 100
`src/components/ReceiptsTable.tsx`
- `PAGE_SIZE = 100`
- "Load More" already exists; increments by 100.

### 2. Preserve scroll + highlight edited receipt
`src/pages/ReceiptPage.tsx`
- After `handleSaveReceipt` completes successfully, set `highlightId = receipt.id` (new state). Clear it after 3s via `setTimeout`.
- Do NOT reset scroll: the ScrollArea already keeps its scrollTop across re-renders because the list is not remounted. Currently, though, the edit dialog closes before `refreshReceipts` resolves — the flow already keeps the same table mounted, so scroll is preserved. Confirm by not remounting the ScrollArea (no key changes).
- Pass `highlightId` prop into `<ReceiptsTable>`.

`src/components/ReceiptsTable.tsx`
- Accept optional `highlightId?: string | null`.
- Ensure the highlighted row is within `visibleCount`; if its index ≥ `visibleCount`, bump `visibleCount` so it renders (useEffect on `highlightId`).
- Apply `bg-green-100/60 dark:bg-green-900/30 transition-colors duration-500` to the matching desktop row and mobile card while `highlightId === receipt.id`.
- Optionally scroll the highlighted row into view with `scrollIntoView({ block: 'nearest' })` — only if it wasn't already visible. Keep behavior minimal to avoid jumping.

### 3. Toast confirmation
Already handled via existing sonner toast on save. Add message "Receipt updated" if not present in `handleSaveReceipt`.

## Files Changed
| File | Change |
|------|--------|
| `src/components/ReceiptsTable.tsx` | PAGE_SIZE=100; accept `highlightId`; highlight row 3s; ensure visible |
| `src/pages/ReceiptPage.tsx` | Track `highlightId`, set on save, clear after 3s; pass to table |

No backend or context changes.
