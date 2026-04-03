import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface PayDueDialogProps {
  open: boolean;
  onClose: () => void;
  receiptId: string;
  dueAmount: number;
  receiptDate: string;
  onPay: (receiptId: string, amount: number, method: string, note?: string) => Promise<void>;
}

export const PayDueDialog: React.FC<PayDueDialogProps> = ({
  open, onClose, receiptId, dueAmount, receiptDate, onPay,
}) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('cash');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      toast({ title: 'Invalid amount', variant: 'destructive' });
      return;
    }
    if (numAmount > dueAmount) {
      toast({ title: `Amount cannot exceed due (Rs.${dueAmount.toFixed(2)})`, variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      await onPay(receiptId, numAmount, method, note || undefined);
      toast({ title: `Payment of Rs.${numAmount.toFixed(2)} recorded` });
      setAmount('');
      setNote('');
      onClose();
    } catch (err: any) {
      toast({ title: err.message || 'Payment failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Pay Due Balance</DialogTitle>
          <DialogDescription>Receipt: {receiptDate}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-center">
            <p className="text-xs text-muted-foreground">Outstanding Due</p>
            <p className="text-lg font-bold text-destructive">Rs. {dueAmount.toFixed(2)}</p>
          </div>

          <div className="space-y-1">
            <Label>Amount</Label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              max={dueAmount}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Max: ${dueAmount.toFixed(2)}`}
            />
          </div>

          <div className="space-y-1">
            <Label>Payment Method</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="bank">Bank</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Note (optional)</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Payment note..." />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Processing...' : 'Record Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
