
import React from 'react';
import { Receipt, Edit, Printer, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Receipt as ReceiptType } from '@/contexts/ReceiptsContext';

interface ReceiptsTableProps {
  receipts: ReceiptType[];
  onEdit: (receipt: ReceiptType) => void;
  onPrint: (receipt: ReceiptType) => void;
  onRawBTPrint?: (receipt: ReceiptType) => void;
}

export const ReceiptsTable: React.FC<ReceiptsTableProps> = ({ receipts, onEdit, onPrint, onRawBTPrint }) => {
  if (receipts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">All Receipts</h2>
        </div>
        <div className="p-6 sm:p-8 text-center">
          <Receipt className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No receipts found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Start by creating sales or purchase entries to generate receipts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">All Receipts</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Receipt ID
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Date
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Time
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Amount
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {receipts.map((receipt) => (
              <tr key={receipt.id} className="hover:bg-gray-50">
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {receipt.id.slice(0, 8)}...
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    receipt.type === 'sales' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {receipt.type === 'sales' ? 'Sales' : 'Purchase'}
                  </span>
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                  <div className="text-sm text-gray-900">{receipt.date}</div>
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                  <div className="text-sm text-gray-900">{receipt.time}</div>
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    Rs.{receipt.totalAmount.toFixed(2)}
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => onEdit(receipt)}
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-1"
                    >
                      <Edit size={16} />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                    <Button
                      onClick={() => onPrint(receipt)}
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-1"
                    >
                      <Printer size={16} />
                      <span className="hidden sm:inline">Print</span>
                    </Button>
                    {onRawBTPrint && (
                      <Button
                        onClick={() => onRawBTPrint(receipt)}
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-1"
                      >
                        <Smartphone size={16} />
                        <span className="hidden sm:inline">RawBT</span>
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
