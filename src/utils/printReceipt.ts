
import { TableRow } from '@/types/table';
import { ReceiptItem } from '@/contexts/ReceiptsContext';

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

  // If preview first is enabled, show preview dialog instead of direct print
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

  // Create print styles optimized for thermal printer
  const printStyles = `
    <style>
      @media print {
        @page { 
          size: 80mm auto;
          margin: 2mm;
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body { 
          font-family: 'Courier New', monospace;
          font-size: 10px;
          line-height: 1.3;
          margin: 0;
          padding: 2mm;
          width: 76mm;
          color: black;
          background: white;
        }
        .receipt-container {
          width: 100%;
          max-width: 76mm;
          margin: 0;
          padding: 0;
        }
        .receipt-header {
          text-align: center;
          margin-bottom: 4mm;
          border-bottom: 1px dashed black;
          padding-bottom: 2mm;
        }
        .company-name {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 1mm;
        }
        .company-details {
          font-size: 8px;
          margin-bottom: 1mm;
        }
        .invoice-info {
          display: flex;
          justify-content: space-between;
          margin: 2mm 0;
          font-size: 8px;
          border-bottom: 1px solid black;
          padding-bottom: 2mm;
        }
        .invoice-left {
          flex: 1;
        }
        .invoice-right {
          text-align: right;
        }
        .receipt-table {
          width: 100%;
          margin: 2mm 0;
        }
        .table-header {
          border-bottom: 1px dashed black;
          padding-bottom: 1mm;
          margin-bottom: 2mm;
          font-weight: bold;
          font-size: 9px;
          text-align: center;
        }
        .receipt-item {
          margin-bottom: 2mm;
          font-size: 9px;
          border-bottom: 1px dotted black;
          padding-bottom: 1mm;
        }
        .item-name {
          font-weight: bold;
          margin-bottom: 0.5mm;
        }
        .item-details {
          font-size: 8px;
          text-align: center;
        }
        .receipt-total {
          border-top: 1px dashed black;
          margin-top: 3mm;
          padding-top: 2mm;
          text-align: center;
        }
        .total-line {
          font-size: 12px;
          font-weight: bold;
          margin: 2mm 0;
          border: 2px solid black;
          padding: 2mm;
        }
        .thank-you {
          text-align: center;
          font-size: 8px;
          margin-top: 3mm;
          border-top: 1px dashed black;
          padding-top: 2mm;
        }
      }
      @media screen {
        body { display: none; }
      }
    </style>
  `;

  // Generate HTML content
  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>AK Spice - ${title} Receipt</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${printStyles}
      </head>
      <body>
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
      </body>
    </html>
  `;

  // Mobile-friendly printing using blob URL approach
  const executePrint = (htmlContent: string) => {
    return new Promise<void>((resolve, reject) => {
      const isMobile = window.navigator.userAgent.includes('Mobile') || 
                       window.navigator.userAgent.includes('Android') || 
                       window.navigator.userAgent.includes('iPhone');
      
      if (isMobile) {
        try {
          // Create a blob from the HTML content
          const blob = new Blob([htmlContent], { type: 'text/html' });
          const blobUrl = URL.createObjectURL(blob);
          
          // Open the blob URL in a new window
          const printWindow = window.open(blobUrl, '_blank');
          
          if (!printWindow) {
            // Cleanup blob URL and fallback to iframe
            URL.revokeObjectURL(blobUrl);
            handleIframePrint(htmlContent, resolve, reject);
            return;
          }
          
          // Wait for the content to load
          const checkLoaded = setInterval(() => {
            try {
              if (printWindow.document && printWindow.document.readyState === 'complete') {
                clearInterval(checkLoaded);
                
                setTimeout(() => {
                  try {
                    printWindow.focus();
                    printWindow.print();
                    
                    // Cleanup after print
                    setTimeout(() => {
                      printWindow.close();
                      URL.revokeObjectURL(blobUrl);
                      clearAllFields();
                      resolve();
                    }, 1000);
                  } catch (error) {
                    console.error('Mobile print error:', error);
                    printWindow.close();
                    URL.revokeObjectURL(blobUrl);
                    reject(error);
                  }
                }, 500);
              }
            } catch (error) {
              // Can't access window (closed or blocked)
              clearInterval(checkLoaded);
              URL.revokeObjectURL(blobUrl);
              reject(error);
            }
          }, 100);
          
          // Timeout fallback
          setTimeout(() => {
            clearInterval(checkLoaded);
            if (printWindow && !printWindow.closed) {
              try {
                printWindow.print();
                setTimeout(() => {
                  printWindow.close();
                  URL.revokeObjectURL(blobUrl);
                }, 1000);
              } catch (error) {
                console.error('Timeout print error:', error);
                URL.revokeObjectURL(blobUrl);
              }
            }
            resolve();
          }, 3000);
          
        } catch (error) {
          console.error('Mobile printing failed, trying iframe:', error);
          handleIframePrint(htmlContent, resolve, reject);
        }
      } else {
        // Desktop browsers - use iframe method
        handleIframePrint(htmlContent, resolve, reject);
      }
    });
  };

  // Iframe printing method for better compatibility
  const handleIframePrint = (content: string, resolve: Function, reject: Function) => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.top = '-9999px';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.style.opacity = '0';
    iframe.style.border = 'none';
    
    document.body.appendChild(iframe);
    
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      document.body.removeChild(iframe);
      reject(new Error('Failed to access iframe document'));
      return;
    }
    
    try {
      iframeDoc.open();
      iframeDoc.write(content);
      iframeDoc.close();
      
      // Enhanced loading detection
      const waitForLoad = () => {
        if (iframeDoc.readyState === 'complete') {
          setTimeout(() => {
            try {
              iframe.contentWindow?.focus();
              iframe.contentWindow?.print();
              
              setTimeout(() => {
                if (iframe.parentNode) {
                  document.body.removeChild(iframe);
                }
                clearAllFields();
                resolve();
              }, 1500);
            } catch (error) {
              console.error('Iframe print error:', error);
              if (iframe.parentNode) {
                document.body.removeChild(iframe);
              }
              reject(error);
            }
          }, 200);
        } else {
          setTimeout(waitForLoad, 100);
        }
      };
      
      // Start checking for load completion
      setTimeout(waitForLoad, 100);
      
    } catch (error) {
      console.error('Iframe setup error:', error);
      if (iframe.parentNode) {
        document.body.removeChild(iframe);
      }
      reject(error);
    }
  };

  // Execute printing with error handling
  executePrint(printContent)
    .then(() => {
      console.log('Print completed successfully');
    })
    .catch((error) => {
      console.error('Print failed:', error);
      alert('Print failed. Please check your printer settings and try again.');
    });
};
