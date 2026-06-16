import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { PrintPreviewDialog } from './PrintPreviewDialog';
import { printDesktopReceipt, printToRawBT as printToRawBTUtil } from '@/utils/printReceipt';

/**
 * Unified print handler.
 * - Android  → RawBT app via intent URL
 * - Desktop  → browser print dialog using 80mm thermal CSS (XPrinter XP-80C)
 *
 * Uses the receipt's stored id / date / time. Never generates random invoice numbers.
 */
export const useReceiptPrintHandler = () => {
  const { toast } = useToast();
  const [showPreview, setShowPreview] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState<any>(null);

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

  const showPrintPreview = (receipt: any) => {
    setCurrentReceipt(receipt);
    setShowPreview(true);
  };

  const handleConfirmPrint = () => {
    setShowPreview(false);
    if (currentReceipt) printReceipt(currentReceipt);
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
    /** Direct print (no preview), device-aware. */
    printReceipt,
    /** Open preview dialog, then print on confirm. */
    checkPrinterAndPrint: showPrintPreview,
    /** Kept for backward compatibility — routes through unified printReceipt. */
    printToRawBT: printReceipt,
    PrintPreviewComponent,
  };
};
