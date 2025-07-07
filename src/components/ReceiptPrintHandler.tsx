
import { useToast } from '@/hooks/use-toast';

export const useReceiptPrintHandler = () => {
  const { toast } = useToast();

  const generatePrintContent = (receipt: any) => {
    const printStyles = `
      <style>
        @media print {
          @page { 
            size: 76mm auto;
            margin: 2mm;
          }
          body { 
            font-family: 'Courier New', monospace;
            font-size: 10px;
            line-height: 1.3;
            margin: 0;
            padding: 2mm;
            width: 72mm;
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
          }
          .receipt-table {
            width: 100%;
            margin: 2mm 0;
          }
          .table-header {
            border-bottom: 1px dashed black;
            padding-bottom: 1mm;
            margin-bottom: 2mm;
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            font-size: 9px;
          }
          .receipt-item {
            margin-bottom: 1mm;
            font-size: 9px;
          }
          .item-name {
            font-weight: bold;
            margin-bottom: 0.5mm;
          }
          .item-details {
            display: flex;
            justify-content: space-between;
            font-size: 8px;
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
          }
          .thank-you {
            text-align: center;
            font-size: 8px;
            margin-top: 3mm;
            border-top: 1px dashed black;
            padding-top: 2mm;
          }
        }
      </style>
    `;

    const currentDate = new Date();
    const invoiceNumber = `INVM-${currentDate.getFullYear().toString().slice(-2)}-${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`;

    return `
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
  };

  const checkPrinterAndPrint = async (receipt: any) => {
    console.log('Checking printer connectivity...');
    
    try {
      if (!window.print) {
        toast({
          title: "Printing not supported",
          description: "Your browser doesn't support printing functionality.",
          variant: "destructive"
        });
        return;
      }

      const printContent = generatePrintContent(receipt);
      const printWindow = window.open('', '_blank');
      
      if (!printWindow) {
        toast({
          title: "Print blocked",
          description: "Pop-up blocked. Please allow pop-ups and try again.",
          variant: "destructive"
        });
        return;
      }

      printWindow.document.write(printContent);
      printWindow.document.close();
      
      printWindow.onload = () => {
        if ('navigator' in window && 'mediaDevices' in navigator) {
          setTimeout(() => {
            try {
              printWindow.print();
              setTimeout(() => {
                if (!printWindow.closed) {
                  printWindow.close();
                }
                toast({
                  title: "Print job sent",
                  description: "Receipt has been sent to your printer.",
                });
              }, 1000);
            } catch (error) {
              console.error('Print error:', error);
              printWindow.close();
              toast({
                title: "No printer detected",
                description: "Please check your printer connection and try again.",
                variant: "destructive"
              });
            }
          }, 250);
        } else {
          setTimeout(() => {
            try {
              printWindow.print();
              setTimeout(() => {
                if (!printWindow.closed) {
                  printWindow.close();
                }
                toast({
                  title: "Print dialog opened",
                  description: "Please select your printer and confirm printing.",
                });
              }, 1000);
            } catch (error) {
              console.error('Print error:', error);
              printWindow.close();
              toast({
                title: "No printer detected",
                description: "Please check your printer connection and try again.",
                variant: "destructive"
              });
            }
          }, 250);
        }
      };

      printWindow.onerror = () => {
        printWindow.close();
        toast({
          title: "No printer detected",
          description: "Please check your printer connection and try again.",
          variant: "destructive"
        });
      };

    } catch (error) {
      console.error('Printing failed:', error);
      toast({
        title: "No printer detected",
        description: "Please check your printer connection and try again.",
        variant: "destructive"
      });
    }
  };

  return { checkPrinterAndPrint };
};
