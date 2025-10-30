
import React from 'react';

interface TableHeaderProps {
  type?: 'purchase' | 'sales' | 'adjustment';
}

export const TableHeader: React.FC<TableHeaderProps> = ({ type = 'sales' }) => {
  const isAdjustment = type === 'adjustment';

  return (
    <thead className="hidden md:table-header-group">
      <tr className="bg-gray-50 border-b-2 border-gray-200">
        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">
          Item Name
        </th>
        {isAdjustment && (
          <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 border-r border-gray-200">
            Action
          </th>
        )}
        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">
          Qty (Kg)
        </th>
        {!isAdjustment && (
          <>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">
              Price
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Total
            </th>
          </>
        )}
      </tr>
    </thead>
  );
};
