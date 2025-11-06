import { useToast } from '@/hooks/use-toast';
import { Capacitor } from '@capacitor/core';

declare global {
  interface Window {
    AndroidIntent?: {
      sendIntent: (options: {
        action: string;
        extras?: { [key: string]: string };
      }) => Promise<void>;
    };
  }
}

export const useRawBTPrinter = () => {
  const { toast } = useToast();

  const printToRawBT = async (receipt: any): Promise<boolean> => {
    try {
      console.log('RawBT: Starting print process for receipt:', receipt);
      
      // Check if we're on Android (works for both native and web on Android)
      const isAndroid = /Android/i.test(navigator.userAgent);
      
      if (!isAndroid) {
        console.log('RawBT: Not on Android device, user agent:', navigator.userAgent);
        toast({
          title: "Android Required",
          description: "RawBT printing requires an Android device with RawBT app installed.",
          variant: "destructive"
        });
        return false;
      }

      // Generate ESC/POS content
      const escPosData = generateESCPOSContent(receipt);
      console.log('RawBT: Generated ESC/POS data length:', escPosData.length);
      
      // Convert to Base64
      const base64Data = btoa(unescape(encodeURIComponent(escPosData)));
      console.log('RawBT: Base64 data length:', base64Data.length);

      // Send intent to RawBT app
      const intentUrl = `intent://print?#Intent;action=ru.a402d.rawbtprinter.action.PRINT_RAW;S.ru.a402d.rawbtprinter.extra.DATA=${base64Data};end`;
      console.log('RawBT: Opening intent URL:', intentUrl);
      
      // Try multiple methods to open the intent
      try {
        window.location.href = intentUrl;
      } catch (err) {
        try {
          window.open(intentUrl, '_system');
        } catch (err2) {
          // Fallback for web browsers
          const link = document.createElement('a');
          link.href = intentUrl;
          link.click();
        }
      }

      toast({
        title: "Sent to RawBT",
        description: "Receipt data sent to RawBT printer app.",
      });
      
      return true;

    } catch (error: any) {
      console.error('RawBT printing failed:', error);
      
      toast({
        title: "Print Failed",
        description: `Failed to send to RawBT: ${error.message}`,
        variant: "destructive"
      });
      
      return false;
    }
  };

  const generateESCPOSContent = (receipt: any): string => {
    const ESC = '\x1B';
    const GS = '\x1D';
    
    // ESC/POS commands
    const commands = {
      init: ESC + '@',
      alignCenter: ESC + 'a' + '1',
      alignLeft: ESC + 'a' + '0',
      boldOn: ESC + 'E' + '1',
      boldOff: ESC + 'E' + '0',
      doubleHeight: ESC + '!' + '\x10',
      normalSize: ESC + '!' + '\x00',
      feed: '\n',
      cut: GS + 'V' + '\x00'
    };

    const invoiceNumber = `INVM-${new Date().getFullYear().toString().slice(-2)}-${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`;
    
    let content = commands.init;
    
    // Header
    content += commands.alignCenter;
    content += commands.boldOn;
    content += commands.doubleHeight;
    content += 'AK TRADING';
    content += commands.feed;
    content += commands.normalSize;
    content += commands.boldOff;
    content += 'Mo: +974773962001';
    content += commands.feed;
    content += '36, In Front of Ajile Factory';
    content += commands.feed;
    content += 'Mahiyangana';
    content += commands.feed;
    content += commands.feed;
    
    // Invoice info
    content += commands.alignLeft;
    content += '--------------------------------';
    content += commands.feed;
    content += `Invoice N: ${invoiceNumber}`;
    content += commands.feed;
    content += `Date: ${receipt.date} ${receipt.time}`;
    content += commands.feed;
    content += '--------------------------------';
    content += commands.feed;
    
    // Items header
    content += commands.boldOn;
    content += 'ITEM             QTY    AMT';
    content += commands.feed;
    content += commands.boldOff;
    content += '--------------------------------';
    content += commands.feed;
    
    // Items
    receipt.items.forEach((item: any) => {
      const itemName = item.itemName.length > 16 ? 
        item.itemName.substring(0, 13) + '...' : 
        item.itemName.padEnd(16);
      const qty = `${item.qty}kg`.padStart(6);
      const amount = `${item.total.toFixed(2)}`.padStart(7);
      content += `${itemName} ${qty} ${amount}`;
      content += commands.feed;
    });
    
    // Total
    content += '--------------------------------';
    content += commands.feed;
    content += commands.alignCenter;
    content += commands.boldOn;
    content += commands.doubleHeight;
    content += `TOTAL: Rs.${receipt.totalAmount.toFixed(2)}`;
    content += commands.feed;
    content += commands.normalSize;
    content += commands.boldOff;
    content += commands.feed;
    content += `Total Items: ${receipt.items.length}`;
    content += commands.feed;
    content += commands.feed;
    
    // Footer
    content += 'Thank you for your business!';
    content += commands.feed;
    content += 'Visit us again';
    content += commands.feed;
    content += commands.feed;
    content += commands.feed;
    
    // Cut paper
    content += commands.cut;
    
    return content;
  };

  return { printToRawBT };
};