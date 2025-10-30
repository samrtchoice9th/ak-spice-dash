
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

  const isAdjustment = type === 'adjustment';

  return (
    <>
      <DataTableContainer title={title}>
        <TableHeader type={type} />
        <tbody>
          {rows.map((row, index) => (
            <TableRowComponent
              key={row.id}
              row={row}
              index={index}
              onUpdateRow={updateRow}
              onKeyDown={handleKeyDown}
              inputRefs={inputRefs}
              type={type}
            />
          ))}
        </tbody>
        {!isAdjustment && <TableFooter totalAmount={totalAmount} />}
      </DataTableContainer>

      <ActionButtons
        onPrint={handlePrint}
        onThermalPrint={handleThermalPrint}
        onAddItem={addNewItem}
        onSave={handleSave}
        onAddRow={addRow}
        showAddItem={showAddItem}
        showSave={showSave}
        showThermalPrint={!isAdjustment}
        showPrint={!isAdjustment}
        showAddRow={!isAdjustment}
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
