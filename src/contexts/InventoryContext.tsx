
import React, { createContext, useContext, ReactNode } from 'react';
import { useReceipts } from './ReceiptsContext';
import { useProducts } from './ProductsContext';

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
  const { products } = useProducts();


import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useReceipts } from './ReceiptsContext';
import { useProducts } from './ProductsContext';

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
  const { products } = useProducts();

  // Issue #9: Memoize inventory calculation
  const inventory = useMemo(() => {
    const productAvgCostMap = new Map<string, number>();
    const productStockMap = new Map<string, number>();
    for (const p of products) {
      productAvgCostMap.set(p.name, (p as any).avg_cost ?? 0);
      productStockMap.set(p.name, p.current_stock);
    }

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

        if (receipt.type === 'purchase' || receipt.type === 'increase') {
          existingItem.totalPurchased += item.qty;
          existingItem.totalPurchaseValue += item.total;
        } else if (receipt.type === 'sales' || receipt.type === 'reduce' || receipt.type === 'adjustment') {
          existingItem.totalSold += item.qty;
          existingItem.totalSalesValue += item.total;
        }

        itemMap.set(item.itemName, existingItem);
      });
    });

    for (const [name, item] of itemMap) {
      item.currentStock = productStockMap.get(name) ?? (item.totalPurchased - item.totalSold);
      item.averagePurchasePrice = productAvgCostMap.get(name) ?? 
        (item.totalPurchased > 0 ? item.totalPurchaseValue / item.totalPurchased : 0);
    }

    return Array.from(itemMap.values()).sort((a, b) => a.itemName.localeCompare(b.itemName));
  }, [receipts, products]);

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
