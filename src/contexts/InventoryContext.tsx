
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

  const inventory = useMemo(() => {
    const itemMap = new Map<string, InventoryItem>();

    // Step 1: Every product gets an entry (always visible)
    for (const p of products) {
      itemMap.set(p.name, {
        itemName: p.name,
        totalPurchased: 0,
        totalSold: 0,
        currentStock: p.current_stock,
        averagePurchasePrice: p.avg_cost ?? 0,
        totalPurchaseValue: 0,
        totalSalesValue: 0,
      });
    }

    // Step 2: Enrich with monthly receipt data
    receipts.forEach(receipt => {
      receipt.items.forEach(item => {
        const existing = itemMap.get(item.itemName);
        if (!existing) {
          // Item in receipts but not in products table (edge case)
          itemMap.set(item.itemName, {
            itemName: item.itemName,
            totalPurchased: 0,
            totalSold: 0,
            currentStock: 0,
            averagePurchasePrice: 0,
            totalPurchaseValue: 0,
            totalSalesValue: 0,
          });
        }

        const entry = itemMap.get(item.itemName)!;

        if (receipt.type === 'purchase' || receipt.type === 'increase') {
          entry.totalPurchased += item.qty;
          entry.totalPurchaseValue += item.total;
        } else if (receipt.type === 'sales' || receipt.type === 'reduce' || receipt.type === 'adjustment') {
          entry.totalSold += item.qty;
          entry.totalSalesValue += item.total;
        }
      });
    });

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
