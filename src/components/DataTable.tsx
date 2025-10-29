
import React, { useState } from 'react';
import { DataTableContainer } from './DataTableContainer';
import { TableHeader } from './TableHeader';
import { TableRowComponent } from './TableRow';
import { TableFooter } from './TableFooter';
import { ActionButtons } from './ActionButtons';
import { AddItemDialog } from './AddItemDialog';
import { printReceipt, printToRawBT } from '@/utils/printReceipt';
import { useTableData } from '@/hooks/useTableData';
import { useReceipts } from '@/contexts/ReceiptsContext';
import { useReceiptPrintHandler } from '@/components/ReceiptPrintHandler';

interface DataTableProps {
  title: string;
  showAddItem?: boolean;
  showSave?: boolean;
  type?: 'purchase' | 'sales' | 'adjustment';
}

export const DataTable: React.FC<DataTableProps> = ({ 
  title, 
  showAddItem = false, 
  showSave = false,
  type = 'sales'
}) => {
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const { addReceipt } = useReceipts();
  const { checkPrinterAndPrint, PrintPreviewComponent } = useReceiptPrintHandler();
  
  const {
    rows,
    inputRefs,
    isSaving,
    updateRow,
    handleKeyDown,
    handleSave,
    calculateTotal,
    clearAllFields,
    addRow
  } = useTableData(type);

  const addNewItem = () => {
    setIsAddItemDialogOpen(true);
  };

  const handlePrint = () => {
    printReceipt(rows, title, calculateTotal, addReceipt, type, clearAllFields, true, checkPrinterAndPrint);
  };

  const handleThermalPrint = () => {
    printToRawBT(rows, title, calculateTotal, addReceipt, type, clearAllFields);
  };

  const totalAmount = calculateTotal();

  return (
    <>
      <DataTableContainer title={title}>
        <TableHeader />
        <tbody>
          {rows.map((row, index) => (
            <TableRowComponent
              key={row.id}
              row={row}
              index={index}
              onUpdateRow={updateRow}
              onKeyDown={handleKeyDown}
              inputRefs={inputRefs}
            />
          ))}
        </tbody>
        <TableFooter totalAmount={totalAmount} />
      </DataTableContainer>

      <ActionButtons
        onPrint={handlePrint}
        onThermalPrint={handleThermalPrint}
        onAddItem={addNewItem}
        onSave={handleSave}
        onAddRow={addRow}
        showAddItem={showAddItem}
        showSave={showSave}
        showThermalPrint={true}
        disabled={isSaving}
      />

      <AddItemDialog 
        isOpen={isAddItemDialogOpen}
        onClose={() => setIsAddItemDialogOpen(false)}
      />
      
      <PrintPreviewComponent />
    </>
  );
};
