
import React from 'react';

interface TableFooterProps {
  totalAmount: number;
}

export const TableFooter: React.FC<TableFooterProps> = ({ totalAmount }) => {
  return (
    <tfoot>
      <tr className="bg-blue-50 border-t-2 border-blue-200">
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
