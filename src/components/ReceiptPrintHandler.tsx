import { useToast } from '@/hooks/use-toast';
import { printDesktopReceipt, printToRawBT as printToRawBTUtil } from '@/utils/printReceipt';

/**
 * Unified one-click print handler.
 * - Android  → RawBT app via intent URL
 * - Desktop  → browser print dialog using 80mm thermal CSS (XPrinter XP-80C)
 *
 * No preview dialog. Uses the receipt's stored id / date / time.
 */
export const useReceiptPrintHandler = () => {
  const { toast } = useToast();

  const isAndroid = () => /Android/i.test(navigator.userAgent);

  const printReceipt = (receipt: any) => {
    if (!receipt || !receipt.items || receipt.items.length === 0) {
      toast({
        title: 'No items',
        description: 'This receipt has no items to print.',
        variant: 'destructive',
      });
      return;
    }

    if (isAndroid()) {
      printToRawBTUtil(receipt);
      return;
    }

    try {
      printDesktopReceipt(receipt);
    } catch (err) {
      console.error('Desktop print failed:', err);
      toast({
        title: 'Print failed',
        description: 'Unable to open print dialog. Please check your printer.',
        variant: 'destructive',
      });
    }
  };

  // Back-compat no-op preview component for any remaining callers.
  const PrintPreviewComponent = () => null;

  return {
    printReceipt,
    checkPrinterAndPrint: printReceipt,
    printToRawBT: printReceipt,
    PrintPreviewComponent,
  };
};
