import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PaymentSectionProps {
  grandTotal: number;
  paidAmount: number;
  onPaidAmountChange: (amount: number) => void;
  dueDate: string;
  onDueDateChange: (date: string) => void;
}

export const PaymentSection: React.FC<PaymentSectionProps> = ({
  grandTotal,
  paidAmount,
  onPaidAmountChange,
  dueDate,
  onDueDateChange,
}) => {
  const dueAmount = Math.max(0, grandTotal - paidAmount);

  return (
    <div className="p-3 bg-muted/30 rounded-lg border space-y-2">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-end">
        <div>
          <Label className="text-xs">Total</Label>
          <div className="text-sm font-bold text-foreground">Rs. {grandTotal.toFixed(2)}</div>
        </div>
        <div>
          <Label className="text-xs">Paid Amount</Label>
          <Input
            type="number"
            min={0}
            max={grandTotal}
            value={paidAmount || ''}
            onChange={e => onPaidAmountChange(Math.max(0, Number(e.target.value)))}
            className="h-8 text-sm"
            placeholder="0"
          />
        </div>
        <div>
          <Label className="text-xs">Due Amount</Label>
          <div className={`text-sm font-bold ${dueAmount > 0 ? 'text-destructive' : 'text-primary'}`}>
            Rs. {dueAmount.toFixed(2)}
          </div>
        </div>
        <div>
          <Label className="text-xs">Due Date</Label>
          <Input
            type="date"
            value={dueDate}
            onChange={e => onDueDateChange(e.target.value)}
            className="h-8 text-sm"
            disabled={dueAmount <= 0}
          />
        </div>
      </div>
    </div>
  );
};
