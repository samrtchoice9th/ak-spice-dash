
import { useToast } from '@/hooks/use-toast';
import { useRawBTPrinter } from '@/hooks/useRawBTPrinter';

export const useReceiptPrintHandler = () => {
  const { toast } = useToast();
  const { printToRawBT } = useRawBTPrinter();

  const generatePrintContent = (receipt: any, useMobileFormat = false) => {
    const printStyles = useMobileFormat ? `
      <style>
        @media print {
          @page { 
            size: A4;
            margin: 5mm;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body { 
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: black;
            background: white;
          }
          .receipt-container {
            max-width: 300px;
            margin: 0 auto;
            padding: 10px;
            border: 1px solid black;
          }
          .receipt-header {
            text-align: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px dashed black;
          }
          .company-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .company-details {
            font-size: 10px;
            margin-bottom: 5px;
          }
          .invoice-info {
            margin: 10px 0;
            font-size: 10px;
            border-bottom: 1px solid black;
            padding-bottom: 10px;
          }
          .invoice-left {
            float: left;
            width: 60%;
          }
          .invoice-right {
            float: right;
            width: 40%;
            text-align: right;
          }
          .clear {
            clear: both;
          }
          .receipt-table {
            width: 100%;
            margin: 10px 0;
          }
          .table-header {
            border-bottom: 2px solid black;
            padding: 5px 0;
            font-weight: bold;
            font-size: 10px;
            text-align: center;
          }
          .receipt-item {
            margin: 8px 0;
            padding: 5px 0;
            border-bottom: 1px dotted black;
          }
          .item-name {
            font-weight: bold;
            margin-bottom: 3px;
            font-size: 11px;
          }
          .item-details {
            font-size: 10px;
            text-align: center;
          }
          .receipt-total {
            border-top: 2px solid black;
            margin-top: 15px;
            padding-top: 10px;
            text-align: center;
          }
          .total-line {
            font-size: 14px;
            font-weight: bold;
            margin: 10px 0;
            border: 2px solid black;
            padding: 5px;
          }
          .thank-you {
            text-align: center;
            font-size: 10px;
            margin-top: 15px;
            border-top: 1px dashed black;
            padding-top: 10px;
          }
        }
      </style>
    ` : `
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

  const checkPrinterAndPrint = async (receipt: any) => {
    console.log('Print button clicked with receipt:', receipt);
    
    // Try to print directly via RawBT app
    const rawBTPrintSuccess = await printToRawBT(receipt);
    
    if (rawBTPrintSuccess) {
      console.log('RawBT print successful');
      return;
    }
    
    console.log('RawBT not available, falling back to standard printing...');
    
    try {
      const isMobile = isMobileDevice();
      const printContent = generatePrintContent(receipt, isMobile);
      
      if (isMobile) {
        // Mobile: Create hidden iframe for better print compatibility
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        
        document.body.appendChild(iframe);
        
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) {
          document.body.removeChild(iframe);
          toast({
            title: "Print failed",
            description: "Unable to access print functionality.",
            variant: "destructive"
          });
          return;
        }
        
        iframeDoc.open();
        iframeDoc.write(printContent);
        iframeDoc.close();
        
        iframe.onload = () => {
          setTimeout(() => {
            try {
              iframe.contentWindow?.focus();
              iframe.contentWindow?.print();
              
              setTimeout(() => {
                document.body.removeChild(iframe);
                toast({
                  title: "Print job sent",
                  description: "Receipt has been sent to your printer or save as PDF.",
                });
              }, 2000);
            } catch (error) {
              console.error('Mobile print error:', error);
              document.body.removeChild(iframe);
              toast({
                title: "Print failed",
                description: "Unable to print. Please try saving as PDF from your browser menu.",
                variant: "destructive"
              });
            }
          }, 500);
        };

      } else {
        // Desktop: Use traditional window approach
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        
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
        printWindow.focus();
        
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
            console.error('Desktop print error:', error);
            printWindow.close();
            toast({
              title: "Print failed",
              description: "Please check your printer connection and try again.",
              variant: "destructive"
            });
          }
        }, 250);
      }

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
