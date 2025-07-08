
import React from 'react';
import { useInventory } from '@/contexts/InventoryContext';
import { Package, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const Inventory = () => {
  const { inventory } = useInventory();

  const totalInventoryValue = inventory.reduce((sum, item) => 
    sum + (item.currentStock * item.averagePurchasePrice), 0
  );

  const lowStockItems = inventory.filter(item => item.currentStock <= 5);

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-gray-800">Inventory Management</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{inventory.length}</p>
            </div>
            <Package className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Low Stock Items</p>
              <p className="text-xl sm:text-2xl font-bold text-red-600">{lowStockItems.length}</p>
            </div>
            <TrendingDown className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Stock Value</p>
              <p className="text-lg sm:text-2xl font-bold text-green-600">Rs. {totalInventoryValue.toLocalString("en-IN", {minimumFractionDigits: 2, maximumFractionDigits: 2,})}</p>
            </div>
            <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">In Stock Items</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">
                {inventory.filter(item => item.currentStock > 0).length}
              </p>
            </div>
            <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <Package className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-xs sm:text-sm text-red-700">
                <strong>Low Stock Alert:</strong> {lowStockItems.length} items have stock levels of 5kg or below.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Current Stock Levels</h2>
        </div>
        
        {inventory.length === 0 ? (
          <div className="p-6 sm:p-8 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No inventory data</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start by creating purchase entries to track your inventory.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item Name
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Total Purchased
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Total Sold
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Avg. Purchase Price
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Value
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventory.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.itemName}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.currentStock.toFixed(2)} kg</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                      <div className="text-sm text-gray-900">{item.totalPurchased.toFixed(2)} kg</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                      <div className="text-sm text-gray-900">{item.totalSold.toFixed(2)} kg</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="text-sm text-gray-900">
                        Rs.{item.averagePurchasePrice.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        Rs.{(item.currentStock * item.averagePurchasePrice).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.currentStock <= 0 
                          ? 'bg-red-100 text-red-800'
                          : item.currentStock <= 5
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {item.currentStock <= 0 ? 'Out of Stock' : 
                         item.currentStock <= 5 ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;
