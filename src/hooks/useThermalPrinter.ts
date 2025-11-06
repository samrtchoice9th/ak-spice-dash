import { useToast } from '@/hooks/use-toast';

// Extend types for Web Bluetooth API
declare global {
  interface BluetoothRemoteGATTServer {
    getPrimaryServices(): Promise<BluetoothRemoteGATTService[]>;
  }
  
  interface BluetoothRemoteGATTService {
    uuid: string;
    getCharacteristics(): Promise<BluetoothRemoteGATTCharacteristic[]>;
  }
  
  interface BluetoothRemoteGATTCharacteristic {
    uuid: string;
    properties: {
      write: boolean;
      writeWithoutResponse: boolean;
    };
    writeValue(value: BufferSource): Promise<void>;
  }
}

export const useThermalPrinter = () => {
  const { toast } = useToast();

  const printToThermal = async (receipt: any): Promise<boolean> => {
    try {
      // Check if Web Bluetooth API is available
      if (!navigator.bluetooth) {
        console.log('Web Bluetooth not supported');
        return false;
      }

      // Check for saved device
      const savedDevice = localStorage.getItem('selectedBluetoothPrinter');
      if (!savedDevice) {
        toast({
          title: "No Thermal Printer Found",
          description: "Please connect your XPrinter in Settings first.",
          variant: "destructive"
        });
        return false;
      }

      // Try to get any available device (including already paired ones)
      let device: BluetoothDevice;
      try {
        device = await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: [
            'battery_service',
            '000018f0-0000-1000-8000-00805f9b34fb',
            '49535343-fe7d-4ae5-8fa9-9fafd205e455',
            '0000ff00-0000-1000-8000-00805f9b34fb'
          ]
        });
      } catch (error: any) {
        if (error.name === 'NotFoundError') {
          // User cancelled or no device available
          return false;
        }
        throw error;
      }

      if (!device.gatt) {
        throw new Error('GATT not available');
      }

      // Connect to the device
      const server = await device.gatt.connect();
      console.log('Connected to device:', device.name);

      // Create ESC/POS thermal receipt content
      const receiptContent = generateThermalReceiptContent(receipt);
      
      // Try to find a writable characteristic
      const services = await server.getPrimaryServices();
      let characteristic: BluetoothRemoteGATTCharacteristic | null = null;

      for (const service of services) {
        try {
          const characteristics = await service.getCharacteristics();
          for (const char of characteristics) {
            if (char.properties.write || char.properties.writeWithoutResponse) {
              characteristic = char;
              break;
            }
          }
          if (characteristic) break;
        } catch (error) {
          console.log('Skipping service:', service.uuid);
        }
      }

      if (!characteristic) {
        throw new Error('No writable characteristic found');
      }

      // Send the receipt content to the printer
      const encoder = new TextEncoder();
      const data = encoder.encode(receiptContent);
      
      // Split into chunks if necessary (some devices have size limits)
      const chunkSize = 20;
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        await characteristic.writeValue(chunk);
        await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
      }

      // Disconnect
      device.gatt.disconnect();
      
      toast({
        title: "Printed Successfully",
        description: "Receipt sent to XPrinter thermal printer.",
      });
      
      return true;

    } catch (error: any) {
      console.error('Thermal printing failed:', error);
      
      if (error.name === 'NotFoundError') {
        toast({
          title: "Printer Not Found",
          description: "Please make sure your XPrinter is powered on and paired.",
          variant: "destructive"
        });
      } else if (error.name === 'NotAllowedError') {
        toast({
          title: "Permission Denied",
          description: "Please allow Bluetooth access to print.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Print Failed",
          description: `Failed to print: ${error.message}`,
          variant: "destructive"
        });
      }
      
      return false;
    }
  };

  const generateThermalReceiptContent = (receipt: any): string => {
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

  return { printToThermal };
};