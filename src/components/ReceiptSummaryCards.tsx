
import React, { useMemo } from 'react';
import { Receipt, DollarSign, Package } from 'lucide-react';
import { Receipt as ReceiptType } from '@/contexts/ReceiptsContext';

interface ReceiptSummaryCardsProps {
  receipts: ReceiptType[];
}

export const ReceiptSummaryCards: React.FC<ReceiptSummaryCardsProps> = ({ receipts }) => {
  const salesCount = useMemo(() => receipts.filter(r => r.type === 'sales').length, [receipts]);
  const purchaseCount = useMemo(() => receipts.filter(r => r.type === 'purchase').length, [receipts]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <div className="bg-card rounded-lg shadow-lg p-4 sm:p-6 border border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Receipts</p>
            <p className="text-xl sm:text-2xl font-bold text-foreground">{receipts.length}</p>
          </div>
          <Receipt className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
        </div>
      </div>
      
      <div className="bg-card rounded-lg shadow-lg p-4 sm:p-6 border border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Sales Receipts</p>
            <p className="text-xl sm:text-2xl font-bold text-accent-foreground">{salesCount}</p>
          </div>
          <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-accent-foreground" />
        </div>
      </div>
      
      <div className="bg-card rounded-lg shadow-lg p-4 sm:p-6 border border-border sm:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Purchase Receipts</p>
            <p className="text-xl sm:text-2xl font-bold text-primary">{purchaseCount}</p>
          </div>
          <Package className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
        </div>
      </div>
    </div>
  );
};
