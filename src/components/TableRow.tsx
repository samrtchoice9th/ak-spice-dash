
import React from 'react';
import { ItemSearchDropdown } from './ItemSearchDropdown';
import { TableRow as TableRowType } from '@/types/table';
import { calculateRowTotal } from '@/utils/calculations';

interface TableRowProps {
  row: TableRowType;
  index: number;
  onUpdateRow: (id: string, field: keyof TableRowType, value: string | number) => void;
  onKeyDown: (e: React.KeyboardEvent, rowIndex: number, field: 'itemName' | 'qty' | 'price') => void;
  inputRefs: React.MutableRefObject<{ [key: string]: HTMLInputElement | null }>;
}

export const TableRowComponent: React.FC<TableRowProps> = ({
  row,
  index,
  onUpdateRow,
  onKeyDown,
  inputRefs
}) => {
  return (
    <tr key={row.id} className="border-b border-gray-200 hover:bg-gray-50">
      <td className="px-6 py-4 border-r border-gray-200">
        <ItemSearchDropdown
          value={row.itemName}
          onChange={(value) => onUpdateRow(row.id, 'itemName', value)}
          onKeyDown={(e) => onKeyDown(e, index, 'itemName')}
          inputRef={(ref) => inputRefs.current[`${row.id}-itemName`] = ref}
        />
      </td>
      <td className="px-6 py-4 border-r border-gray-200">
        <input
          ref={(ref) => inputRefs.current[`${row.id}-qty`] = ref}
          type="number"
          value={row.qty || ''}
          onChange={(e) => onUpdateRow(row.id, 'qty', parseFloat(e.target.value) || 0)}
          onKeyDown={(e) => onKeyDown(e, index, 'qty')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="0"
          step="0.01"
        />
      </td>
      <td className="px-6 py-4 border-r border-gray-200">
        <input
          ref={(ref) => inputRefs.current[`${row.id}-price`] = ref}
          type="number"
          value={row.price || ''}
          onChange={(e) => onUpdateRow(row.id, 'price', parseFloat(e.target.value) || 0)}
          onKeyDown={(e) => onKeyDown(e, index, 'price')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="0.00"
          step="0.01"
        />
      </td>
      <td className="px-6 py-4">
        <div className="px-3 py-2 bg-gray-100 rounded-md text-gray-700 font-medium">
          Rs{calculateRowTotal(row.qty, row.price).toFixed(2)}
        </div>
      </td>
    </tr>
  );
};
