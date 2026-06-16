# Remove Bluetooth Printing; Add Desktop Thermal Print for XPrinter XP-80T

## Goal

- Android → RawBT intent printing (kept).
- Windows / Desktop → browser print to XPrinter XP-80T (80mm USB) via system print dialog.
- One **Print** button per receipt that auto‑routes by device.
- No Bluetooth code anywhere. No randomly generated invoice numbers at print time.

## What to remove (Bluetooth — gone completely)

1. **Delete** `src/hooks/useThermalPrinter.ts` (entire Web Bluetooth GATT flow).
2. `**src/pages/Settings.tsx**` — strip everything Bluetooth:
  - Remove `Bluetooth` icon import, `BluetoothDevice` / `BluetoothRemoteGATTServer` declarations.
  - Remove state: `printerConnection`, `bluetoothDevices`, `showBluetoothDialog`, `selectedDevice`, and any related setters.
  - Remove functions: `scanForBluetoothDevices`, connect/disconnect handlers, the `useEffect` that reads `selectedBluetoothPrinter`.
  - Remove the entire "Printer Connection" card (Bluetooth / Wifi / Cable selector and the Bluetooth device list dialog).
  - Remove every `localStorage` reference to `selectedBluetoothPrinter`.
  - Replace the card with a small static info block: "Desktop: prints directly to USB thermal printer (XPrinter XP‑80T). Android: uses the RawBT app." (No connection / pairing UI.)

## New / changed printing pipeline

### `src/utils/printReceipt.ts`

- **Add** `printDesktopReceipt(receipt)` — opens a hidden iframe (or new window as fallback), writes the 80mm thermal HTML, calls `window.print()`, then cleans up. Uses the receipt's saved `invoiceNumber`, `date`, `time` — never generates new values.
- **Add** `getInvoiceNumber(receipt)` helper — returns `receipt.invoiceNumber` if present, otherwise derives a stable `INVM-XXXXXX` from `receipt.id.slice(-6).toUpperCase()`. Used by every print path. No `Math.random()` anywhere.
- Existing `printToRawBT(...)` stays but is updated to:
  - Use `getInvoiceNumber(receipt)` instead of the random generator.
  - Use `receipt.date` / `receipt.time` as passed in (already does for new prints; ensure reprint path passes stored values).

### `src/components/ReceiptPrintHandler.tsx`

- Drop the dual `printReceiptNative` / `printToRawBT` exposure. Expose a single entry:
  ```
  const printReceipt = (receipt) => {
    if (/Android/i.test(navigator.userAgent)) return printToRawBT(receipt);
    return printDesktopReceipt(receipt);
  };
  ```
- Remove the inline random `invoiceNumber` generation in `printReceiptNative` and the second copy in `printToRawBT`; both now read from `getInvoiceNumber(receipt)`.
- `PrintPreviewComponent` still wraps `PrintPreviewDialog`; "Print Receipt" button calls the unified `printReceipt`.

### `src/components/PrintPreviewDialog.tsx`

- Remove the `Math.random()` invoice generator. Use `getInvoiceNumber(receipt)` and `receipt.date` / `receipt.time` from props. Preview now matches what will print.

### `src/components/ReceiptsTable.tsx`

- Replace the separate `RawBT` button (desktop + mobile) with a single **Print** button that calls the unified handler. Drop the `onRawBTPrint` prop — `onPrint` is the only print entry. Icon: `Printer` (desktop) / keep `Smartphone` only if you prefer; one button either way.

### `src/pages/ReceiptPage.tsx`

- Use the unified handler. Pass only `onPrint={printReceipt}` to `ReceiptsTable`. Remove `printToRawBT` destructure and the `onRawBTPrint` prop.

## Thermal CSS (used by `printDesktopReceipt`)

```css
@page { size: 80mm auto; margin: 0; }
body  { width: 80mm; margin: 0; padding: 2mm; font-family: monospace; font-size: 11px; line-height: 1.3; color: #000; background: #fff; }
.center { text-align: center; }
.row    { display: flex; justify-content: space-between; }
.divider{ border-top: 1px dashed #000; margin: 2mm 0; }
.bold   { font-weight: bold; }
.total  { font-size: 13px; font-weight: bold; text-align: center; margin: 2mm 0; }
```

Layout (80mm safe, no horizontal scroll):

```
        SHOP NAME           (bold, centered)
       phone / address      (centered, smaller)
   ─────────────────────
   Invoice: INVM-XXXXXX
   Date: <receipt.date>  Time: <receipt.time>
   ─────────────────────
   ITEM           QTY PRICE  AMT
   ─────────────────────
   <item rows, name left, qty + price + amount right>
   ─────────────────────
   TOTAL: Rs. <amount>
   Items: <n>
   ─────────────────────
   Thank you for your business!
```

## Out of scope

- No DB schema changes; `invoiceNumber` continues to be derived from `receipt.id` (deterministic per project memory).
- No changes to receipts/inventory logic, edit dialog, or stock adjustment.
- No new dependencies.

## Files touched

- delete: `src/hooks/useThermalPrinter.ts`
- edit:   `src/utils/printReceipt.ts`
- edit:   `src/components/ReceiptPrintHandler.tsx`
- edit:   `src/components/PrintPreviewDialog.tsx`
- edit:   `src/components/ReceiptsTable.tsx`
- edit:   `src/pages/ReceiptPage.tsx`
- edit:   `src/pages/Settings.tsx` (Bluetooth UI + logic removed)