
import React from 'react';

interface TableFooterProps {
  totalAmount: number;
  totalQuantity: number;
  distinctItems: number;
}

export const TableFooter: React.FC<TableFooterProps> = ({ totalAmount, totalQuantity, distinctItems }) => {
  return (
    <tfoot>
      <tr className="bg-blue-50 border-t-2 border-blue-200">
        <td colSpan={4} className="px-4 sm:px-6 py-4 text-center font-bold text-base sm:text-lg text-gray-800">
          <div className="flex items-center justify-center gap-2">
            <span>Total Add Items</span>
            <div className="px-3 py-1 bg-blue-100 rounded-md text-blue-800 font-bold">
              {distinctItems}
            </div>
          </div>
        </td>
      </tr>
      <tr className="bg-blue-50">
        <td colSpan={3} className="px-4 sm:px-6 py-4 text-right font-bold text-base sm:text-lg text-gray-800">
          Grand Total:
        </td>
        <td className="px-4 sm:px-6 py-4">
          <div className="px-3 py-2 bg-blue-100 rounded-md text-blue-800 font-bold text-base sm:text-lg">
            Rs{totalAmount.toFixed(2)}
          </div>
        </td>
      </tr>
    </tfoot>
  );
};
