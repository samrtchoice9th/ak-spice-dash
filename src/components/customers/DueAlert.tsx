import React from 'react';
import { Badge } from '@/components/ui/badge';

interface DueAlertProps {
  dueAmount: number;
  dueDate?: string | null;
}

export const DueAlert: React.FC<DueAlertProps> = ({ dueAmount, dueDate }) => {
  if (dueAmount <= 0) return null;

  const isOverdue = dueDate ? new Date(dueDate) <= new Date() : false;
  const isUpcoming = dueDate
    ? (() => {
        const d = new Date(dueDate);
        const now = new Date();
        const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return diff > 0 && diff <= 3;
      })()
    : false;

  return (
    <Badge
      variant="outline"
      className={
        isOverdue
          ? 'border-destructive bg-destructive/10 text-destructive'
          : isUpcoming
          ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
          : 'border-orange-400 bg-orange-50 text-orange-700'
      }
    >
      Due: Rs.{dueAmount.toFixed(2)}
      {isOverdue && ' (Overdue)'}
    </Badge>
  );
};
