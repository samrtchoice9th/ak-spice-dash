import React, { useState } from 'react';
import { Printer, Plus, Save } from 'lucide-react';

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
}

export const DataTable: React.FC<DataTableProps> = ({ 
  title, 
  showAddItem = false, 
  showSave = false 
}) => {
  const [rows, setRows] = useState<TableRow[]>([
    { id: '1', itemName: '', qty: 0, price: 0 },
    { id: '2', itemName: '', qty: 0, price: 0 },
    { id: '3', itemName: '', qty: 0, price: 0 },
    { id: '4', itemName: '', qty: 0, price: 0 },
    { id: '5', itemName: '', qty: 0, price: 0 },
  ]);

  const updateRow = (id: string, field: keyof TableRow, value: string | number) => {
    setRows(prev => prev.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const addRow = () => {
    const newRow: TableRow = {
      id: Date.now().toString(),
      itemName: '',
      qty: 0,
      price: 0,
    };
    setRows(prev => [...prev, newRow]);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    console.log('Saving data:', rows);
    alert('Data saved successfully!');
  };

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
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 border-r border-gray-200">
                    <input
                      type="text"
                      value={row.itemName}
                      onChange={(e) => updateRow(row.id, 'itemName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter item name"
                    />
                  </td>
                  <td className="px-6 py-4 border-r border-gray-200">
                    <input
                      type="number"
                      value={row.qty || ''}
                      onChange={(e) => updateRow(row.id, 'qty', parseFloat(e.target.value) || 0)}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="px-3 py-2 bg-gray-100 rounded-md text-gray-700 font-medium">
                      {(row.qty * row.price).toFixed(2)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
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
            onClick={addRow}
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
