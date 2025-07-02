
import React from 'react';

export const TableHeader: React.FC = () => {
  return (
    <thead className="hidden md:table-header-group">
      <tr className="bg-gray-50 border-b-2 border-gray-200">
        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">
          Item Name
        </th>
        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">
          Qty (Kg)
        </th>
        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">
          Price
        </th>
        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
          Total
        </th>
      </tr>
    </thead>
  );
};
