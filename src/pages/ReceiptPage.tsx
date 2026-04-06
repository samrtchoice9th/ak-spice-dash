
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useReceipts } from '@/contexts/ReceiptsContext';
import { useProducts } from '@/contexts/ProductsContext';
import { ReceiptSummaryCards } from '@/components/ReceiptSummaryCards';
import { ReceiptsTable } from '@/components/ReceiptsTable';
import { EditReceiptDialog } from '@/components/EditReceiptDialog';
import { useReceiptPrintHandler } from '@/components/ReceiptPrintHandler';
import { Receipt as ReceiptType } from '@/contexts/ReceiptsContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const ReceiptPage = () => {
  const now = useMemo(() => new Date(), []);
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const { receipts, loading, updateReceipt, deleteReceipt, refreshReceipts } = useReceipts();
  const { refreshProducts } = useProducts();
  const [editingReceipt, setEditingReceipt] = useState<ReceiptType | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { checkPrinterAndPrint, printToRawBT, PrintPreviewComponent } = useReceiptPrintHandler();

  useEffect(() => {
    refreshReceipts(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth, refreshReceipts]);

  const goToPrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  const isCurrentMonth = selectedMonth === now.getMonth() && selectedYear === now.getFullYear();

  const handleDeleteReceipt = useCallback(async (id: string) => {
    try {
      await deleteReceipt(id);
      await refreshProducts();
    } catch (error) {
      console.error('Failed to delete receipt:', error);
    }
  }, [deleteReceipt, refreshProducts]);

  const handleEditReceipt = useCallback((receipt: ReceiptType) => {
    setEditingReceipt(receipt);
    setIsEditDialogOpen(true);
  }, []);

  const handleSaveReceipt = useCallback(async (id: string, receiptData: any) => {
    try {
      await updateReceipt(id, receiptData);
      await refreshProducts();
      setEditingReceipt(null);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Failed to save receipt:', error);
      throw error;
    }
  }, [updateReceipt, refreshProducts]);

  if (loading) {
    return (
      <div className="flex-1 p-3 sm:p-6 lg:p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading receipts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-3 sm:p-6 lg:p-8">
      <h1 className="text-lg sm:text-2xl font-bold text-center mb-4 sm:mb-6 text-foreground">Receipt History</h1>
      
      {/* Month Picker */}
      <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
        <Button variant="outline" size="icon" onClick={goToPrevMonth} className="h-9 w-9">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm sm:text-base font-semibold text-foreground min-w-[140px] text-center">
          {MONTH_NAMES[selectedMonth]} {selectedYear}
        </span>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={goToNextMonth} 
          disabled={isCurrentMonth}
          className="h-9 w-9"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <ReceiptSummaryCards receipts={receipts} />
      
      <ReceiptsTable 
        receipts={receipts}
        onEdit={handleEditReceipt}
        onPrint={checkPrinterAndPrint}
        onRawBTPrint={printToRawBT}
        onDelete={handleDeleteReceipt}
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
