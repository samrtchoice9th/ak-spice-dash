import React, { useState } from 'react';
import { useReceipts } from '@/contexts/ReceiptsContext';
import { Receipt, Calendar, DollarSign, Package, Printer, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { EditReceiptDialog } from '@/components/EditReceiptDialog';

const ReceiptPage = () => {
  const { receipts, loading, updateReceipt } = useReceipts();
  const { toast } = useToast();
  const [editingReceipt, setEditingReceipt] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEditReceipt = (receipt: any) => {
    setEditingReceipt(receipt);
    setIsEditDialogOpen(true);
  };

  const handleSaveReceipt = async (id: string, receiptData: any) => {
    await updateReceipt(id, receiptData);
  };

  const checkPrinterAndPrint = async (receipt: any) => {
    console.log('Checking printer connectivity...');
    
    try {
      // Check if the browser supports printing
      if (!window.print) {
        toast({
          title: "Printing not supported",
          description: "Your browser doesn't support printing functionality.",
          variant: "destructive"
        });
        return;
      }

      // Create print content
      const printContent = generatePrintContent(receipt);
      
      // Open a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast({
          title: "Print blocked",
          description: "Pop-up blocked. Please allow pop-ups and try again.",
          variant: "destructive"
        });
        return;
      }

      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Wait for content to load
      printWindow.onload = () => {
        // Check if we can access printer info (limited browser support)
        if ('navigator' in window && 'mediaDevices' in navigator) {
          // Modern approach - attempt to print directly
          setTimeout(() => {
            try {
              printWindow.print();
              
              // Check if print dialog was actually shown
              setTimeout(() => {
                if (!printWindow.closed) {
                  printWindow.close();
                }
                toast({
                  title: "Print job sent",
                  description: "Receipt has been sent to your printer.",
                });
              }, 1000);
              
            } catch (error) {
              console.error('Print error:', error);
              printWindow.close();
              toast({
                title: "No printer detected",
                description: "Please check your printer connection and try again.",
                variant: "destructive"
              });
            }
          }, 250);
        } else {
          // Fallback for older browsers
          setTimeout(() => {
            try {
              printWindow.print();
              setTimeout(() => {
                if (!printWindow.closed) {
                  printWindow.close();
                }
                toast({
                  title: "Print dialog opened",
                  description: "Please select your printer and confirm printing.",
                });
              }, 1000);
            } catch (error) {
              console.error('Print error:', error);
              printWindow.close();
              toast({
                title: "No printer detected",
                description: "Please check your printer connection and try again.",
                variant: "destructive"
              });
            }
          }, 250);
        }
      };

      // Handle print window errors
      printWindow.onerror = () => {
        printWindow.close();
        toast({
          title: "No printer detected",
          description: "Please check your printer connection and try again.",
          variant: "destructive"
        });
      };

    } catch (error) {
      console.error('Printing failed:', error);
      toast({
        title: "No printer detected",
        description: "Please check your printer connection and try again.",
        variant: "destructive"
      });
    }
  };

  const generatePrintContent = (receipt: any) => {
    const printStyles = `
      <style>
        @media print {
          @page { 
            size: 76mm auto;
            margin: 2mm;
          }
          body { 
            font-family: 'Courier New', monospace;
            font-size: 10px;
            line-height: 1.3;
            margin: 0;
            padding: 2mm;
            width: 72mm;
          }
          .receipt-header {
            text-align: center;
            margin-bottom: 4mm;
            border-bottom: 1px dashed black;
            padding-bottom: 2mm;
          }
          .company-name {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 1mm;
          }
          .company-details {
            font-size: 8px;
            margin-bottom: 1mm;
          }
          .invoice-info {
            display: flex;
            justify-content: space-between;
            margin: 2mm 0;
            font-size: 8px;
          }
          .receipt-table {
            width: 100%;
            margin: 2mm 0;
          }
          .table-header {
            border-bottom: 1px dashed black;
            padding-bottom: 1mm;
            margin-bottom: 2mm;
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            font-size: 9px;
          }
          .receipt-item {
            margin-bottom: 1mm;
            font-size: 9px;
          }
          .item-name {
            font-weight: bold;
            margin-bottom: 0.5mm;
          }
          .item-details {
            display: flex;
            justify-content: space-between;
            font-size: 8px;
          }
          .receipt-total {
            border-top: 1px dashed black;
            margin-top: 3mm;
            padding-top: 2mm;
            text-align: center;
          }
          .total-line {
            font-size: 12px;
            font-weight: bold;
            margin: 2mm 0;
          }
          .thank-you {
            text-align: center;
            font-size: 8px;
            margin-top: 3mm;
            border-top: 1px dashed black;
            padding-top: 2mm;
          }
        }
      </style>
    `;

    const currentDate = new Date();
    const invoiceNumber = `INVM-${currentDate.getFullYear().toString().slice(-2)}-${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>AK Spice - Receipt</title>
          ${printStyles}
        </head>
        <body>
          <div class="receipt-header">
            <div class="company-name">AK SPICE TRADING</div>
            <div class="company-details">
              Mo: +974773962001<br>
              36, In Front of Ajile Factory<br>
              Mahiyangana
            </div>
          </div>
          
          <div class="invoice-info">
            <div>
              Invoice N: ${invoiceNumber}<br>
              Invoice by: ADMIN /
            </div>
            <div style="text-align: right;">
              ${receipt.date}<br>
              ${receipt.time}
            </div>
          </div>

          <div class="receipt-table">
            <div class="table-header">
              <span>ITEM NAME</span>
              <span>QTY</span>
              <span>Price</span>
              <span>Amount</span>
            </div>
            
            ${receipt.items.map(item => `
              <div class="receipt-item">
                <div class="item-name">${item.itemName}</div>
                <div class="item-details">
                  <span>${item.qty}kg</span>
                  <span>${item.price.toFixed(2)}</span>
                  <span>Rs.${item.total.toFixed(2)}</span>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="receipt-total">
            <div style="border-top: 1px solid black; border-bottom: 1px solid black; padding: 2mm 0;">
              <div class="total-line">
                Invoice Total Rs. : ${receipt.totalAmount.toFixed(2)}
              </div>
            </div>
            <div class="thank-you">
              Thank you for your business!<br>
              Visit us again
            </div>
          </div>
        </body>
      </html>
    `;
  };

  if (loading) {
    return (
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading receipts...</p>
        </div>
      </div>
    );
  }

  const salesReceipts = receipts.filter(r => r.type === 'sales');
  const purchaseReceipts = receipts.filter(r => r.type === 'purchase');

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-gray-800">Receipt History</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Receipts</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{receipts.length}</p>
            </div>
            <Receipt className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Sales Receipts</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">{salesReceipts.length}</p>
            </div>
            <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Purchase Receipts</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">{purchaseReceipts.length}</p>
            </div>
            <Package className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">All Receipts</h2>
        </div>
        
        {receipts.length === 0 ? (
          <div className="p-6 sm:p-8 text-center">
            <Receipt className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No receipts found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start by creating sales or purchase entries to generate receipts.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Receipt ID
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Date
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Time
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {receipts.map((receipt) => (
                  <tr key={receipt.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {receipt.id.slice(0, 8)}...
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        receipt.type === 'sales' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {receipt.type === 'sales' ? 'Sales' : 'Purchase'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                      <div className="text-sm text-gray-900">{receipt.date}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="text-sm text-gray-900">{receipt.time}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        Rs.{receipt.totalAmount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleEditReceipt(receipt)}
                          variant="outline"
                          size="sm"
                          className="flex items-center space-x-1"
                        >
                          <Edit size={16} />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                        <Button
                          onClick={() => checkPrinterAndPrint(receipt)}
                          variant="outline"
                          size="sm"
                          className="flex items-center space-x-1"
                        >
                          <Printer size={16} />
                          <span className="hidden sm:inline">Print</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EditReceiptDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingReceipt(null);
        }}
        receipt={editingReceipt}
        onSave={handleSaveReceipt}
      />
    </div>
  );
};

export default ReceiptPage;
