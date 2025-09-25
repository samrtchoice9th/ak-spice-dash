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
      // Check if running on Android
      if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
        toast({
          title: "Not Available",
          description: "RawBT printing is only available on Android devices.",
          variant: "destructive"
        });
        return false;
      }

      // Generate ESC/POS content
      const escPosData = generateESCPOSContent(receipt);
      
      // Convert to Base64
      const base64Data = btoa(unescape(encodeURIComponent(escPosData)));

      // Send intent to RawBT app using Android intent URL scheme
      window.open(`intent://print?#Intent;action=ru.a402d.rawbtprinter.action.PRINT_RAW;S.ru.a402d.rawbtprinter.extra.DATA=${base64Data};end`, '_system');

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
    content += 'AK SPICE TRADING';
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