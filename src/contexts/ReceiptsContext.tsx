
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ReceiptItem {
  id: string;
  itemName: string;
  qty: number;
  price: number;
  total: number;
}

export interface Receipt {
  id: string;
  type: 'purchase' | 'sales';
  items: ReceiptItem[];
  totalAmount: number;
  date: string;
  time: string;
}

interface ReceiptsContextType {
  receipts: Receipt[];
  addReceipt: (receipt: Omit<Receipt, 'id' | 'date' | 'time'>) => void;
  updateReceipt: (id: string, receipt: Omit<Receipt, 'id' | 'date' | 'time'>) => void;
  deleteReceipt: (id: string) => void;
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

  const addReceipt = (receiptData: Omit<Receipt, 'id' | 'date' | 'time'>) => {
    const now = new Date();
    const newReceipt: Receipt = {
      ...receiptData,
      id: Date.now().toString(),
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
    };
    setReceipts(prev => [...prev, newReceipt]);
    console.log('Receipt saved:', newReceipt);
  };

  const updateReceipt = (id: string, receiptData: Omit<Receipt, 'id' | 'date' | 'time'>) => {
    setReceipts(prev => prev.map(receipt => 
      receipt.id === id 
        ? { ...receipt, ...receiptData }
        : receipt
    ));
  };

  const deleteReceipt = (id: string) => {
    setReceipts(prev => prev.filter(receipt => receipt.id !== id));
  };

  return (
    <ReceiptsContext.Provider value={{ receipts, addReceipt, updateReceipt, deleteReceipt }}>
      {children}
    </ReceiptsContext.Provider>
  );
};
