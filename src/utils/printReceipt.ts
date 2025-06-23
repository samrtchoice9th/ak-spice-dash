
import { TableRow } from '@/types/table';
import { ReceiptItem } from '@/contexts/ReceiptsContext';

export const printReceipt = (
  rows: TableRow[], 
  title: string, 
  calculateTotal: () => number,
  addReceipt: (receipt: { type: 'purchase' | 'sales'; items: ReceiptItem[]; totalAmount: number }) => void,
  type: 'purchase' | 'sales',
  clearAllFields: () => void
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

  if (receiptItems.length > 0) {
    addReceipt({
      type,
      items: receiptItems,
      totalAmount: calculateTotal()
    });
  }

  // Add thermal printer styles
  const printStyles = `
    <style>
      @media print {
        @page { 
          size: 58mm auto;
          margin: 2mm;
        }
        body { 
          font-family: monospace;
          font-size: 8px;
          line-height: 1.2;
          margin: 0;
          padding: 2mm;
        }
        .receipt-header {
          text-align: center;
          margin-bottom: 3mm;
          font-weight: bold;
        }
        .receipt-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1mm;
        }
        .receipt-total {
          border-top: 1px dashed black;
          margin-top: 2mm;
          padding-top: 1mm;
          font-weight: bold;
        }
      }
    </style>
  `;

  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>AK Spice - ${title}</title>
        ${printStyles}
      </head>
      <body>
        <div class="receipt-header">
          <div>AK SPICE</div>
          <div>${title.toUpperCase()}</div>
          <div>${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
        </div>
        ${receiptItems.map(item => `
          <div class="receipt-item">
            <span>${item.itemName}</span>
          </div>
          <div class="receipt-item">
            <span>${item.qty}kg x Rs${item.price}</span>
            <span>Rs${item.total.toFixed(2)}</span>
          </div>
        `).join('')}
        <div class="receipt-total">
          <div class="receipt-item">
            <span>TOTAL:</span>
            <span>Rs${calculateTotal().toFixed(2)}</span>
          </div>
        </div>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
      clearAllFields();
    }, 250);
  }
};
