import React from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, X, CheckCircle } from 'lucide-react';
import { POSRow } from '@/hooks/usePOSData';
import { useReceiptPrintHandler } from '@/components/ReceiptPrintHandler';
import { WhatsAppButton } from '@/components/WhatsAppButton';

interface SaveSuccessModalProps {
  open: boolean;
  onClose: () => void;
  savedRows: POSRow[];
  type?: 'sales' | 'purchase';
  customerName?: string | null;
  customerWhatsApp?: string | null;
  paidAmount?: number;
  dueAmount?: number;
}

export const SaveSuccessModal: React.FC<SaveSuccessModalProps> = ({
  open, onClose, savedRows, type = 'sales',
  customerName, customerWhatsApp, paidAmount = 0, dueAmount = 0,
}) => {
  const { printReceipt } = useReceiptPrintHandler();

  const grandTotal = savedRows.reduce((sum, r) => sum + r.total, 0);
  const label = type === 'purchase' ? 'Purchase' : 'Sale';
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { timeZone: 'Asia/Colombo' });
  const timeStr = now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Colombo' });

  const buildReceipt = () => ({
    id:
      (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
        ? crypto.randomUUID()
        : `tmp-${Date.now()}`,
    items: savedRows.map(r => ({
      id: r.id,
      itemName: r.name,
      qty: r.qty,
      price: r.price,
      total: r.total,
    })),
    totalAmount: grandTotal,
    type,
    date: dateStr,
    time: timeStr,
  });

  const handlePrint = () => {
    printReceipt(buildReceipt());
    onClose();
  };

  const receiptText = `*AK SPICE TRADING*\nDate: ${dateStr} ${timeStr}\n${label}\n---------------\n${
    savedRows.map(r => `${r.name} x${r.qty} = Rs.${r.total.toFixed(2)}`).join('\n')
  }\n---------------\nTotal: Rs.${grandTotal.toFixed(2)}${
    paidAmount > 0 ? `\nPaid: Rs.${paidAmount.toFixed(2)}` : ''
  }${dueAmount > 0 ? `\nDue: Rs.${dueAmount.toFixed(2)}` : ''}`;

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-primary" />
            <DialogTitle>{label} Saved!</DialogTitle>
          </div>
          <DialogDescription>
            {savedRows.length} item{savedRows.length !== 1 ? 's' : ''} — Total: Rs. {grandTotal.toFixed(2)}
            {customerName && <span className="block text-xs mt-1">Customer: {customerName}</span>}
            {dueAmount > 0 && <span className="block text-xs text-destructive mt-1">Due: Rs. {dueAmount.toFixed(2)}</span>}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="gap-1">
            <X className="h-4 w-4" /> Close
          </Button>
          {customerWhatsApp && (
            <WhatsAppButton phone={customerWhatsApp} message={receiptText} label="WhatsApp" />
          )}
          <Button onClick={handlePrint} className="gap-1">
            <Printer className="h-4 w-4" /> Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
