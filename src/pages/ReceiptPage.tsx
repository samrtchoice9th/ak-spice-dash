import React, { useState } from 'react';
import { useReceipts, Receipt, ReceiptItem } from '@/contexts/ReceiptsContext';
import { Edit, Trash2, Eye, Calendar, Clock, DollarSign, Printer } from 'lucide-react';

const ReceiptPage = () => {
  const { receipts, updateReceipt, deleteReceipt } = useReceipts();
  const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<Receipt | null>(null);

  const handleEdit = (receipt: Receipt) => {
    setEditingReceipt({ ...receipt });
  };

  const handleSaveEdit = () => {
    if (editingReceipt) {
      // Recalculate total amount
      const totalAmount = editingReceipt.items.reduce((sum, item) => sum + item.total, 0);
      updateReceipt(editingReceipt.id, {
        ...editingReceipt,
        totalAmount
      });
      setEditingReceipt(null);
    }
  };

  const handleItemEdit = (itemIndex: number, field: keyof ReceiptItem, value: string | number) => {
    if (editingReceipt) {
      const updatedItems = editingReceipt.items.map((item, index) => {
        if (index === itemIndex) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'qty' || field === 'price') {
            updatedItem.total = updatedItem.qty * updatedItem.price;
          }
          return updatedItem;
        }
        return item;
      });
      setEditingReceipt({ ...editingReceipt, items: updatedItems });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this receipt?')) {
      deleteReceipt(id);
    }
  };

  const handlePrintReceipt = (receipt: Receipt) => {
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
          <title>AK Spice - ${receipt.type}</title>
          ${printStyles}
        </head>
        <body>
          <div class="receipt-header">
            <div>AK SPICE</div>
            <div>${receipt.type.toUpperCase()}</div>
            <div>${receipt.date} ${receipt.time}</div>
          </div>
          ${receipt.items.map(item => `
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
              <span>Rs${receipt.totalAmount.toFixed(2)}</span>
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

  if (editingReceipt) {
    return (
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Edit Receipt</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold capitalize">{editingReceipt.type} Receipt</h2>
            <div className="text-sm text-gray-600">
              {editingReceipt.date} at {editingReceipt.time}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Item Name</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Qty (Kg)</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Price</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Total</th>
                </tr>
              </thead>
              <tbody>
                {editingReceipt.items.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-4 py-2">
                      <input
                        type="text"
                        value={item.itemName}
                        onChange={(e) => handleItemEdit(index, 'itemName', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) => handleItemEdit(index, 'qty', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                        step="0.01"
                      />
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => handleItemEdit(index, 'price', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                        step="0.01"
                      />
                    </td>
                    <td className="border border-gray-300 px-4 py-2 font-medium">
                      Rs{item.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-blue-50 font-bold">
                  <td colSpan={3} className="border border-gray-300 px-4 py-2 text-right">
                    Grand Total:
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    Rs{editingReceipt.items.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={handleSaveEdit}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Save Changes
            </button>
            <button
              onClick={() => setEditingReceipt(null)}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (viewingReceipt) {
    return (
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Receipt Details</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold capitalize text-blue-800">
              {viewingReceipt.type} Receipt
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => handlePrintReceipt(viewingReceipt)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Printer size={16} />
                <span>Print</span>
              </button>
              <button
                onClick={() => setViewingReceipt(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Back to List
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center space-x-2 text-gray-600">
              <Calendar size={20} />
              <span>{viewingReceipt.date}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Clock size={20} />
              <span>{viewingReceipt.time}</span>
            </div>
            <div className="flex items-center space-x-2 text-green-600 font-semibold">
              <DollarSign size={20} />
              <span>Rs{viewingReceipt.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Item Name</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Qty (Kg)</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Price</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Total</th>
                </tr>
              </thead>
              <tbody>
                {viewingReceipt.items.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-4 py-2">{item.itemName}</td>
                    <td className="border border-gray-300 px-4 py-2">{item.qty}</td>
                    <td className="border border-gray-300 px-4 py-2">Rs{item.price.toFixed(2)}</td>
                    <td className="border border-gray-300 px-4 py-2 font-medium">Rs{item.total.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="bg-blue-50 font-bold">
                  <td colSpan={3} className="border border-gray-300 px-4 py-2 text-right">
                    Grand Total:
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    Rs{viewingReceipt.totalAmount.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Receipt Management</h1>
      
      {receipts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">No Receipts Found</h2>
          <p className="text-gray-600">Create sales or purchase entries to see receipts here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Time</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Items</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Total Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((receipt) => (
                  <tr key={receipt.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        receipt.type === 'purchase' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {receipt.type.charAt(0).toUpperCase() + receipt.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{receipt.date}</td>
                    <td className="px-6 py-4 text-gray-700">{receipt.time}</td>
                    <td className="px-6 py-4 text-gray-700">{receipt.items.length} items</td>
                    <td className="px-6 py-4 font-semibold text-green-600">
                      Rs{receipt.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setViewingReceipt(receipt)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(receipt)}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(receipt.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptPage;
