
import React, { useState } from 'react';
import { useInventory } from '@/contexts/InventoryContext';
import { useProducts } from '@/contexts/ProductsContext';
import { useReceipts } from '@/contexts/ReceiptsContext';
import { Package, TrendingUp, TrendingDown, DollarSign, Trash2, Edit2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Inventory = () => {
  const { inventory } = useInventory();
  const { products, refreshProducts } = useProducts();
  const { refreshReceipts } = useReceipts();
  const { toast } = useToast();
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editStock, setEditStock] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const totalInventoryValue = inventory.reduce((sum, item) => 
    sum + (item.currentStock * item.averagePurchasePrice), 0
  );

  const lowStockItems = inventory.filter(item => item.currentStock <= 5);

  const startEditing = (itemName: string) => {
    const inventoryItem = inventory.find(item => item.itemName === itemName);
    setEditingItem(itemName);
    setEditName(itemName);
    setEditStock(inventoryItem?.currentStock.toString() || '0');
  };

  const handleEditItem = async () => {
    if (editingItem && editName.trim()) {
      try {
        setIsLoading(true);
        // Use edge function for atomic rename
        const { data, error } = await supabase.functions.invoke('manage-receipt', {
          body: {
            action: 'rename_item',
            old_name: editingItem,
            new_name: editName.trim(),
            new_stock: parseFloat(editStock) || 0,
          },
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        await Promise.all([refreshProducts(), refreshReceipts()]);

        toast({
          title: "Success",
          description: "Item updated successfully",
        });
        setEditingItem(null);
        setEditName('');
        setEditStock('');
      } catch (error: any) {
        toast({
          title: "Error",
          description: error?.message || "Failed to update item",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeleteItem = async (itemName: string) => {
    try {
      setIsLoading(true);
      // Use edge function for atomic delete
      const { data, error } = await supabase.functions.invoke('manage-receipt', {
        body: {
          action: 'delete_item',
          item_name: itemName,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      await Promise.all([refreshProducts(), refreshReceipts()]);

      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete item",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setDeleteConfirmItem(null);
    }
  };

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
              <p className="text-lg sm:text-2xl font-bold text-green-600">Rs. {totalInventoryValue.toLocaleString("en-IN", {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
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
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
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
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEditing(item.itemName)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                          title="Edit item"
                          disabled={isLoading}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmItem(item.itemName)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                          title="Delete item"
                          disabled={isLoading}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Item Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="editName" className="block text-sm font-medium text-gray-700 mb-2">
                Item Name *
              </label>
              <input
                id="editName"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter item name"
              />
            </div>
            <div>
              <label htmlFor="editStock" className="block text-sm font-medium text-gray-700 mb-2">
                Current Stock (Kg)
              </label>
              <input
                id="editStock"
                type="number"
                value={editStock}
                onChange={(e) => setEditStock(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                step="0.01"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingItem(null)} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleEditItem} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmItem} onOpenChange={() => setDeleteConfirmItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteConfirmItem}" from your inventory. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmItem && handleDeleteItem(deleteConfirmItem)}
              className="bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Inventory;
