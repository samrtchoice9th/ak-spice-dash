
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
    
    // Create a structure to store items with their adjustment type
    const itemsWithType = rows
      .filter(row => {
        if (isAdjustment) {
          return row.itemName && row.qty !== 0;
        }
        return row.itemName && row.qty > 0 && row.price > 0;
      })
      .map(row => {
        const adjustmentType = isAdjustment ? row.adjustmentType : undefined;
        const itemType: 'purchase' | 'sales' | 'increase' | 'reduce' = isAdjustment
          ? (row.adjustmentType === 'reduce' ? 'reduce' : 'increase')
          : type as any;
        
        return {
          item: {
            id: row.id,
            itemName: row.itemName,
            qty: isAdjustment 
              ? (row.adjustmentType === 'reduce' ? Math.abs(row.qty) : row.qty)
              : row.qty,
            price: isAdjustment ? 0 : row.price,
            total: isAdjustment ? 0 : row.qty * row.price,
            reason: isAdjustment ? row.reason : undefined
          },
          type: itemType
        };
      });

    if (itemsWithType.length > 0) {
      try {
        setIsSaving(true);
        
        if (isAdjustment) {
          // Group items by type (increase/reduce) and create separate receipts
          const increaseItems = itemsWithType.filter(i => i.type === 'increase');
          const reduceItems = itemsWithType.filter(i => i.type === 'reduce');
          
          if (increaseItems.length > 0) {
            await addReceipt({
              type: 'increase',
              items: increaseItems.map(i => i.item),
              totalAmount: 0
            });

            for (const { item } of increaseItems) {
              await updateStock(item.itemName, item.qty, 'increase');
            }
          }
          
          if (reduceItems.length > 0) {
            await addReceipt({
              type: 'reduce',
              items: reduceItems.map(i => i.item),
              totalAmount: 0
            });

            for (const { item } of reduceItems) {
              await updateStock(item.itemName, item.qty, 'reduce');
            }
          }
        } else {
          // For purchase/sales, create a single receipt
          await addReceipt({
            type: type as any,
            items: itemsWithType.map(i => i.item),
            totalAmount: calculateGrandTotal(rows)
          });

          for (const { item, type: itemType } of itemsWithType) {
            await updateStock(item.itemName, item.qty, itemType);
          }
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
