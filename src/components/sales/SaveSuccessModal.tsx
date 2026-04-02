import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, X, CheckCircle } from 'lucide-react';
import { SalesRow } from '@/hooks/useSalesData';
import { printToRawBT } from '@/utils/printReceipt';

interface SaveSuccessModalProps {
  open: boolean;
  onClose: () => void;
  savedRows: SalesRow[];
}

export const SaveSuccessModal: React.FC<SaveSuccessModalProps> = ({ open, onClose, savedRows }) => {
  const grandTotal = savedRows.reduce((sum, r) => sum + r.total, 0);

  const handlePrint = () => {
    const tableRows = savedRows.map(r => ({
      id: r.id,
      itemName: r.name,
      qty: r.qty,
      price: r.price,
    }));

    printToRawBT(
      tableRows,
      'Sales',
      () => grandTotal,
      () => Promise.resolve(), // receipt already saved
      'sales',
      () => {} // no clear needed
    );
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <DialogTitle>Sale Saved!</DialogTitle>
          </div>
          <DialogDescription>
            {savedRows.length} item{savedRows.length !== 1 ? 's' : ''} — Total: Rs. {grandTotal.toFixed(2)}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-row gap-2 sm:justify-end">
          <Button variant="outline" onClick={onClose} className="gap-1">
            <X className="h-4 w-4" />
            Close
          </Button>
          <Button onClick={handlePrint} className="gap-1">
            <Printer className="h-4 w-4" />
            Print Receipt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
