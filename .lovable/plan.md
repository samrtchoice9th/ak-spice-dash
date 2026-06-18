## Fixes

### 1. Sales/Purchase "Print" button uses wrong template

`src/components/sales/SaveSuccessModal.tsx` currently calls `printToRawBT` (Android-only) for the Print button, and the PDF button uses its own template that reads `shop_name` from user metadata (falls back to "My Shop"). That's why the receipt printed from Sales/Purchase is missing the AK SPICE TRADING header, address, mobile, and the boxed totals — while reprints from the Receipt page (which use `printDesktopReceipt`) look correct.

**Fix:** Route the Print button through the same unified handler used by the Receipt page so the same 80mm thermal template renders for both flows.

- Import `useReceiptPrintHandler` in `SaveSuccessModal.tsx`.
- Build a receipt-shaped object from `savedRows`:
  ```
  {
    id: <stable id, e.g. crypto.randomUUID()>,
    items: savedRows.map(r => ({ id, itemName: r.name, qty, price, total })),
    totalAmount: grandTotal,
    type,
    date: <en-GB Asia/Colombo>,
    time: <en-GB Asia/Colombo>,
  }
  ```
- Replace `handlePrint` to call `printReceipt(receiptObj)` from the handler. This auto-routes Android → RawBT, Desktop → `printDesktopReceipt` (the same template as reprint, with AK SPICE TRADING header, address lines, Mob, divider, item table, boxed total, "Items: N", thank-you footer).
- Remove the separate `handlePrintPDF` HTML template (or repoint the PDF button to the same `printReceipt`). Keeping one source of truth prevents this divergence from reoccurring.

### 2. Address line "36" → "86"

In `src/utils/printReceipt.ts`, update `SHOP_INFO.addressLines[0]`:

```
addressLines: ['86, In Front of Tile Factory', 'Mahiyangana']
```

This is the single source for both desktop HTML and RawBT ESC/POS, so all paths update.

### 3. "Print preview / XPrinter settings page opens" — direct print

The screen the user sees is the **browser's print dialog** (Chrome/Edge), not our app. Web browsers do not allow JavaScript to bypass this dialog for security reasons. There is no code change that can make `window.print()` skip it on a normal Chrome/Edge install.

Two practical options to truly skip the dialog on the Windows desktop:

- **Option A (recommended, no code change):** Launch Chrome with kiosk printing once. Create a desktop shortcut to:
  ```
  chrome.exe --kiosk-printing --app=https://<app-url>
  ```
  With `--kiosk-printing`, `window.print()` sends straight to the system default printer with no dialog. Set XPrinter XP-80C as the Windows default printer and 80mm paper in its driver. Our iframe-based `printDesktopReceipt` already triggers `window.print()` immediately, so this works out of the box.
  &nbsp;

The plan will document Option A in the Settings → Printer instructions tab (text-only update) so the user has a reference.

## Files to edit

- `src/utils/printReceipt.ts` — change `36` to `86` in `SHOP_INFO.addressLines`.
- `src/components/sales/SaveSuccessModal.tsx` — replace `handlePrint` to use `useReceiptPrintHandler().printReceipt(receiptObj)` built from `savedRows`; remove/redirect the divergent PDF template; drop unused `printToRawBT` import and `shopName/shopPhone/shopAddress` metadata fallbacks.
- `src/pages/Settings.tsx` — add a short note under the Printer tab explaining the Chrome `--kiosk-printing` shortcut for one-click silent printing on Windows.

## Out of scope

- No backend, DB, or RawBT/ESC-POS logic changes beyond the address string.
- No changes to receipt edit, stock, or accounting flows.