
import { useState, useRef } from 'react';
import { TableRow } from '@/types/table';
import { useReceipts, ReceiptItem } from '@/contexts/ReceiptsContext';
import { useProducts } from '@/contexts/ProductsContext';
import { calculateGrandTotal } from '@/utils/calculations';
import { useToast } from '@/hooks/use-toast';

export const useTableData = (type: 'purchase' | 'sales' | 'adjustment' = 'sales') => {
  const [rows, setRows] = useState<TableRow[]>([
    { id: '1', itemName: '', qty: 0, price: 0, adjustmentType: 'increase', reason: '' }
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const { addReceipt } = useReceipts();
  const { updateStock } = useProducts();
  const { toast } = useToast();

  const addRow = () => {
    const newRow: TableRow = {
      id: Date.now().toString(),
      itemName: '',
      qty: 0,
      price: 0,
      adjustmentType: 'increase',
      reason: '',
    };
    setRows(prev => [...prev, newRow]);
    setTimeout(() => {
      const newRowRef = inputRefs.current[`${newRow.id}-itemName`];
      newRowRef?.focus();
    }, 100);
  };

  const clearAllFields = () => {
    const newId = Date.now().toString();
    setRows([{ id: newId, itemName: '', qty: 0, price: 0, adjustmentType: 'increase', reason: '' }]);
    setTimeout(() => {
      const firstRowRef = inputRefs.current[`${newId}-itemName`];
      firstRowRef?.focus();
    }, 100);
  };

  const updateRow = (id: string, field: keyof TableRow, value: string | number) => {
    setRows(prev => prev.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const handleKeyDown = (e: React.KeyboardEvent, rowIndex: number, field: 'itemName' | 'qty' | 'price') => {
    const isAdjustment = type === 'adjustment';
    
    if (e.key === 'Enter') {
      e.preventDefault();
      const currentRow = rows[rowIndex];
      
      if (field === 'itemName' && currentRow.itemName) {
        const qtyRef = inputRefs.current[`${currentRow.id}-qty`];
        qtyRef?.focus();
      } else if (field === 'qty') {
        if (isAdjustment && currentRow.qty !== 0) {
          // For adjustment, move to next row after quantity
          if (currentRow.itemName && currentRow.qty !== 0) {
          if (rowIndex === rows.length - 1) {
              const newRow: TableRow = {
                id: Date.now().toString(),
                itemName: '',
                qty: 0,
                price: 0,
                adjustmentType: 'increase',
                reason: '',
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
        } else if (currentRow.qty > 0) {
          // For purchase/sales, move to price field
          const priceRef = inputRefs.current[`${currentRow.id}-price`];
          priceRef?.focus();
        }
      } else if (field === 'price' && currentRow.price > 0) {
        if (currentRow.itemName && currentRow.qty > 0 && currentRow.price > 0) {
          if (rowIndex === rows.length - 1) {
            const newRow: TableRow = {
              id: Date.now().toString(),
              itemName: '',
              qty: 0,
              price: 0,
              adjustmentType: 'increase',
              reason: '',
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

  const handleSave = async () => {
    const isAdjustment = type === 'adjustment';
    
    const receiptItems: ReceiptItem[] = rows
      .filter(row => {
        if (isAdjustment) {
          return row.itemName && row.qty !== 0;
        }
        return row.itemName && row.qty > 0 && row.price > 0;
      })
      .map(row => {
        let finalQty = row.qty;
        let receiptType: 'purchase' | 'sales' | 'increase' | 'reduce' = type as any;
        
        if (isAdjustment) {
          // Apply sign based on adjustment type
          finalQty = row.adjustmentType === 'reduce' ? -Math.abs(row.qty) : Math.abs(row.qty);
          // Set receipt type to increase or reduce
          receiptType = row.adjustmentType === 'reduce' ? 'reduce' : 'increase';
        }
        
        return {
          id: row.id,
          itemName: row.itemName,
          qty: finalQty,
          price: isAdjustment ? 0 : row.price,
          total: isAdjustment ? 0 : row.qty * row.price,
          reason: isAdjustment ? row.reason : undefined
        };
      });

    if (receiptItems.length > 0) {
      try {
        setIsSaving(true);
        
        // For adjustments, determine the receipt type from the first item
        const finalReceiptType = isAdjustment 
          ? (rows[0]?.adjustmentType === 'reduce' ? 'reduce' : 'increase')
          : type;
        
        await addReceipt({
          type: finalReceiptType as any,
          items: receiptItems,
          totalAmount: isAdjustment ? 0 : calculateGrandTotal(rows)
        });

        for (const item of receiptItems) {
          await updateStock(item.itemName, item.qty, finalReceiptType as any);
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

  const calculateTotal = () => calculateGrandTotal(rows);

  return {
    rows,
    inputRefs,
    isSaving,
    updateRow,
    handleKeyDown,
    handleSave,
    calculateTotal,
    clearAllFields,
    addRow
  };
};
