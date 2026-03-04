
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
}

interface ReceiptsContextType {
  receipts: Receipt[];
  loading: boolean;
  addReceipt: (receipt: Omit<Receipt, 'id' | 'date' | 'time'>) => Promise<void>;
  updateReceipt: (id: string, receipt: Omit<Receipt, 'id' | 'date' | 'time'>) => Promise<void>;
  deleteReceipt: (id: string) => Promise<void>;
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
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);

  const silentRefreshReceipts = async () => {
    try {
      const fetchedReceipts = await receiptService.getAllReceipts();
      setReceipts(fetchedReceipts);
    } catch (error) {
      console.error('Failed to fetch receipts:', error);
    }
  };

  const refreshReceipts = async () => {
    try {
      setLoading(true);
      const fetchedReceipts = await receiptService.getAllReceipts();
      setReceipts(fetchedReceipts);
    } catch (error) {
      console.error('Failed to fetch receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshReceipts();
  }, []);

  const addReceipt = async (receiptData: Omit<Receipt, 'id' | 'date' | 'time'>) => {
    try {
      const newReceipt = await receiptService.createReceipt(receiptData);
      setReceipts(prev => [newReceipt, ...prev]);
      console.log('Receipt saved to database:', newReceipt);
    } catch (error) {
      console.error('Failed to save receipt:', error);
      throw error;
    }
  };

  const updateReceipt = async (id: string, receiptData: Omit<Receipt, 'id' | 'date' | 'time'>) => {
    try {
      await receiptService.updateReceipt(id, receiptData);
      // Optimistic update - no loading spinner
      setReceipts(prev => prev.map(r => 
        r.id === id ? { ...r, type: receiptData.type, items: receiptData.items, totalAmount: receiptData.totalAmount } : r
      ));
      // Silent refresh to sync IDs from database
      silentRefreshReceipts();
    } catch (error) {
      console.error('Failed to update receipt:', error);
      throw error;
    }
  };

  const deleteReceipt = async (id: string) => {
    try {
      await receiptService.deleteReceipt(id);
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
