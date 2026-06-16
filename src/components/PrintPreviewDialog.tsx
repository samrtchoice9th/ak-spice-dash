import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getInvoiceNumber } from '@/utils/printReceipt';

interface PrintPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipt: any;
  onConfirmPrint: () => void;
}

export const PrintPreviewDialog: React.FC<PrintPreviewDialogProps> = ({
  open,
  onOpenChange,
  receipt,
  onConfirmPrint,
}) => {
  if (!receipt) return null;

  const invoiceNumber = getInvoiceNumber(receipt);
  const date = receipt.date || '';
  const time = receipt.time || '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Print Preview</DialogTitle>
        </DialogHeader>

        <div id="receipt-preview" className="bg-white text-black p-4 font-mono text-sm border rounded">
          <div className="text-center mb-3 border-b border-dashed border-black pb-2">
            <div className="text-lg font-bold mb-1">RECEIPT</div>
          </div>

          <div className="flex justify-between mb-2 text-xs border-b border-black pb-2">
            <div>Invoice: <strong>{invoiceNumber}</strong></div>
            <div className="text-right">
              {date}<br />
              {time}
            </div>
          </div>

          <div className="mb-2">
            <div className="border-b border-dashed border-black pb-1 mb-2 font-bold text-xs text-center">
              ITEM | QTY | PRICE | AMOUNT
            </div>

            {receipt.items?.map((item: any, index: number) => (
              <div key={index} className="mb-2 text-xs border-b border-dotted border-black pb-1">
                <div className="font-bold mb-0.5">{item.itemName}</div>
                <div className="text-center">
                  {item.qty} | Rs.{Number(item.price).toFixed(2)} | Rs.{Number(item.total).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-black mt-3 pt-2 text-center">
            <div className="text-sm font-bold mb-2 border-2 border-black p-2">
              TOTAL: Rs. {Number(receipt.totalAmount || 0).toFixed(2)}
            </div>
            <div className="text-xs mt-2">Items: {receipt.items?.length || 0}</div>
            <div className="text-xs mt-3 border-t border-dashed border-black pt-2">
              Thank you for your business!<br />
              Visit us again
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirmPrint}>Print Receipt</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
