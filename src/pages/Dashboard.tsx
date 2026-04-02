
import React from 'react';
import { ShoppingCart, Package, Warehouse, Receipt } from 'lucide-react';
import { useReceipts } from '@/contexts/ReceiptsContext';
import { useInventory } from '@/contexts/InventoryContext';
import { DashboardStats } from '@/components/DashboardStats';

const Dashboard = () => {
  const { receipts, loading: receiptsLoading } = useReceipts();
  const { inventory } = useInventory();

  const salesReceipts = receipts.filter(r => r.type === 'sales');
  const purchaseReceipts = receipts.filter(r => r.type === 'purchase');
  
  const totalSales = salesReceipts.reduce((sum, receipt) => sum + receipt.totalAmount, 0);
  const totalPurchases = purchaseReceipts.reduce((sum, receipt) => sum + receipt.totalAmount, 0);
  const totalInventoryItems = inventory.length;
  const totalReceipts = receipts.length;

  const stats = [
    { title: 'Total Sales', value: receiptsLoading ? 'Loading...' : `Rs.${totalSales.toLocaleString()}`, icon: ShoppingCart, color: 'bg-green-100 text-green-700' },
    { title: 'Purchases', value: receiptsLoading ? 'Loading...' : `Rs.${totalPurchases.toLocaleString()}`, icon: Package, color: 'bg-blue-100 text-blue-700' },
    { title: 'Inventory Items', value: totalInventoryItems.toString(), icon: Warehouse, color: 'bg-purple-100 text-purple-700' },
    { title: 'Receipts', value: totalReceipts.toString(), icon: Receipt, color: 'bg-orange-100 text-orange-700' },
  ];

  return (
    <div className="flex-1 p-3 sm:p-6 lg:p-8">
      <h1 className="text-lg sm:text-2xl font-bold text-center mb-4 sm:mb-8 text-foreground">Dashboard</h1>
      
      <DashboardStats stats={stats} />

      <div className="bg-card rounded-lg shadow-lg p-3 sm:p-6 border border-border">
        <h2 className="text-base sm:text-xl font-semibold text-foreground mb-2 sm:mb-4">Welcome to Ak Spice Management System</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Manage your spice business efficiently with our comprehensive system. Track sales, manage purchases, 
          monitor inventory, and generate receipts all in one place.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          <div className="p-3 bg-muted/50 rounded-lg">
            <h3 className="font-semibold text-foreground mb-2 text-sm">Quick Actions</h3>
            <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
              <li>• Record new sales transactions</li>
              <li>• Add purchase entries</li>
              <li>• Update inventory levels</li>
              <li>• Generate receipts</li>
            </ul>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <h3 className="font-semibold text-foreground mb-2 text-sm">Features</h3>
            <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
              <li>• Auto-calculate totals</li>
              <li>• Print functionality</li>
              <li>• Responsive design</li>
              <li>• Easy navigation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
