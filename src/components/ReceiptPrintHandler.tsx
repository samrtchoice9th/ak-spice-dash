
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { PrintPreviewDialog } from './PrintPreviewDialog';
import { ReceiptItem } from '@/contexts/ReceiptsContext';
import { useShop } from '@/contexts/ShopContext';

interface ShopInfo {
  name: string;
  phone: string;
  address: string;
}

export const useReceiptPrintHandler = () => {
  const { toast } = useToast();
  const [showPreview, setShowPreview] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState<any>(null);
  const { shop } = useShop();

  const getShopInfo = (): ShopInfo => ({
    name: shop?.name || 'My Shop',
    phone: shop?.phone || '',
    address: shop?.address || '',
  });

  const generatePrintContent = (receipt: any, useMobileFormat = false) => {
    const shopInfo = getShopInfo();
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

    const shopDetailsHtml = [
      shopInfo.phone ? `Mob: ${shopInfo.phone}` : '',
      shopInfo.address || '',
    ].filter(Boolean).join('<br>');

    const mobileContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${shopInfo.name} - Receipt</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${printStyles}
        </head>
        <body>
          <div class="receipt-container">
            <div class="receipt-header">
              <div class="company-name">${shopInfo.name.toUpperCase()}</div>
              ${shopDetailsHtml ? `<div class="company-details">${shopDetailsHtml}</div>` : ''}
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
              <div class="total-items">
                Total Items: ${receipt.items.length}
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
          <title>${shopInfo.name} - Receipt</title>
          ${printStyles}
        </head>
        <body>
          <div class="receipt-header">
            <div class="company-name">${shopInfo.name.toUpperCase()}</div>
            ${shopDetailsHtml ? `<div class="company-details">${shopDetailsHtml}</div>` : ''}
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

  const printReceiptNative = (receipt: any) => {
    const shopInfo = getShopInfo();
    const printStyles = `
      <style>
        @media print {
          @page { 
            size: 80mm auto;
            margin: 0;
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

    const currentDate = new Date();
    const invoiceNumber = `INVM-${currentDate.getFullYear().toString().slice(-2)}-${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`;
    const formattedDate = currentDate.toLocaleDateString();
    const formattedTime = currentDate.toLocaleTimeString();

    const shopDetailsHtml = [
      shopInfo.phone ? `Mob: ${shopInfo.phone}` : '',
      shopInfo.address || '',
    ].filter(Boolean).join('<br>');

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${shopInfo.name} - Receipt</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${printStyles}
        </head>
        <body>
          <div class="receipt-container">
            <div class="receipt-header">
              <div class="company-name">${shopInfo.name.toUpperCase()}</div>
              ${shopDetailsHtml ? `<div class="company-details">${shopDetailsHtml}</div>` : ''}
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
              <div class="total-items">
                Total Items: ${receipt.items.length}
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

    const printWindow = window.open('', '_blank', 'width=300,height=600,scrollbars=yes');
    
    if (!printWindow) {
      toast({
        title: "Print failed",
        description: "Popup blocked. Please allow popups for printing.",
        variant: "destructive"
      });
      return;
    }
    
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    const handleAfterPrint = () => {
      printWindow.close();
      toast({
        title: "Print job sent",
        description: "Receipt has been sent to your printer or save as PDF.",
      });
    };

    const handlePrint = () => {
      try {
        printWindow.focus();
        printWindow.print();
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

    printWindow.onload = () => {
      printWindow.onafterprint = handleAfterPrint;
      printWindow.onbeforeunload = handleAfterPrint;
      setTimeout(handlePrint, 500);
    };
  };

  // RawBT Thermal Printer Support for Android
  const printToRawBT = (receipt: any): boolean => {
    const isAndroid = /Android/i.test(navigator.userAgent);
    if (!isAndroid) {
      toast({
        title: "Android Required",
        description: "RawBT printing is only available on Android devices",
        variant: "destructive"
      });
      return false;
    }

    if (!receipt || !receipt.items || receipt.items.length === 0) {
      toast({
        title: "No items",
        description: "Please add items before printing receipt",
        variant: "destructive"
      });
      return false;
    }

    const shopInfo = getShopInfo();
    const currentDate = new Date();
    const formattedDate = receipt.date || currentDate.toLocaleDateString();
    const formattedTime = receipt.time || currentDate.toLocaleTimeString();
    const invoiceNumber = `INVM-${currentDate.getFullYear().toString().slice(-2)}-${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`;

    const escPos = generateESCPOSText(shopInfo, invoiceNumber, formattedDate, formattedTime, receipt.items, receipt.totalAmount);

    const rawbtUrl = `intent://print?text=${encodeURIComponent(escPos)}#Intent;scheme=rawbt;package=ru.a402d.rawbtprinter;end`;

    try {
      window.location.href = rawbtUrl;
      toast({
        title: "Sent to RawBT",
        description: "Receipt sent to thermal printer",
      });
      return true;
    } catch (error) {
      console.error('RawBT print error:', error);
      toast({
        title: "Print failed",
        description: "Failed to open RawBT app. Please make sure RawBT is installed.",
        variant: "destructive"
      });
      return false;
    }
  };

  const generateESCPOSText = (
    shopInfo: ShopInfo,
    invoiceNumber: string,
    date: string,
    time: string,
    items: ReceiptItem[],
    total: number
  ): string => {
    const ESC = '\x1B';
    const INIT = ESC + '@';
    const CENTER = ESC + 'a' + '\x01';
    const LEFT = ESC + 'a' + '\x00';
    const BOLD_ON = ESC + 'E' + '\x01';
    const BOLD_OFF = ESC + 'E' + '\x00';
    const CUT = ESC + 'i';
    
    let receipt = INIT;
    
    // Header
    receipt += CENTER + BOLD_ON + shopInfo.name.toUpperCase() + BOLD_OFF + '\n';
    if (shopInfo.phone) receipt += `Mob: ${shopInfo.phone}\n`;
    if (shopInfo.address) receipt += `${shopInfo.address}\n`;
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
    receipt += '\n';
    receipt += `Total Items: ${items.length}\n`;
    
    // Footer
    receipt += '\n';
    receipt += 'Thank you for your business!\n';
    receipt += 'Visit us again\n';
    receipt += '\n\n\n';
    
    // Cut paper
    receipt += CUT;
    
    return receipt;
  };

  const showPrintPreview = (receipt: any) => {
    console.log('Print button clicked with receipt:', receipt);
    setCurrentReceipt(receipt);
    setShowPreview(true);
  };

  const handleConfirmPrint = () => {
    setShowPreview(false);
    if (currentReceipt) {
      try {
        printReceiptNative(currentReceipt);
      } catch (error) {
        console.error('Printing failed:', error);
        toast({
          title: "Print failed",
          description: "Please check your printer connection and try again.",
          variant: "destructive"
        });
      }
    }
  };

  const PrintPreviewComponent = () => (
    <PrintPreviewDialog
      open={showPreview}
      onOpenChange={setShowPreview}
      receipt={currentReceipt}
      onConfirmPrint={handleConfirmPrint}
    />
  );

  return { 
    checkPrinterAndPrint: showPrintPreview,
    printToRawBT,
    PrintPreviewComponent 
  };
};
