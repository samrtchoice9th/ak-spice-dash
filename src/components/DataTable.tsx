import React, { useState, useRef } from 'react';
import { TableRow } from '@/types/table';
import { TableHeader } from './TableHeader';
import { TableRowComponent } from './TableRow';
import { TableFooter } from './TableFooter';
import { ActionButtons } from './ActionButtons';
import { AddItemDialog } from './AddItemDialog';
import { useReceipts, ReceiptItem } from '@/contexts/ReceiptsContext';
import { useProducts } from '@/contexts/ProductsContext';
import { calculateGrandTotal } from '@/utils/calculations';
import { printReceipt } from '@/utils/printReceipt';
import { useToast } from '@/hooks/use-toast';

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
  const [rows, setRows] = useState<TableRow[]>([
    { id: '1', itemName: '', qty: 0, price: 0 }
  ]);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const { addReceipt } = useReceipts();
  const { updateStock } = useProducts();
  const { toast } = useToast();

  const clearAllFields = () => {
    setRows([{ id: Date.now().toString(), itemName: '', qty: 0, price: 0 }]);
    setTimeout(() => {
      const firstRowRef = inputRefs.current[`${Date.now()}-itemName`];
      firstRowRef?.focus();
    }, 100);
  };

  const updateRow = (id: string, field: keyof TableRow, value: string | number) => {
    setRows(prev => prev.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const handleKeyDown = (e: React.KeyboardEvent, rowIndex: number, field: 'itemName' | 'qty' | 'price') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const currentRow = rows[rowIndex];
      
      if (field === 'itemName' && currentRow.itemName) {
        const qtyRef = inputRefs.current[`${currentRow.id}-qty`];
        qtyRef?.focus();
      } else if (field === 'qty' && currentRow.qty > 0) {
        const priceRef = inputRefs.current[`${currentRow.id}-price`];
        priceRef?.focus();
      } else if (field === 'price' && currentRow.price > 0) {
        if (currentRow.itemName && currentRow.qty > 0 && currentRow.price > 0) {
          if (rowIndex === rows.length - 1) {
            const newRow: TableRow = {
              id: Date.now().toString(),
              itemName: '',
              qty: 0,
              price: 0,
            };
            setRows(prev => [...prev, newRow]);
            setTimeout(() => {
              const newRowRef = inputRefs.current[`${newRow.id}-itemName`];
              newRowRef?.focus();
            }, 0);
          } else {
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

  const calculateTotal = () => calculateGrandTotal(rows);

  const handlePrint = () => {
    printReceipt(rows, title, calculateTotal, addReceipt, type, clearAllFields);
  };

  const handleSave = async () => {
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
      try {
        setIsSaving(true);
        
        // Save receipt
        await addReceipt({
          type,
          items: receiptItems,
          totalAmount: calculateTotal()
        });

        // Update stock for each item
        for (const item of receiptItems) {
          await updateStock(item.itemName, item.qty, type);
        }

        toast({
          title: "Saved successfully",
          description: "Receipt saved and inventory updated successfully",
        });
        
        clearAllFields();
      } catch (error) {
        toast({
          title: "Save failed",
          description: "Failed to save receipt. Please try again.",
          variant: "destructive",
        });
        console.error('Save error:', error);
      } finally {
        setIsSaving(false);
      }
    } else {
      toast({
        title: "No items to save",
        description: "Please add at least one item with valid data",
        variant: "destructive",
      });
    }
  };

  const totalAmount = calculateTotal();

  return (
    <div className="flex-1 p-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">{title}</h1>
      
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
