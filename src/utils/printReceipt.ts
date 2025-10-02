
import { TableRow } from '@/types/table';
import { ReceiptItem } from '@/contexts/ReceiptsContext';

// Normal browser print using window.print() with hidden DOM container
export const printReceipt = (
  rows: TableRow[], 
  title: string, 
  calculateTotal: () => number,
  addReceipt: (receipt: { type: 'purchase' | 'sales'; items: ReceiptItem[]; totalAmount: number }) => void,
  type: 'purchase' | 'sales',
  clearAllFields: () => void,
  showPreviewFirst: boolean = false,
  onShowPreview?: (receipt: any) => void
) => {
  const receiptItems: ReceiptItem[] = rows
    .filter(row => row.itemName && row.qty > 0 && row.price > 0)
    .map(row => ({
      id: row.id,
      itemName: row.itemName,
      qty: row.qty,
      price: row.price,
      total: row.qty * row.price
    }));

  if (receiptItems.length === 0) {
    alert('Please add items before printing receipt');
    return;
  }

  const total = calculateTotal();
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString();
  const formattedTime = currentDate.toLocaleTimeString();

  // Add receipt to storage
  addReceipt({
    type,
    items: receiptItems,
    totalAmount: total
  });

  // If preview first is enabled, show preview dialog
  if (showPreviewFirst && onShowPreview) {
    const receiptData = {
      items: receiptItems,
      totalAmount: total,
      type: type,
      date: formattedDate,
      time: formattedTime
    };
    onShowPreview(receiptData);
    clearAllFields();
    return;
  }

  // Generate invoice number
  const invoiceNumber = `INVM-${currentDate.getFullYear().toString().slice(-2)}-${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`;

  // Remove any existing print container
  const existingContainer = document.getElementById('print-receipt-container');
  if (existingContainer) {
    document.body.removeChild(existingContainer);
  }

  // Create a hidden container for printing
  const printContainer = document.createElement('div');
  printContainer.id = 'print-receipt-container';
  printContainer.innerHTML = `
    <div class="receipt-container">
      <div class="receipt-header">
        <div class="company-name">AK SPICE TRADING</div>
        <div class="company-details">
          Mob: +974773962001<br>
          36, In Front of Tile Factory<br>
          Mahiyangana
        </div>
      </div>
      
      <div class="invoice-info">
        <div class="invoice-left">
          Invoice N: ${invoiceNumber}<br>
          Invoice by: ADMIN
        </div>
        <div class="invoice-right">
          ${formattedDate}<br>
          ${formattedTime}
        </div>
      </div>

      <div class="receipt-table">
        <div class="table-header">
          ITEM NAME | QTY | PRICE | AMOUNT
        </div>
        
        ${receiptItems.map(item => `
          <div class="receipt-item">
            <div class="item-name">${item.itemName}</div>
            <div class="item-details">
              ${item.qty}kg | Rs.${item.price.toFixed(2)} | Rs.${item.total.toFixed(2)}
            </div>
          </div>
        `).join('')}
      </div>

      <div class="receipt-total">
        <div class="total-line">
          TOTAL: Rs. ${total.toFixed(2)}
        </div>
        <div class="thank-you">
          Thank you for your business!<br>
          Visit us again
        </div>
      </div>
    </div>
  `;

  // Append to body
  document.body.appendChild(printContainer);

  // Wait for DOM to be ready, then print
  requestAnimationFrame(() => {
    window.print();
    
    // Cleanup after print dialog closes (use both beforeprint/afterprint events and timeout as fallback)
    const cleanup = () => {
      const container = document.getElementById('print-receipt-container');
      if (container) {
        document.body.removeChild(container);
      }
      clearAllFields();
    };

    // Listen for print events
    window.addEventListener('afterprint', cleanup, { once: true });
    
    // Fallback cleanup if events don't fire (mobile browsers)
    setTimeout(cleanup, 1000);
  });
};

// RawBT Thermal Printer Support for Android
export const printToRawBT = (
  rows: TableRow[], 
  title: string, 
  calculateTotal: () => number,
  addReceipt: (receipt: { type: 'purchase' | 'sales'; items: ReceiptItem[]; totalAmount: number }) => void,
  type: 'purchase' | 'sales',
  clearAllFields: () => void
): boolean => {
  // Check if Android
  const isAndroid = /Android/i.test(navigator.userAgent);
  if (!isAndroid) {
    alert('RawBT printing is only available on Android devices');
    return false;
  }

  const receiptItems: ReceiptItem[] = rows
    .filter(row => row.itemName && row.qty > 0 && row.price > 0)
    .map(row => ({
      id: row.id,
      itemName: row.itemName,
      qty: row.qty,
      price: row.price,
      total: row.qty * row.price
    }));

  if (receiptItems.length === 0) {
    alert('Please add items before printing receipt');
    return false;
  }

  const total = calculateTotal();
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString();
  const formattedTime = currentDate.toLocaleTimeString();
  const invoiceNumber = `INVM-${currentDate.getFullYear().toString().slice(-2)}-${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`;

  // Add receipt to storage
  addReceipt({
    type,
    items: receiptItems,
    totalAmount: total
  });

  // Generate ESC/POS formatted text
  const escPos = generateESCPOSText(invoiceNumber, formattedDate, formattedTime, receiptItems, total);
  
  // Proper RawBT Intent URL
  const rawbtUrl = `intent://print?text=${encodeURIComponent(escPos)}#Intent;scheme=rawbt;package=ru.a402d.rawbtprinter;end`;
  
  try {
    // Try to open the RawBT URL
    window.location.href = rawbtUrl;
    clearAllFields();
    return true;
  } catch (error) {
    console.error('RawBT print error:', error);
    alert('Failed to open RawBT app. Please make sure RawBT is installed.');
    return false;
  }
};

// Generate ESC/POS formatted text for thermal printer
function generateESCPOSText(
  invoiceNumber: string,
  date: string,
  time: string,
  items: ReceiptItem[],
  total: number
): string {
  const ESC = '\x1B';
  const INIT = ESC + '@';
  const CENTER = ESC + 'a' + '\x01';
  const LEFT = ESC + 'a' + '\x00';
  const BOLD_ON = ESC + 'E' + '\x01';
  const BOLD_OFF = ESC + 'E' + '\x00';
  const CUT = ESC + 'i';
  
  let receipt = INIT;
  
  // Header
  receipt += CENTER + BOLD_ON + 'AK SPICE TRADING' + BOLD_OFF + '\n';
  receipt += 'Mob: +974773962001\n';
  receipt += '36, In Front of Tile Factory\n';
  receipt += 'Mahiyangana\n';
  receipt += '--------------------------------\n';
  
  // Invoice info
  receipt += LEFT;
  receipt += `Invoice N: ${invoiceNumber}\n`;
  receipt += `Invoice by: ADMIN\n`;
  receipt += `${date} ${time}\n`;
  receipt += '--------------------------------\n';
  
  // Items header
  receipt += CENTER + BOLD_ON + 'ITEM | QTY | PRICE | AMOUNT' + BOLD_OFF + '\n';
  receipt += '--------------------------------\n';
  
  // Items
  receipt += LEFT;
  items.forEach(item => {
    receipt += BOLD_ON + item.itemName + BOLD_OFF + '\n';
    receipt += CENTER + `${item.qty}kg | Rs.${item.price.toFixed(2)} | Rs.${item.total.toFixed(2)}\n`;
    receipt += '................................\n';
  });
  
  // Total
  receipt += '================================\n';
  receipt += CENTER + BOLD_ON + `TOTAL: Rs. ${total.toFixed(2)}` + BOLD_OFF + '\n';
  receipt += '================================\n';
  
  // Footer
  receipt += '\n';
  receipt += 'Thank you for your business!\n';
  receipt += 'Visit us again\n';
  receipt += '\n\n\n';
  
  // Cut paper
  receipt += CUT;
  
  return receipt;
}
