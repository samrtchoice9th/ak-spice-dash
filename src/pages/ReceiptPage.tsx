
import React, { useState } from 'react';
import { useReceipts } from '@/contexts/ReceiptsContext';
import { useProducts } from '@/contexts/ProductsContext';
import { ReceiptSummaryCards } from '@/components/ReceiptSummaryCards';
import { ReceiptsTable } from '@/components/ReceiptsTable';
import { EditReceiptDialog } from '@/components/EditReceiptDialog';
import { useReceiptPrintHandler } from '@/components/ReceiptPrintHandler';
import { Receipt as ReceiptType } from '@/contexts/ReceiptsContext';

const ReceiptPage = () => {
  const { receipts, loading, updateReceipt } = useReceipts();
  const { refreshProducts } = useProducts();
  const [editingReceipt, setEditingReceipt] = useState<ReceiptType | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { checkPrinterAndPrint, printToRawBT, PrintPreviewComponent } = useReceiptPrintHandler();

  const handleEditReceipt = (receipt: ReceiptType) => {
    setEditingReceipt(receipt);
    setIsEditDialogOpen(true);
  };

  const handleSaveReceipt = async (id: string, receiptData: any) => {
    try {
      await updateReceipt(id, receiptData);
      await refreshProducts();
      setEditingReceipt(null);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Failed to save receipt:', error);
      throw error;
    }
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

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-gray-800">Receipt History</h1>
      
      <ReceiptSummaryCards receipts={receipts} />
      
      <ReceiptsTable 
        receipts={receipts}
        onEdit={handleEditReceipt}
        onPrint={checkPrinterAndPrint}
        onRawBTPrint={printToRawBT}
      />

      <EditReceiptDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingReceipt(null);
        }}
        receipt={editingReceipt}
        onSave={handleSaveReceipt}
      />
      
      <PrintPreviewComponent />
    </div>
  );
};

export default ReceiptPage;
