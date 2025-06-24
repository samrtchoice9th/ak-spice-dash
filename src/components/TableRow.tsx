
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
          inputRef={(ref) => {
            if (inputRefs.current) {
              inputRefs.current[`${row.id}-itemName`] = ref;
            }
          }}
        />
      </td>
      <td className="px-6 py-4 border-r border-gray-200">
        <input
          ref={(ref) => {
            if (inputRefs.current) {
              inputRefs.current[`${row.id}-qty`] = ref;
            }
          }}
          type="number"
          value={row.qty === 0 ? '' : row.qty}
          onChange={(e) => {
            const value = e.target.value;
            onUpdateRow(row.id, 'qty', value === '' ? 0 : parseFloat(value) || 0);
          }}
          onKeyDown={(e) => onKeyDown(e, index, 'qty')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="0"
          step="0.01"
        />
      </td>
      <td className="px-6 py-4 border-r border-gray-200">
        <input
          ref={(ref) => {
            if (inputRefs.current) {
              inputRefs.current[`${row.id}-price`] = ref;
            }
          }}
          type="number"
          value={row.price === 0 ? '' : row.price}
          onChange={(e) => {
            const value = e.target.value;
            onUpdateRow(row.id, 'price', value === '' ? 0 : parseFloat(value) || 0);
          }}
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
