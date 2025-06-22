
import React, { useState, useEffect } from 'react';
import { Printer, Plus, Save } from 'lucide-react';
import { ItemSearchDropdown } from './ItemSearchDropdown';
import { useReceipts, ReceiptItem } from '@/contexts/ReceiptsContext';

interface TableRow {
  id: string;
  itemName: string;
  qty: number;
  price: number;
}

interface DataTableProps {
  title: string;
  showAddItem?: boolean;
  showSave?: boolean;
  type?: 'purchase' | 'sales';
}

export const DataTable: React.FC<DataTableProps> = ({ 
  title, 
  showAddItem = false, 
  showSave = false,
  type = 'sales'
}) => {
  // Start with only one empty row
  const [rows, setRows] = useState<TableRow[]>([
    { id: '1', itemName: '', qty: 0, price: 0 }
  ]);
  const [currentRowIndex, setCurrentRowIndex] = useState(0);

  const { addReceipt } = useReceipts();

  const updateRow = (id: string, field: keyof TableRow, value: string | number) => {
    setRows(prev => prev.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const handleKeyDown = (e: React.KeyboardEvent, rowIndex: number) => {
    if (e.key === 'Enter') {
      const currentRow = rows[rowIndex];
      // Check if current row has all required fields filled
      if (currentRow.itemName && currentRow.qty > 0 && currentRow.price > 0) {
        // If this is the last row and it's complete, add a new row
        if (rowIndex === rows.length - 1) {
          const newRow: TableRow = {
            id: Date.now().toString(),
            itemName: '',
            qty: 0,
            price: 0,
          };
          setRows(prev => [...prev, newRow]);
          setCurrentRowIndex(rowIndex + 1);
        } else {
          // Move to next existing row
          setCurrentRowIndex(Math.min(rowIndex + 1, rows.length - 1));
        }
      }
    }
  };

  const addNewItem = () => {
    // Find first empty item name field and focus on it
    const emptyRowIndex = rows.findIndex(row => !row.itemName);
    if (emptyRowIndex !== -1) {
      setCurrentRowIndex(emptyRowIndex);
    } else {
      // All rows have item names, add a new row
      const newRow: TableRow = {
        id: Date.now().toString(),
        itemName: '',
        qty: 0,
        price: 0,
      };
      setRows(prev => [...prev, newRow]);
      setCurrentRowIndex(rows.length);
    }
  };

  const calculateTotal = () => {
    return rows.reduce((sum, row) => sum + (row.qty * row.price), 0);
  };

  const handlePrint = () => {
    const receiptItems: ReceiptItem[] = rows
      .filter(row => row.itemName && row.qty > 0 && row.price > 0)
      .map(row => ({
        id: row.id,
        itemName: row.itemName,
        qty: row.qty,
        price: row.price,
        total: row.qty * row.price
      }));

    if (receiptItems.length > 0) {
      addReceipt({
        type,
        items: receiptItems,
        totalAmount: calculateTotal()
      });
    }

    // Add thermal printer styles
    const printStyles = `
      <style>
        @media print {
          @page { 
            size: 58mm auto;
            margin: 2mm;
          }
          body { 
            font-family: monospace;
            font-size: 8px;
            line-height: 1.2;
            margin: 0;
            padding: 2mm;
          }
          .receipt-header {
            text-align: center;
            margin-bottom: 3mm;
            font-weight: bold;
          }
          .receipt-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 1mm;
          }
          .receipt-total {
            border-top: 1px dashed black;
            margin-top: 2mm;
            padding-top: 1mm;
            font-weight: bold;
          }
        }
      </style>
    `;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>AK Spice - ${title}</title>
          ${printStyles}
        </head>
        <body>
          <div class="receipt-header">
            <div>AK SPICE</div>
            <div>${title.toUpperCase()}</div>
            <div>${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
          </div>
          ${receiptItems.map(item => `
            <div class="receipt-item">
              <span>${item.itemName}</span>
            </div>
            <div class="receipt-item">
              <span>${item.qty}kg x Rs${item.price}</span>
              <span>Rs${item.total.toFixed(2)}</span>
            </div>
          `).join('')}
          <div class="receipt-total">
            <div class="receipt-item">
              <span>TOTAL:</span>
              <span>Rs${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  const handleSave = () => {
    const receiptItems: ReceiptItem[] = rows
      .filter(row => row.itemName && row.qty > 0 && row.price > 0)
      .map(row => ({
        id: row.id,
        itemName: row.itemName,
        qty: row.qty,
        price: row.price,
        total: row.qty * row.price
      }));

    if (receiptItems.length > 0) {
      addReceipt({
        type: 'purchase',
        items: receiptItems,
        totalAmount: calculateTotal()
      });
      alert('Receipt saved successfully!');
    } else {
      alert('Please add at least one item with valid data');
    }
  };

  const totalAmount = calculateTotal();

  return (
    <div className="flex-1 p-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">{title}</h1>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
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
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 border-r border-gray-200">
                    {type === 'purchase' ? (
                      <ItemSearchDropdown
                        value={row.itemName}
                        onChange={(value) => updateRow(row.id, 'itemName', value)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                      />
                    ) : (
                      <input
                        type="text"
                        value={row.itemName}
                        onChange={(e) => updateRow(row.id, 'itemName', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter item name"
                      />
                    )}
                  </td>
                  <td className="px-6 py-4 border-r border-gray-200">
                    <input
                      type="number"
                      value={row.qty || ''}
                      onChange={(e) => updateRow(row.id, 'qty', parseFloat(e.target.value) || 0)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                      step="0.01"
                    />
                  </td>
                  <td className="px-6 py-4 border-r border-gray-200">
                    <input
                      type="number"
                      value={row.price || ''}
                      onChange={(e) => updateRow(row.id, 'price', parseFloat(e.target.value) || 0)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="px-3 py-2 bg-gray-100 rounded-md text-gray-700 font-medium">
                      Rs{(row.qty * row.price).toFixed(2)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-blue-50 border-t-2 border-blue-200">
                <td colSpan={3} className="px-6 py-4 text-right font-bold text-lg text-gray-800">
                  Grand Total:
                </td>
                <td className="px-6 py-4">
                  <div className="px-3 py-2 bg-blue-100 rounded-md text-blue-800 font-bold text-lg">
                    Rs{totalAmount.toFixed(2)}
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-4 justify-center">
        <button
          onClick={handlePrint}
          className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white font-medium rounded-lg border-2 border-gray-600 hover:bg-gray-700 transition-colors"
        >
          <Printer size={20} />
          <span>Print</span>
        </button>
        
        {showAddItem && (
          <button
            onClick={addNewItem}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg border-2 border-blue-600 hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>Add Item</span>
          </button>
        )}
        
        {showSave && (
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg border-2 border-green-600 hover:bg-green-700 transition-colors"
          >
            <Save size={20} />
            <span>Save</span>
          </button>
        )}
      </div>
    </div>
  );
};
