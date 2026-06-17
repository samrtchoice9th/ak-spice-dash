import { TableRow } from '@/types/table';
import { ReceiptItem, Receipt } from '@/contexts/ReceiptsContext';

// ---------- Helpers ----------

/** Stable invoice number derived from receipt id. Never random. */
export const getInvoiceNumber = (receipt: { id?: string; invoiceNumber?: string } | undefined | null): string => {
  if (!receipt) return 'INVM-000000';
  const anyR = receipt as any;
  if (anyR.invoiceNumber) return String(anyR.invoiceNumber);
  if (receipt.id) return `INVM-${receipt.id.slice(-6).toUpperCase()}`;
  return 'INVM-000000';
};

const SHOP_INFO = {
  name: 'AK SPICE TRADING',
  addressLines: ['36, In Front of Tile Factory', 'Mahiyangana'],
  phone: '0773962001',
};

const getShopInfo = () => SHOP_INFO;

// ---------- 80mm Thermal HTML for Desktop browser printing ----------

const THERMAL_CSS = `
  @page { size: 80mm auto; margin: 0; }
  html, body {
    margin: 0;
    padding: 0;
    background: #ffffff;
    color: #000000;
  }
  body {
    width: 80mm;
    margin: 0;
    padding: 3mm 2mm;
    font-family: 'Courier New', 'Courier', monospace;
    font-size: 13px;
    line-height: 1.35;
    color: #000000;
    font-weight: 700;
    text-rendering: geometricPrecision;
    -webkit-font-smoothing: none;
    -moz-osx-font-smoothing: auto;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  * {
    color: #000000 !important;
    font-weight: 700 !important;
    text-rendering: geometricPrecision;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .center { text-align: center; }
  .right  { text-align: right; }
  .bold   { font-weight: 900 !important; }
  .lg     { font-size: 15px; font-weight: 900 !important; }
  .xl     { font-size: 17px; font-weight: 900 !important; }
  .total  { font-size: 19px; font-weight: 900 !important; }
  .sm     { font-size: 12px; }
  .row    { display: flex; justify-content: space-between; gap: 4px; }
  .divider{ border-top: 2px solid #000000; margin: 2mm 0; }
  table   { width: 100%; border-collapse: collapse; }
  th, td  { padding: 1.2mm 0; font-size: 12px; vertical-align: top; color: #000000; }
  th      { text-align: left; border-bottom: 2px solid #000000; font-weight: 900 !important; }
  td      { border-bottom: 1px solid #000000; }
  td.num, th.num { text-align: right; }
  .item-name { word-wrap: break-word; max-width: 30mm; font-weight: 900 !important; }
  .total-box {
    border: 2px solid #000000;
    padding: 2mm;
    margin: 2mm 0;
    font-weight: 900 !important;
  }
  @media print {
    html, body { width: 80mm; }
    body { padding: 3mm 2mm; transform: none; zoom: 1; }
  }
`;

const buildThermalHtml = (receipt: any): string => {
  const shop = getShopInfo();
  const invoiceNumber = getInvoiceNumber(receipt);
  const date = receipt.date || '';
  const time = receipt.time || '';
  const items: ReceiptItem[] = receipt.items || [];
  const totalAmount = Number(receipt.totalAmount || 0);

  const itemsHtml = items.map(it => `
    <tr>
      <td class="item-name">${escapeHtml(it.itemName)}</td>
      <td class="num">${Number(it.qty)}</td>
      <td class="num">${Number(it.price).toFixed(2)}</td>
      <td class="num">${Number(it.total).toFixed(2)}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>${escapeHtml(shop.name)} - Receipt ${invoiceNumber}</title>
<style>${THERMAL_CSS}</style>
</head>
<body>
  <div class="center xl">${escapeHtml(shop.name.toUpperCase())}</div>
  ${shop.addressLines.map(l => `<div class="center sm">${escapeHtml(l)}</div>`).join('')}
  ${shop.phone ? `<div class="center sm">Mob: ${escapeHtml(shop.phone)}</div>` : ''}
  <div class="divider"></div>
  <div>Invoice: <span class="bold">${invoiceNumber}</span></div>
  <div class="row"><span>Date: ${escapeHtml(date)}</span><span>Time: ${escapeHtml(time)}</span></div>
  <div class="divider"></div>
  <table>
    <thead>
      <tr>
        <th>ITEM</th>
        <th class="num">QTY</th>
        <th class="num">PRICE</th>
        <th class="num">AMT</th>
      </tr>
    </thead>
    <tbody>${itemsHtml}</tbody>
  </table>
  <div class="divider"></div>
  <div class="center total-box total">TOTAL: Rs. ${totalAmount.toFixed(2)}</div>
  <div class="center">Items: ${items.length}</div>
  <div class="divider"></div>
  <div class="center">Thank you for your business!</div>
  <div class="center">Visit us again</div>
</body>
</html>`;
};

const escapeHtml = (s: string): string =>
  String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c] as string));

/**
 * Desktop browser thermal printing.
 * Renders the receipt in a hidden iframe using @page size: 80mm auto
 * and opens the system print dialog. Works with USB thermal printers
 * such as XPrinter XP-80C when 80mm paper is selected in the OS print dialog.
 */
export const printDesktopReceipt = (receipt: any): void => {
  if (!receipt || !receipt.items || receipt.items.length === 0) {
    alert('No items to print');
    return;
  }

  // Remove any pre-existing print iframe
  const existing = document.getElementById('thermal-print-frame');
  if (existing) existing.remove();

  const iframe = document.createElement('iframe');
  iframe.id = 'thermal-print-frame';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const html = buildThermalHtml(receipt);
  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) {
    alert('Failed to open print frame');
    iframe.remove();
    return;
  }
  doc.open();
  doc.write(html);
  doc.close();

  const triggerPrint = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (err) {
      console.error('Print failed:', err);
    }
    // Cleanup after a delay (afterprint may not fire on all browsers).
    const cleanup = () => {
      const f = document.getElementById('thermal-print-frame');
      if (f) f.remove();
    };
    iframe.contentWindow?.addEventListener?.('afterprint', cleanup);
    setTimeout(cleanup, 2000);
  };

  // Wait one frame to ensure DOM is laid out, then print.
  if (iframe.contentWindow?.document.readyState === 'complete') {
    setTimeout(triggerPrint, 50);
  } else {
    iframe.onload = () => setTimeout(triggerPrint, 50);
  }
};

// ---------- Existing utilities used by POS DataTable (kept) ----------

export const printReceipt = (
  rows: TableRow[],
  title: string,
  calculateTotal: () => number,
  addReceipt: (receipt: { type: 'purchase' | 'sales' | 'adjustment'; items: ReceiptItem[]; totalAmount: number }) => void,
  type: 'purchase' | 'sales' | 'adjustment',
  clearAllFields: () => void,
  showPreviewFirst: boolean = false,
  onShowPreview?: (receipt: any) => void,
) => {
  const receiptItems: ReceiptItem[] = rows
    .filter(row => row.itemName && row.qty > 0 && row.price > 0)
    .map(row => ({
      id: row.id,
      itemName: row.itemName,
      qty: row.qty,
      price: row.price,
      total: row.qty * row.price,
    }));

  if (receiptItems.length === 0) {
    alert('Please add items before printing receipt');
    return;
  }

  const total = calculateTotal();
  const now = new Date();
  const date = now.toLocaleDateString('en-GB', { timeZone: 'Asia/Colombo' });
  const time = now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Colombo' });

  addReceipt({ type, items: receiptItems, totalAmount: total });

  if (showPreviewFirst && onShowPreview) {
    onShowPreview({
      items: receiptItems,
      totalAmount: total,
      type,
      date,
      time,
    });
    clearAllFields();
    return;
  }

  printDesktopReceipt({ items: receiptItems, totalAmount: total, type, date, time });
  clearAllFields();
};

// ---------- RawBT (Android only) ----------

export const printToRawBT = (
  rowsOrReceipt: TableRow[] | any,
  titleOrUnused?: string,
  calculateTotal?: () => number,
  addReceipt?: (receipt: { type: 'purchase' | 'sales' | 'adjustment'; items: ReceiptItem[]; totalAmount: number }) => void,
  type?: 'purchase' | 'sales' | 'adjustment',
  clearAllFields?: () => void,
): boolean => {
  const isAndroid = /Android/i.test(navigator.userAgent);
  if (!isAndroid) {
    alert('RawBT printing is only available on Android devices');
    return false;
  }

  // Support two call shapes: (rows, ...args) from POS DataTable, or (receipt) from reprints.
  let receiptItems: ReceiptItem[] = [];
  let totalAmount = 0;
  let dateStr = '';
  let timeStr = '';
  let invoiceNumber = '';

  const isRowsCall = Array.isArray(rowsOrReceipt);

  if (isRowsCall) {
    const rows = rowsOrReceipt as TableRow[];
    receiptItems = rows
      .filter(row => row.itemName && row.qty > 0 && row.price > 0)
      .map(row => ({
        id: row.id,
        itemName: row.itemName,
        qty: row.qty,
        price: row.price,
        total: row.qty * row.price,
      }));

    if (receiptItems.length === 0) {
      alert('Please add items before printing receipt');
      return false;
    }

    totalAmount = calculateTotal ? calculateTotal() : receiptItems.reduce((s, r) => s + r.total, 0);
    const now = new Date();
    dateStr = now.toLocaleDateString('en-GB', { timeZone: 'Asia/Colombo' });
    timeStr = now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Colombo' });

    if (addReceipt && type) {
      addReceipt({ type, items: receiptItems, totalAmount });
    }
    invoiceNumber = getInvoiceNumber({ id: undefined });
  } else {
    const receipt = rowsOrReceipt as Receipt;
    if (!receipt?.items?.length) {
      alert('No items to print');
      return false;
    }
    receiptItems = receipt.items;
    totalAmount = receipt.totalAmount;
    dateStr = receipt.date || '';
    timeStr = receipt.time || '';
    invoiceNumber = getInvoiceNumber(receipt);
  }

  const shop = getShopInfo();
  const escPos = generateESCPOSText(shop, invoiceNumber, dateStr, timeStr, receiptItems, totalAmount);
  const rawbtUrl = `intent://print?text=${encodeURIComponent(escPos)}#Intent;scheme=rawbt;package=ru.a402d.rawbtprinter;end`;

  try {
    window.location.href = rawbtUrl;
    if (clearAllFields) clearAllFields();
    return true;
  } catch (error) {
    console.error('RawBT print error:', error);
    alert('Failed to open RawBT app. Please make sure RawBT is installed.');
    return false;
  }
};

function generateESCPOSText(
  shop: { name: string; phone: string; address: string },
  invoiceNumber: string,
  date: string,
  time: string,
  items: ReceiptItem[],
  total: number,
): string {
  const ESC = '\x1B';
  const INIT = ESC + '@';
  const CENTER = ESC + 'a' + '\x01';
  const LEFT = ESC + 'a' + '\x00';
  const BOLD_ON = ESC + 'E' + '\x01';
  const BOLD_OFF = ESC + 'E' + '\x00';
  const CUT = ESC + 'i';

  let r = INIT;
  r += CENTER + BOLD_ON + (shop.name || 'MY SHOP').toUpperCase() + BOLD_OFF + '\n';
  if (shop.phone) r += `Mob: ${shop.phone}\n`;
  if (shop.address) r += `${shop.address}\n`;
  r += '--------------------------------\n';
  r += LEFT;
  r += `Invoice: ${invoiceNumber}\n`;
  r += `${date}  ${time}\n`;
  r += '--------------------------------\n';
  r += BOLD_ON + 'ITEM            QTY  PRICE   AMT' + BOLD_OFF + '\n';
  r += '--------------------------------\n';
  items.forEach(it => {
    const name = it.itemName.length > 16 ? it.itemName.slice(0, 13) + '...' : it.itemName.padEnd(16);
    const qty = String(it.qty).padStart(4);
    const price = it.price.toFixed(2).padStart(7);
    const amt = it.total.toFixed(2).padStart(7);
    r += `${name}${qty} ${price} ${amt}\n`;
  });
  r += '================================\n';
  r += CENTER + BOLD_ON + `TOTAL: Rs. ${total.toFixed(2)}` + BOLD_OFF + '\n';
  r += '================================\n';
  r += `Items: ${items.length}\n\n`;
  r += 'Thank you for your business!\n';
  r += 'Visit us again\n\n\n';
  r += CUT;
  return r;
}
