import React from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, X, CheckCircle, FileText } from 'lucide-react';
import { POSRow } from '@/hooks/usePOSData';
import { printToRawBT } from '@/utils/printReceipt';
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
  const grandTotal = savedRows.reduce((sum, r) => sum + r.total, 0);
  const label = type === 'purchase' ? 'Purchase' : 'Sale';

  const handlePrint = () => {
    const tableRows = savedRows.map(r => ({
      id: r.id, itemName: r.name, qty: r.qty, price: r.price,
    }));
    printToRawBT(tableRows, label, () => grandTotal, () => Promise.resolve(), type, () => {});
    onClose();
  };

  const handlePrintPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const now = new Date();
    const dateStr = now.toLocaleDateString();
    const itemsHtml = savedRows.map(r =>
      `<tr><td style="padding:4px;border-bottom:1px solid #eee">${r.name}</td>
       <td style="padding:4px;text-align:center;border-bottom:1px solid #eee">${r.qty}</td>
       <td style="padding:4px;text-align:right;border-bottom:1px solid #eee">Rs.${r.price.toFixed(2)}</td>
       <td style="padding:4px;text-align:right;border-bottom:1px solid #eee">Rs.${r.total.toFixed(2)}</td></tr>`
    ).join('');

    printWindow.document.write(`<!DOCTYPE html><html><head><title>Receipt</title>
      <style>body{font-family:sans-serif;padding:20px;max-width:400px;margin:0 auto}
      table{width:100%;border-collapse:collapse}th{text-align:left;padding:4px;border-bottom:2px solid #333;font-size:12px}
      .total{font-size:16px;font-weight:bold;margin-top:10px;text-align:right}
      .header{text-align:center;margin-bottom:15px}h2{margin:0}
      @media print{body{padding:5px}}</style></head><body>
      <div class="header"><h2>AK SPICE</h2><p style="font-size:12px">${dateStr} • ${label}</p>
      ${customerName ? `<p style="font-size:12px">Customer: ${customerName}</p>` : ''}</div>
      <table><thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Total</th></tr></thead>
      <tbody>${itemsHtml}</tbody></table>
      <div class="total">Grand Total: Rs.${grandTotal.toFixed(2)}</div>
      ${paidAmount > 0 ? `<p style="text-align:right;font-size:13px">Paid: Rs.${paidAmount.toFixed(2)}</p>` : ''}
      ${dueAmount > 0 ? `<p style="text-align:right;font-size:13px;color:red">Due: Rs.${dueAmount.toFixed(2)}</p>` : ''}
      <p style="text-align:center;font-size:11px;margin-top:20px;color:#888">Thank you for your business!</p>
      </body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  const receiptText = `*AK SPICE*\nDate: ${new Date().toLocaleDateString()}\n${label}\n---------------\n${
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
          <Button variant="outline" onClick={handlePrintPDF} className="gap-1">
            <FileText className="h-4 w-4" /> PDF
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
