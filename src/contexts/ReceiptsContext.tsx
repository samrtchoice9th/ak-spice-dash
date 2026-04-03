
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { receiptService } from '@/services/receiptService';

export interface ReceiptItem {
  id: string;
  itemName: string;
  qty: number;
  price: number;
  total: number;
  reason?: string;
}

export interface Receipt {
  id: string;
  type: 'purchase' | 'sales' | 'adjustment' | 'increase' | 'reduce';
  items: ReceiptItem[];
  totalAmount: number;
  date: string;
  time: string;
  customer_id?: string | null;
  supplier_id?: string | null;
  paid_amount?: number;
  due_amount?: number;
  due_date?: string | null;
}

interface ReceiptsContextType {
  receipts: Receipt[];
  loading: boolean;
  addReceipt: (receipt: Omit<Receipt, 'id' | 'date' | 'time'>) => Promise<Receipt>;
  updateReceipt: (id: string, receipt: Omit<Receipt, 'id' | 'date' | 'time'>) => Promise<void>;
  deleteReceipt: (id: string) => Promise<void>;
  payDue: (receiptId: string, amount: number, method: string, note?: string) => Promise<void>;
  refreshReceipts: () => Promise<void>;
}

const ReceiptsContext = createContext<ReceiptsContextType | undefined>(undefined);

export const useReceipts = () => {
  const context = useContext(ReceiptsContext);
  if (!context) {
    throw new Error('useReceipts must be used within a ReceiptsProvider');
  }
  return context;
};

interface ReceiptsProviderProps {
  children: ReactNode;
}

export const ReceiptsProvider: React.FC<ReceiptsProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshReceipts = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const fetchedReceipts = await receiptService.getAllReceipts();
      setReceipts(fetchedReceipts);
    } catch (error) {
      console.error('Failed to fetch receipts:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshReceipts();
  }, [refreshReceipts]);

  const addReceipt = async (receiptData: Omit<Receipt, 'id' | 'date' | 'time'>): Promise<Receipt> => {
    try {
      const newReceipt = await receiptService.createReceipt(receiptData);
      setReceipts(prev => [newReceipt, ...prev]);
      return newReceipt;
    } catch (error) {
      console.error('Failed to save receipt:', error);
      throw error;
    }
  };

  const updateReceipt = async (id: string, receiptData: Omit<Receipt, 'id' | 'date' | 'time'>) => {
    try {
      await receiptService.updateReceipt(id, receiptData);
      // Edge function handles stock reversal + update atomically
      await refreshReceipts();
    } catch (error) {
      console.error('Failed to update receipt:', error);
      throw error;
    }
  };

  const deleteReceipt = async (id: string) => {
    try {
      await receiptService.deleteReceipt(id);
      // Edge function handles stock reversal atomically
      setReceipts(prev => prev.filter(receipt => receipt.id !== id));
    } catch (error) {
      console.error('Failed to delete receipt:', error);
      throw error;
    }
  };

  return (
    <ReceiptsContext.Provider value={{ 
      receipts, 
      loading, 
      addReceipt, 
      updateReceipt, 
      deleteReceipt,
      refreshReceipts 
    }}>
      {children}
    </ReceiptsContext.Provider>
  );
};
