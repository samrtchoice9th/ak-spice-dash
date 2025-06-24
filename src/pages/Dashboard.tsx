
import React from 'react';
import { ShoppingCart, Package, Warehouse, Receipt } from 'lucide-react';
import { useReceipts } from '@/contexts/ReceiptsContext';
import { useInventory } from '@/contexts/InventoryContext';

const Dashboard = () => {
  const { receipts, loading: receiptsLoading } = useReceipts();
  const { inventory } = useInventory();

  // Calculate real statistics from database
  const salesReceipts = receipts.filter(r => r.type === 'sales');
  const purchaseReceipts = receipts.filter(r => r.type === 'purchase');
  
  const totalSales = salesReceipts.reduce((sum, receipt) => sum + receipt.totalAmount, 0);
  const totalPurchases = purchaseReceipts.reduce((sum, receipt) => sum + receipt.totalAmount, 0);
  const totalInventoryItems = inventory.length;
  const totalReceipts = receipts.length;

  const stats = [
    { 
      title: 'Total Sales', 
      value: receiptsLoading ? 'Loading...' : `₹${totalSales.toLocaleString()}`, 
      icon: ShoppingCart, 
      color: 'bg-green-100 text-green-700' 
    },
    { 
      title: 'Purchases', 
      value: receiptsLoading ? 'Loading...' : `₹${totalPurchases.toLocaleString()}`, 
      icon: Package, 
      color: 'bg-blue-100 text-blue-700' 
    },
    { 
      title: 'Inventory Items', 
      value: totalInventoryItems.toString(), 
      icon: Warehouse, 
      color: 'bg-purple-100 text-purple-700' 
    },
    { 
      title: 'Receipts', 
      value: totalReceipts.toString(), 
      icon: Receipt, 
      color: 'bg-orange-100 text-orange-700' 
    },
  ];

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-gray-800">Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200">
            <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${stat.color} mb-3 sm:mb-4`}>
              <stat.icon size={20} className="sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
            <p className="text-lg sm:text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Welcome to Ak Spice Management System</h2>
        <p className="text-sm sm:text-base text-gray-600 mb-4">
          Manage your spice business efficiently with our comprehensive system. Track sales, manage purchases, 
          monitor inventory, and generate receipts all in one place.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">Quick Actions</h3>
            <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
              <li>• Record new sales transactions</li>
              <li>• Add purchase entries</li>
              <li>• Update inventory levels</li>
              <li>• Generate receipts</li>
            </ul>
          </div>
          <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">Features</h3>
            <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
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
