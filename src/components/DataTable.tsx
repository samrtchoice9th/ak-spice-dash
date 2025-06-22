
import React, { useState, useEffect, useRef } from 'react';
import { Printer, Plus, Save } from 'lucide-react';
import { ItemSearchDropdown } from './ItemSearchDropdown';
import { AddItemDialog } from './AddItemDialog';
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
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const { addReceipt } = useReceipts();

  const updateRow = (id: string, field: keyof TableRow, value: string | number) => {
    setRows(prev => prev.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const handleKeyDown = (e: React.KeyboardEvent, rowIndex: number, field: 'itemName' | 'qty' | 'price') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const currentRow = rows[rowIndex];
      
      // Move to next field in the same row
      if (field === 'itemName' && currentRow.itemName) {
        const qtyRef = inputRefs.current[`${currentRow.id}-qty`];
        qtyRef?.focus();
      } else if (field === 'qty' && currentRow.qty > 0) {
        const priceRef = inputRefs.current[`${currentRow.id}-price`];
        priceRef?.focus();
      } else if (field === 'price' && currentRow.price > 0) {
        // Check if current row is complete
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
            // Focus on the new row's item name field after state update
            setTimeout(() => {
              const newRowRef = inputRefs.current[`${newRow.id}-itemName`];
              newRowRef?.focus();
            }, 0);
          } else {
            // Move to next existing row's item name field
            const nextRow = rows[rowIndex + 1];
            const nextRowRef = inputRefs.current[`${nextRow.id}-itemName`];
            nextRowRef?.focus();
          }
        }
      }
    }
  };

  const addNewItem = () => {
    setIsAddItemDialogOpen(true);
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
                    <ItemSearchDropdown
                      value={row.itemName}
                      onChange={(value) => updateRow(row.id, 'itemName', value)}
                      onKeyDown={(e) => handleKeyDown(e, index, 'itemName')}
                      inputRef={(ref) => inputRefs.current[`${row.id}-itemName`] = ref}
                    />
                  </td>
                  <td className="px-6 py-4 border-r border-gray-200">
                    <input
                      ref={(ref) => inputRefs.current[`${row.id}-qty`] = ref}
                      type="number"
                      value={row.qty || ''}
                      onChange={(e) => updateRow(row.id, 'qty', parseFloat(e.target.value) || 0)}
                      onKeyDown={(e) => handleKeyDown(e, index, 'qty')}
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
                      onChange={(e) => updateRow(row.id, 'price', parseFloat(e.target.value) || 0)}
                      onKeyDown={(e) => handleKeyDown(e, index, 'price')}
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

      <AddItemDialog 
        isOpen={isAddItemDialogOpen}
        onClose={() => setIsAddItemDialogOpen(false)}
      />
    </div>
  );
};
