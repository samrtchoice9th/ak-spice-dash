import { useState, useRef, useCallback, useEffect } from 'react';
import { useReceipts } from '@/contexts/ReceiptsContext';
import { useProducts } from '@/contexts/ProductsContext';
import { useToast } from '@/hooks/use-toast';

export interface SalesRow {
  id: string;
  item_id: string;
  name: string;
  qty: number;
  price: number;
  total: number;
}

export interface SalesErrors {
  [rowId: string]: { [field: string]: string };
}

const DRAFT_KEY = 'pos-sales-draft';
const DRAFT_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

const createEmptyRow = (): SalesRow => ({
  id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
  item_id: '',
  name: '',
  qty: 0,
  price: 0,
  total: 0,
});

const loadDraft = (): SalesRow[] | null => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw);
    if (Date.now() - draft.timestamp > DRAFT_MAX_AGE) {
      localStorage.removeItem(DRAFT_KEY);
      return null;
    }
    return draft.rows as SalesRow[];
  } catch {
    return null;
  }
};

const saveDraft = (rows: SalesRow[]) => {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ rows, timestamp: Date.now() }));
  } catch { /* ignore */ }
};

const clearDraft = () => {
  localStorage.removeItem(DRAFT_KEY);
};

export const useSalesData = () => {
  const [rows, setRows] = useState<SalesRow[]>(() => {
    const draft = loadDraft();
    return draft && draft.length > 0 ? draft : [createEmptyRow()];
  });
  const [errors, setErrors] = useState<SalesErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastSavedRows, setLastSavedRows] = useState<SalesRow[]>([]);

  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const { addReceipt } = useReceipts();
  const { updateStock } = useProducts();
  const { toast } = useToast();

  // Save draft on every row change
  useEffect(() => {
    saveDraft(rows);
  }, [rows]);

  const updateRow = useCallback((id: string, field: keyof SalesRow, value: string | number) => {
    setRows(prev => prev.map(row => {
      if (row.id !== id) return row;
      const updated = { ...row, [field]: value };
      if (field === 'qty' || field === 'price') {
        updated.total = Number(updated.qty) * Number(updated.price);
      }
      return updated;
    }));
    // Clear error for this field
    setErrors(prev => {
      if (!prev[id]) return prev;
      const { [field]: _, ...rest } = prev[id];
      if (Object.keys(rest).length === 0) {
        const { [id]: __, ...remaining } = prev;
        return remaining;
      }
      return { ...prev, [id]: rest };
    });
  }, []);

  const addRow = useCallback(() => {
    const newRow = createEmptyRow();
    setRows(prev => [...prev, newRow]);
    setTimeout(() => {
      inputRefs.current[`${newRow.id}-name`]?.focus();
    }, 50);
  }, []);

  const deleteRow = useCallback((id: string) => {
    setRows(prev => {
      if (prev.length <= 1) {
        // Reset instead of delete
        const fresh = createEmptyRow();
        return [fresh];
      }
      return prev.filter(r => r.id !== id);
    });
  }, []);

  const duplicateRow = useCallback((id: string) => {
    setRows(prev => {
      const idx = prev.findIndex(r => r.id === id);
      if (idx === -1) return prev;
      const source = prev[idx];
      const copy: SalesRow = {
        ...source,
        id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
      };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, rowId: string, field: 'name' | 'qty' | 'price') => {
    if (e.key !== 'Enter') return;
    e.preventDefault();

    setRows(prev => {
      const idx = prev.findIndex(r => r.id === rowId);
      if (idx === -1) return prev;
      const row = prev[idx];

      if (field === 'name' && row.name) {
        setTimeout(() => inputRefs.current[`${rowId}-qty`]?.focus(), 0);
      } else if (field === 'qty' && row.qty > 0) {
        setTimeout(() => inputRefs.current[`${rowId}-price`]?.focus(), 0);
      } else if (field === 'price' && row.price > 0) {
        if (idx === prev.length - 1) {
          const newRow = createEmptyRow();
          setTimeout(() => {
            inputRefs.current[`${newRow.id}-name`]?.focus();
          }, 50);
          return [...prev, newRow];
        } else {
          const nextRow = prev[idx + 1];
          setTimeout(() => inputRefs.current[`${nextRow.id}-name`]?.focus(), 0);
        }
      }
      return prev;
    });
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: SalesErrors = {};
    const validRows = rows.filter(r => r.name.trim() || r.qty > 0 || r.price > 0);

    if (validRows.length === 0) {
      toast({
        title: "No items",
        description: "Please add at least one item",
        variant: "destructive",
      });
      return false;
    }

    for (const row of validRows) {
      const rowErrors: { [field: string]: string } = {};
      if (!row.name.trim()) rowErrors.name = 'Item required';
      if (row.qty <= 0) rowErrors.qty = 'Qty > 0';
      if (row.price <= 0) rowErrors.price = 'Price > 0';
      if (Object.keys(rowErrors).length > 0) {
        newErrors[row.id] = rowErrors;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [rows, toast]);

  const handleSave = useCallback(async () => {
    if (!validate()) return;

    const validItems = rows.filter(r => r.name.trim() && r.qty > 0 && r.price > 0);

    try {
      setIsSaving(true);

      await addReceipt({
        type: 'sales',
        items: validItems.map(r => ({
          id: r.id,
          itemName: r.name,
          qty: r.qty,
          price: r.price,
          total: r.total,
        })),
        totalAmount: validItems.reduce((sum, r) => sum + r.total, 0),
      });

      for (const item of validItems) {
        await updateStock(item.name, item.qty, 'sales');
      }

      setLastSavedRows(validItems);
      clearDraft();

      const freshRow = createEmptyRow();
      setRows([freshRow]);
      setErrors({});
      setShowSuccess(true);

      setTimeout(() => {
        inputRefs.current[`${freshRow.id}-name`]?.focus();
      }, 100);
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save. Please try again.",
        variant: "destructive",
      });
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  }, [rows, validate, addReceipt, updateStock, toast]);

  const grandTotal = rows.reduce((sum, r) => sum + r.total, 0);
  const distinctItems = rows.filter(r => r.name.trim() !== '').length;

  return {
    rows,
    errors,
    isSaving,
    showSuccess,
    setShowSuccess,
    lastSavedRows,
    grandTotal,
    distinctItems,
    inputRefs,
    updateRow,
    addRow,
    deleteRow,
    duplicateRow,
    handleKeyDown,
    handleSave,
  };
};
