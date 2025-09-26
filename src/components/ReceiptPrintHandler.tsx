
import { useToast } from '@/hooks/use-toast';

export const useReceiptPrintHandler = () => {
  const { toast } = useToast();

  const generatePrintContent = (receipt: any, useMobileFormat = false) => {
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
          .clear {
            clear: both;
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

    const currentDate = new Date();
    const invoiceNumber = `INVM-${currentDate.getFullYear().toString().slice(-2)}-${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`;

    const mobileContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>AK Spice - Receipt</title>
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
                ${receipt.date}<br>
                ${receipt.time}
              </div>
              <div class="clear"></div>
            </div>

            <div class="receipt-table">
              <div class="table-header">
                ITEM NAME | QTY | PRICE | AMOUNT
              </div>
              
              ${receipt.items.map(item => `
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
                TOTAL: Rs. ${receipt.totalAmount.toFixed(2)}
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

    const desktopContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>AK Spice - Receipt</title>
          ${printStyles}
        </head>
        <body>
          <div class="receipt-header">
            <div class="company-name">AK SPICE TRADING</div>
            <div class="company-details">
              Mo: +974773962001<br>
              36, In Front of Ajile Factory<br>
              Mahiyangana
            </div>
          </div>
          
          <div class="invoice-info">
            <div>
              Invoice N: ${invoiceNumber}<br>
              Invoice by: ADMIN /
            </div>
            <div style="text-align: right;">
              ${receipt.date}<br>
              ${receipt.time}
            </div>
          </div>

          <div class="receipt-table">
            <div class="table-header">
              <span>ITEM NAME</span>
              <span>QTY</span>
              <span>Price</span>
              <span>Amount</span>
            </div>
            
            ${receipt.items.map(item => `
              <div class="receipt-item">
                <div class="item-name">${item.itemName}</div>
                <div class="item-details">
                  <span>${item.qty}kg</span>
                  <span>${item.price.toFixed(2)}</span>
                  <span>Rs.${item.total.toFixed(2)}</span>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="receipt-total">
            <div style="border-top: 1px solid black; border-bottom: 1px solid black; padding: 2mm 0;">
              <div class="total-line">
                Invoice Total Rs. : ${receipt.totalAmount.toFixed(2)}
              </div>
            </div>
            <div class="thank-you">
              Thank you for your business!<br>
              Visit us again
            </div>
          </div>
        </body>
      </html>
    `;

    return useMobileFormat ? mobileContent : desktopContent;
  };

  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           window.innerWidth <= 768;
  };

  const printReceipt = (receipt: any) => {
    const printContent = generatePrintContent(receipt, true);
    
    // Create a completely new window for printing (better mobile isolation)
    const printWindow = window.open('', '_blank', 'width=300,height=600,scrollbars=yes');
    
    if (!printWindow) {
      toast({
        title: "Print failed",
        description: "Popup blocked. Please allow popups for printing.",
        variant: "destructive"
      });
      return;
    }
    
    // Write content to the new window
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load, then print and close
    const handlePrint = () => {
      try {
        printWindow.focus();
        printWindow.print();
        
        // Close the print window after printing
        setTimeout(() => {
          printWindow.close();
          toast({
            title: "Print job sent",
            description: "Receipt has been sent to your printer or save as PDF.",
          });
        }, 1000);
      } catch (error) {
        console.error('Print error:', error);
        printWindow.close();
        toast({
          title: "Print failed",
          description: "Unable to print. Please check your printer settings.",
          variant: "destructive"
        });
      }
    };

    // Handle window load for better compatibility
    printWindow.onload = () => {
      setTimeout(handlePrint, 500);
    };
    
    // Fallback in case onload doesn't fire
    setTimeout(handlePrint, 1000);
  };

  const checkPrinterAndPrint = async (receipt: any) => {
    console.log('Print button clicked with receipt:', receipt);
    
    try {
      printReceipt(receipt);
    } catch (error) {
      console.error('Printing failed:', error);
      toast({
        title: "Print failed",
        description: "Please check your printer connection and try again.",
        variant: "destructive"
      });
    }
  };

  return { checkPrinterAndPrint };
};
