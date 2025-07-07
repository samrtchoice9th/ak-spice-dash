
import React from 'react';
import { Receipt, DollarSign, Package } from 'lucide-react';
import { Receipt as ReceiptType } from '@/contexts/ReceiptsContext';

interface ReceiptSummaryCardsProps {
  receipts: ReceiptType[];
}

export const ReceiptSummaryCards: React.FC<ReceiptSummaryCardsProps> = ({ receipts }) => {
  const salesReceipts = receipts.filter(r => r.type === 'sales');
  const purchaseReceipts = receipts.filter(r => r.type === 'purchase');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">Total Receipts</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{receipts.length}</p>
          </div>
          <Receipt className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">Sales Receipts</p>
            <p className="text-xl sm:text-2xl font-bold text-green-600">{salesReceipts.length}</p>
          </div>
          <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200 sm:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">Purchase Receipts</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-600">{purchaseReceipts.length}</p>
          </div>
          <Package className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
        </div>
      </div>
    </div>
  );
};
