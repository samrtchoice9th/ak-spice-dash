
import React, { useState } from 'react';
import { useReceipts, Receipt, ReceiptItem } from '@/contexts/ReceiptsContext';
import { Edit, Trash2, Eye, Calendar, Clock, DollarSign, Printer, Loader2 } from 'lucide-react';

const ReceiptPage = () => {
  const { receipts, updateReceipt, deleteReceipt, loading } = useReceipts();
  const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<Receipt | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleEdit = (receipt: Receipt) => {
    setEditingReceipt({ ...receipt });
  };

  const handleSaveEdit = async () => {
    if (editingReceipt) {
      try {
        setIsUpdating(true);
        const totalAmount = editingReceipt.items.reduce((sum, item) => sum + item.total, 0);
        await updateReceipt(editingReceipt.id, {
          ...editingReceipt,
          totalAmount
        });
        setEditingReceipt(null);
      } catch (error) {
        alert('Failed to update receipt. Please try again.');
      } finally {
        setIsUpdating(false);
      }
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

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this receipt?')) {
      try {
        setIsDeleting(id);
        await deleteReceipt(id);
      } catch (error) {
        alert('Failed to delete receipt. Please try again.');
      } finally {
        setIsDeleting(null);
      }
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
              <span>${item.qty}kg x ₹${item.price}</span>
              <span>₹${item.total.toFixed(2)}</span>
            </div>
          `).join('')}
          <div class="receipt-total">
            <div class="receipt-item">
              <span>TOTAL:</span>
              <span>₹${receipt.totalAmount.toFixed(2)}</span>
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

  if (loading) {
    return (
      <div className="flex-1 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="animate-spin" size={24} />
          <span className="text-sm sm:text-base">Loading receipts...</span>
        </div>
      </div>
    );
  }

  if (editingReceipt) {
    return (
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-gray-800">Edit Receipt</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
            <h2 className="text-lg sm:text-xl font-semibold capitalize">{editingReceipt.type} Receipt</h2>
            <div className="text-sm text-gray-600">
              {editingReceipt.date} at {editingReceipt.time}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left text-xs sm:text-sm">Item Name</th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left text-xs sm:text-sm">Qty (Kg)</th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left text-xs sm:text-sm">Price</th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left text-xs sm:text-sm">Total</th>
                </tr>
              </thead>
              <tbody>
                {editingReceipt.items.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      <input
                        type="text"
                        value={item.itemName}
                        onChange={(e) => handleItemEdit(index, 'itemName', e.target.value)}
                        className="w-full px-1 sm:px-2 py-1 border border-gray-300 rounded text-xs sm:text-sm"
                      />
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) => handleItemEdit(index, 'qty', parseFloat(e.target.value) || 0)}
                        className="w-full px-1 sm:px-2 py-1 border border-gray-300 rounded text-xs sm:text-sm"
                        step="0.01"
                      />
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => handleItemEdit(index, 'price', parseFloat(e.target.value) || 0)}
                        className="w-full px-1 sm:px-2 py-1 border border-gray-300 rounded text-xs sm:text-sm"
                        step="0.01"
                      />
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 font-medium text-xs sm:text-sm">
                      ₹{item.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-blue-50 font-bold">
                  <td colSpan={3} className="border border-gray-300 px-2 sm:px-4 py-2 text-right text-xs sm:text-sm">
                    Grand Total:
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2 text-xs sm:text-sm">
                    ₹{editingReceipt.items.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <button
              onClick={handleSaveEdit}
              disabled={isUpdating}
              className="px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              {isUpdating && <Loader2 className="animate-spin" size={16} />}
              <span>Save Changes</span>
            </button>
            <button
              onClick={() => setEditingReceipt(null)}
              disabled={isUpdating}
              className="px-4 sm:px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
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
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-gray-800">Receipt Details</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6 border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 gap-4">
            <h2 className="text-xl sm:text-2xl font-semibold capitalize text-blue-800">
              {viewingReceipt.type} Receipt
            </h2>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => handlePrintReceipt(viewingReceipt)}
                className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
              >
                <Printer size={16} />
                <span>Print</span>
              </button>
              <button
                onClick={() => setViewingReceipt(null)}
                className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
              >
                Back to List
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center space-x-2 text-gray-600">
              <Calendar size={20} />
              <span className="text-sm sm:text-base">{viewingReceipt.date}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Clock size={20} />
              <span className="text-sm sm:text-base">{viewingReceipt.time}</span>
            </div>
            <div className="flex items-center space-x-2 text-green-600 font-semibold">
              <DollarSign size={20} />
              <span className="text-sm sm:text-base">₹{viewingReceipt.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left text-xs sm:text-sm">Item Name</th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left text-xs sm:text-sm">Qty (Kg)</th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left text-xs sm:text-sm">Price</th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left text-xs sm:text-sm">Total</th>
                </tr>
              </thead>
              <tbody>
                {viewingReceipt.items.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-xs sm:text-sm">{item.itemName}</td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-xs sm:text-sm">{item.qty}</td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-xs sm:text-sm">₹{item.price.toFixed(2)}</td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 font-medium text-xs sm:text-sm">₹{item.total.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="bg-blue-50 font-bold">
                  <td colSpan={3} className="border border-gray-300 px-2 sm:px-4 py-2 text-right text-xs sm:text-sm">
                    Grand Total:
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2 text-xs sm:text-sm">
                    ₹{viewingReceipt.totalAmount.toFixed(2)}
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
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-gray-800">Receipt Management</h1>
      
      {receipts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 text-center border border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4">No Receipts Found</h2>
          <p className="text-sm sm:text-base text-gray-600">Create sales or purchase entries to see receipts here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <th className="px-3 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-gray-700">Type</th>
                  <th className="px-3 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-3 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 hidden sm:table-cell">Time</th>
                  <th className="px-3 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-gray-700">Items</th>
                  <th className="px-3 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-gray-700">Total Amount</th>
                  <th className="px-3 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((receipt) => (
                  <tr key={receipt.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4">
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                        receipt.type === 'purchase' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {receipt.type.charAt(0).toUpperCase() + receipt.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-gray-700 text-xs sm:text-sm">{receipt.date}</td>
                    <td className="px-3 sm:px-6 py-4 text-gray-700 text-xs sm:text-sm hidden sm:table-cell">{receipt.time}</td>
                    <td className="px-3 sm:px-6 py-4 text-gray-700 text-xs sm:text-sm">{receipt.items.length} items</td>
                    <td className="px-3 sm:px-6 py-4 font-semibold text-green-600 text-xs sm:text-sm">
                      ₹{receipt.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <div className="flex space-x-1 sm:space-x-2">
                        <button
                          onClick={() => setViewingReceipt(receipt)}
                          className="p-1 sm:p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye size={14} className="sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(receipt)}
                          className="p-1 sm:p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={14} className="sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(receipt.id)}
                          disabled={isDeleting === receipt.id}
                          className="p-1 sm:p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {isDeleting === receipt.id ? (
                            <Loader2 className="animate-spin" size={14} />
                          ) : (
                            <Trash2 size={14} className="sm:w-4 sm:h-4" />
                          )}
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
