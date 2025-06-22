
import React, {  createContext, useContext, ReactNode } from 'react';
import { useReceipts } from './ReceiptsContext';

export interface InventoryItem {
  itemName: string;
  totalPurchased: number;
  totalSold: number;
  currentStock: number;
  averagePurchasePrice: number;
  totalPurchaseValue: number;
  totalSalesValue: number;
}

interface InventoryContextType {
  inventory: InventoryItem[];
  getItemStock: (itemName: string) => number;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

interface InventoryProviderProps {
  children: ReactNode;
}

export const InventoryProvider: React.FC<InventoryProviderProps> = ({ children }) => {
  const { receipts } = useReceipts();

  const calculateInventory = (): InventoryItem[] => {
    const itemMap = new Map<string, InventoryItem>();

    receipts.forEach(receipt => {
      receipt.items.forEach(item => {
        const existingItem = itemMap.get(item.itemName) || {
          itemName: item.itemName,
          totalPurchased: 0,
          totalSold: 0,
          currentStock: 0,
          averagePurchasePrice: 0,
          totalPurchaseValue: 0,
          totalSalesValue: 0,
        };

        if (receipt.type === 'purchase') {
          existingItem.totalPurchased += item.qty;
          existingItem.totalPurchaseValue += item.total;
          existingItem.averagePurchasePrice = existingItem.totalPurchaseValue / existingItem.totalPurchased;
        } else if (receipt.type === 'sales') {
          existingItem.totalSold += item.qty;
          existingItem.totalSalesValue += item.total;
        }

        existingItem.currentStock = existingItem.totalPurchased - existingItem.totalSold;
        itemMap.set(item.itemName, existingItem);
      });
    });

    return Array.from(itemMap.values()).sort((a, b) => a.itemName.localeCompare(b.itemName));
  };

  const inventory = calculateInventory();

  const getItemStock = (itemName: string): number => {
    const item = inventory.find(inv => inv.itemName === itemName);
    return item ? item.currentStock : 0;
  };

  return (
    <InventoryContext.Provider value={{ inventory, getItemStock }}>
      {children}
    </InventoryContext.Provider>
  );
};
