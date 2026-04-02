import { useState, useRef, useCallback, useEffect } from 'react';
import { useReceipts } from '@/contexts/ReceiptsContext';
import { useProducts } from '@/contexts/ProductsContext';
import { useToast } from '@/hooks/use-toast';

export interface POSRow {
  id: string;
  item_id: string;
  name: string;
  qty: number;
  price: number;
  total: number;
}

export interface POSErrors {
  [rowId: string]: { [field: string]: string };
}

type POSType = 'sales' | 'purchase';

const DRAFT_MAX_AGE = 24 * 60 * 60 * 1000;

const createEmptyRow = (): POSRow => ({
  id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
  item_id: '',
  name: '',
  qty: 0,
  price: 0,
  total: 0,
});

const getDraftKey = (type: POSType) => `pos-${type}-draft`;

const loadDraft = (type: POSType): POSRow[] | null => {
  try {
    const raw = localStorage.getItem(getDraftKey(type));
    if (!raw) return null;
    const draft = JSON.parse(raw);
    if (Date.now() - draft.timestamp > DRAFT_MAX_AGE) {
      localStorage.removeItem(getDraftKey(type));
      return null;
    }
    return draft.rows as POSRow[];
  } catch {
    return null;
  }
};

const saveDraft = (type: POSType, rows: POSRow[]) => {
  try {
    localStorage.setItem(getDraftKey(type), JSON.stringify({ rows, timestamp: Date.now() }));
  } catch { /* ignore */ }
};

const clearDraft = (type: POSType) => {
  localStorage.removeItem(getDraftKey(type));
};

export const usePOSData = (type: POSType) => {
  const [rows, setRows] = useState<POSRow[]>(() => {
    const draft = loadDraft(type);
    return draft && draft.length > 0 ? draft : [createEmptyRow()];
  });
  const [errors, setErrors] = useState<POSErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastSavedRows, setLastSavedRows] = useState<POSRow[]>([]);
  const [paidAmount, setPaidAmount] = useState(0);
  const [dueDate, setDueDate] = useState('');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const { addReceipt } = useReceipts();
  const { refreshProducts } = useProducts();
  const { toast } = useToast();

  useEffect(() => {
    saveDraft(type, rows);
  }, [rows, type]);

  const updateRow = useCallback((id: string, field: keyof POSRow, value: string | number) => {
    setRows(prev => prev.map(row => {
      if (row.id !== id) return row;
      const updated = { ...row, [field]: value };
      if (field === 'qty' || field === 'price') {
        updated.total = Number(updated.qty) * Number(updated.price);
      }
      return updated;
    }));
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
        return [createEmptyRow()];
      }
      return prev.filter(r => r.id !== id);
    });
  }, []);

  const duplicateRow = useCallback((id: string) => {
    setRows(prev => {
      const idx = prev.findIndex(r => r.id === id);
      if (idx === -1) return prev;
      const source = prev[idx];
      const copy: POSRow = {
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
    const newErrors: POSErrors = {};
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
    const totalAmount = validItems.reduce((sum, r) => sum + r.total, 0);
    const dueAmount = selectedContactId ? Math.max(0, totalAmount - paidAmount) : 0;

    try {
      setIsSaving(true);

      await addReceipt({
        type,
        items: validItems.map(r => ({
          id: r.id,
          itemName: r.name,
          qty: r.qty,
          price: r.price,
          total: r.total,
        })),
        totalAmount,
        customer_id: type === 'sales' ? selectedContactId : null,
        supplier_id: type === 'purchase' ? selectedContactId : null,
        paid_amount: selectedContactId ? paidAmount : totalAmount,
        due_amount: dueAmount,
        due_date: dueAmount > 0 ? dueDate || null : null,
      });

      // Refresh products to get updated stock/avg_cost from edge function
      await refreshProducts();

      setLastSavedRows(validItems);
      clearDraft(type);

      const freshRow = createEmptyRow();
      setRows([freshRow]);
      setErrors({});
      setPaidAmount(0);
      setDueDate('');
      setSelectedContactId(null);
      setShowSuccess(true);

      setTimeout(() => {
        inputRefs.current[`${freshRow.id}-name`]?.focus();
      }, 100);
    } catch (error: any) {
      toast({
        title: "Save failed",
        description: error?.message || "Failed to save. Please try again.",
        variant: "destructive",
      });
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  }, [rows, validate, addReceipt, refreshProducts, toast, type, selectedContactId, paidAmount, dueDate]);

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
    paidAmount,
    setPaidAmount,
    dueDate,
    setDueDate,
    selectedContactId,
    setSelectedContactId,
  };
};
