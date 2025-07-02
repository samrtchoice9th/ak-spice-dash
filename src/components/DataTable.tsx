
import React, { useState } from 'react';
import { TableHeader } from './TableHeader';
import { TableRowComponent } from './TableRow';
import { TableFooter } from './TableFooter';
import { ActionButtons } from './ActionButtons';
import { AddItemDialog } from './AddItemDialog';
import { printReceipt } from '@/utils/printReceipt';
import { useTableData } from '@/hooks/useTableData';
import { useReceipts } from '@/contexts/ReceiptsContext';

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
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const { addReceipt } = useReceipts();
  
  const {
    rows,
    inputRefs,
    isSaving,
    updateRow,
    handleKeyDown,
    handleSave,
    calculateTotal,
    clearAllFields
  } = useTableData(type);

  const addNewItem = () => {
    setIsAddItemDialogOpen(true);
  };

  const handlePrint = () => {
    printReceipt(rows, title, calculateTotal, addReceipt, type, clearAllFields);
  };

  const totalAmount = calculateTotal();

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-gray-800">{title}</h1>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
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
          </table>
        </div>
      </div>

      <ActionButtons
        onPrint={handlePrint}
        onAddItem={addNewItem}
        onSave={handleSave}
        showAddItem={showAddItem}
        showSave={showSave}
        disabled={isSaving}
      />

      <AddItemDialog 
        isOpen={isAddItemDialogOpen}
        onClose={() => setIsAddItemDialogOpen(false)}
      />
    </div>
  );
};
