
import React from 'react';
import { ShoppingCart, Package, Warehouse, Receipt } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { title: 'Total Sales', value: '₹1,25,430', icon: ShoppingCart, color: 'bg-green-100 text-green-700' },
    { title: 'Purchases', value: '₹89,250', icon: Package, color: 'bg-blue-100 text-blue-700' },
    { title: 'Inventory Items', value: '145', icon: Warehouse, color: 'bg-purple-100 text-purple-700' },
    { title: 'Receipts', value: '23', icon: Receipt, color: 'bg-orange-100 text-orange-700' },
  ];

  return (
    <div className="flex-1 p-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${stat.color} mb-4`}>
              <stat.icon size={24} />
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Welcome to Ak Spice Management System</h2>
        <p className="text-gray-600 mb-4">
          Manage your spice business efficiently with our comprehensive system. Track sales, manage purchases, 
          monitor inventory, and generate receipts all in one place.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Quick Actions</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Record new sales transactions</li>
              <li>• Add purchase entries</li>
              <li>• Update inventory levels</li>
              <li>• Generate receipts</li>
            </ul>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Features</h3>
            <ul className="text-sm text-gray-600 space-y-1">
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
