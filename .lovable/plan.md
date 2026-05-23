# Sales Page Audit — Bugs & Fixes

## Issues Found

### 1. Paid Amount Not Capped (Bug — `PaymentSection.tsx`)
Input has `max={grandTotal}` but `onChange` only clamps min 0. User can enter Paid > Total. Due falls back to 0 via `Math.max`, but it's misleading and lets staff record overpayments silently.

### 2. Stale Item Search Dropdown on Refocus (Bug — `ItemSearch.tsx`)
After selecting an item, `filtered` state is **not cleared**. Refocusing the same input reopens the stale dropdown of the previous search (`onFocus={() => { if (filtered.length > 0) setIsOpen(true); }}`).

### 3. Hardcoded Shop Name "AK SPICE" in Receipt Print (Bug — `SaveSuccessModal.tsx`)
Both the PDF (`<h2>AK SPICE</h2>`) and WhatsApp text (`*AK SPICE*`) hardcode the shop name. Violates memory rule: "shop info from metadata". Also hardcodes date — should use the receipt's stored date.

### 4. Dead `onDuplicate` Prop (Cleanup — `Sales.tsx` / `SalesRow.tsx`)
`duplicateRow` is wired through props but there is **no UI button** to trigger it (only Delete remains). Either remove the prop chain or add the Copy button back.

### 5. localStorage Write on Every Keystroke (Perf — `usePOSData.ts`)
`useEffect(() => saveDraft(...), [rows])` runs synchronously on every keystroke. With 10+ rows this writes JSON to localStorage on every character typed. Should be debounced (~500ms).

### 6. Payment Fields Not Persisted in Draft (UX — `usePOSData.ts`)
Draft saves rows but not `paidAmount` / `dueDate` / `selectedContactId`. On reload, payment context is lost while items remain — confusing.

### 7. No Enter-to-Save / No keyboard shortcut on payment fields (UX)
On the last row, Enter creates a new empty row instead of offering to save. Also Enter inside Paid Amount input does nothing. Add Ctrl/Cmd+Enter (or Enter when row is complete and only one valid row exists) to trigger Save.

## Plan

### Fix 1: Cap Paid Amount
`PaymentSection.tsx` — clamp in onChange: `Math.min(grandTotal, Math.max(0, Number(e.target.value)))`.

### Fix 2: Clear stale dropdown on select
`ItemSearch.tsx` — in `selectItem`, also `setFiltered([])` and `setHighlightIdx(-1)`. Change `onFocus` guard to require both `filtered.length > 0` **and** `value.trim()` matches.

### Fix 3: Use shop metadata in success modal
`SaveSuccessModal.tsx` — read shop name/phone/address from the existing shop metadata source (same pattern as receipt-printing memory). Pass receipt date instead of `new Date()`.

### Fix 4: Remove dead duplicate prop
`SalesRow.tsx` + `Sales.tsx` — drop the `onDuplicate` / `duplicateRow` prop chain since no UI uses it. (Keep the hook function in `usePOSData` for future use.)

### Fix 5: Debounce draft writes
`usePOSData.ts` — wrap the `saveDraft` effect in a 500ms `setTimeout` with cleanup. Also debounce on `paidAmount`, `dueDate`, `selectedContactId` if added in Fix 6.

### Fix 6: Persist full POS state
`usePOSData.ts` — extend draft shape to `{ rows, paidAmount, dueDate, selectedContactId, timestamp }`. Restore all on mount.

### Fix 7: Save shortcut
`Sales.tsx` — add a `keydown` listener for Ctrl/Cmd+Enter that calls `handleSave` when not saving and no errors.

## Files Changed

| File | Change |
|------|--------|
| `src/components/sales/PaymentSection.tsx` | Cap paid amount at grandTotal |
| `src/components/sales/ItemSearch.tsx` | Clear filtered on select; refined onFocus guard |
| `src/components/sales/SaveSuccessModal.tsx` | Use shop metadata + receipt date instead of hardcoded values |
| `src/components/sales/SalesRow.tsx` | Remove unused `onDuplicate` prop |
| `src/hooks/usePOSData.ts` | Debounce draft writes; persist paid/due/contact in draft |
| `src/pages/Sales.tsx` | Drop dead duplicate prop; add Ctrl+Enter save shortcut |
