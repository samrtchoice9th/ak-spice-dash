
import React, { useState, useMemo } from 'react';
import { useInventory } from '@/contexts/InventoryContext';
import { useProducts } from '@/contexts/ProductsContext';
import { useReceipts } from '@/contexts/ReceiptsContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Package, TrendingUp, TrendingDown, DollarSign, Trash2, Edit2, Search } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Inventory = () => {
  const { inventory } = useInventory();
  const { products, refreshProducts } = useProducts();
  const { refreshReceipts } = useReceipts();
  const isMobile = useIsMobile();
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editStock, setEditStock] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredInventory = useMemo(() => {
    if (!searchQuery.trim()) return inventory;
    const q = searchQuery.toLowerCase();
    return inventory.filter(item => item.itemName.toLowerCase().includes(q));
  }, [inventory, searchQuery]);

  const totalInventoryValue = useMemo(() =>
    inventory.reduce((sum, item) => sum + (item.currentStock * item.averagePurchasePrice), 0),
    [inventory]
  );

  const lowStockItems = useMemo(() =>
    inventory.filter(item => item.currentStock <= 5),
    [inventory]
  );

  const inStockCount = useMemo(() =>
    inventory.filter(item => item.currentStock > 0).length,
    [inventory]
  );

  const startEditing = (itemName: string) => {
    const inventoryItem = inventory.find(item => item.itemName === itemName);
    setEditingItem(itemName);
    setEditName(itemName);
    setEditStock(inventoryItem?.currentStock.toString() || '0');
  };

  const handleEditItem = async () => {
    if (!editingItem || !editName.trim()) return;

    // Duplicate name check
    const isDuplicate = products.some(
      p => p.name.toLowerCase() === editName.trim().toLowerCase() && p.name !== editingItem
    );
    if (isDuplicate) {
      toast.error(`Item "${editName.trim()}" already exists`);
      return;
    }

    try {
      setIsLoading(true);
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

      toast.success("Item updated successfully");
      setEditingItem(null);
      setEditName('');
      setEditStock('');
    } catch (error: any) {
      toast.error(error?.message || "Failed to update item");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (itemName: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('manage-receipt', {
        body: { action: 'delete_item', item_name: itemName },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      await Promise.all([refreshProducts(), refreshReceipts()]);

      toast.success("Item deleted successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete item");
    } finally {
      setIsLoading(false);
      setDeleteConfirmItem(null);
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleEditItem();
    }
  };

  const getStatusBadge = (stock: number) => {
    if (stock <= 0) return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-destructive/10 text-destructive">Out of Stock</span>;
    if (stock <= 5) return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-accent text-accent-foreground">Low Stock</span>;
    return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">In Stock</span>;
  };

  return (
    <div className="flex-1 p-3 sm:p-6 lg:p-8">
      <h1 className="text-lg sm:text-2xl font-bold text-center mb-4 sm:mb-8 text-foreground">Inventory Management</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-8">
        <div className="bg-card rounded-lg shadow-lg p-3 sm:p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Items</p>
              <p className="text-lg sm:text-2xl font-bold text-foreground">{inventory.length}</p>
            </div>
            <Package className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          </div>
        </div>
        
        <div className="bg-card rounded-lg shadow-lg p-3 sm:p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Low Stock</p>
              <p className="text-lg sm:text-2xl font-bold text-destructive">{lowStockItems.length}</p>
            </div>
            <TrendingDown className="h-6 w-6 sm:h-8 sm:w-8 text-destructive" />
          </div>
        </div>
        
        <div className="bg-card rounded-lg shadow-lg p-3 sm:p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Stock Value</p>
              <p className="text-sm sm:text-2xl font-bold text-primary">Rs.{totalInventoryValue.toLocaleString("en-IN", {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            </div>
            <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          </div>
        </div>
        
        <div className="bg-card rounded-lg shadow-lg p-3 sm:p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">In Stock</p>
              <p className="text-lg sm:text-2xl font-bold text-primary">{inStockCount}</p>
            </div>
            <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-destructive/10 border-l-4 border-destructive p-3 sm:p-4 mb-4 sm:mb-6 rounded-r-lg">
          <div className="flex">
            <Package className="h-5 w-5 text-destructive flex-shrink-0" />
            <p className="ml-3 text-xs sm:text-sm text-destructive">
              <strong>Low Stock Alert:</strong> {lowStockItems.length} items have stock levels of 5kg or below.
            </p>
          </div>
        </div>
      )}

      {/* Inventory List */}
      <div className="bg-card rounded-lg shadow-lg overflow-hidden border border-border">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border flex flex-col sm:flex-row sm:items-center gap-3">
          <h2 className="text-base sm:text-lg font-semibold text-foreground">
            Current Stock Levels
            <span className="ml-2 text-sm font-normal text-muted-foreground">({inventory.length} items)</span>
          </h2>
          <div className="relative sm:ml-auto sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
        </div>
        
        {filteredInventory.length === 0 ? (
          <div className="p-6 sm:p-8 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium text-foreground">
              {searchQuery ? 'No matching items' : 'No inventory data'}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchQuery ? 'Try a different search term.' : 'Start by creating purchase entries to track your inventory.'}
            </p>
          </div>
        ) : isMobile ? (
          /* Mobile Card View */
          <div className="divide-y divide-border">
            {filteredInventory.map((item, index) => (
              <div key={index} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">{item.itemName}</span>
                  {getStatusBadge(item.currentStock)}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Stock: </span>
                    <span className="font-medium text-foreground">{item.currentStock.toFixed(2)} kg</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Avg Cost: </span>
                    <span className="font-medium text-foreground">Rs.{item.averagePurchasePrice.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Purchased (Month): </span>
                    <span className="font-medium text-foreground">{item.totalPurchased.toFixed(2)} kg</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sold (Month): </span>
                    <span className="font-medium text-foreground">{item.totalSold.toFixed(2)} kg</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Value: </span>
                    <span className="font-medium text-primary">Rs.{(item.currentStock * item.averagePurchasePrice).toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    onClick={() => startEditing(item.itemName)}
                    variant="outline"
                    size="icon"
                    className="h-10 w-10"
                    disabled={isLoading}
                  >
                    <Edit2 size={18} />
                  </Button>
                  <Button
                    onClick={() => setDeleteConfirmItem(item.itemName)}
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 text-destructive hover:text-destructive"
                    disabled={isLoading}
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Desktop Table View */
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Item Name</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Current Stock</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Purchased (Month)</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Sold (Month)</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg. Purchase Price</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Stock Value</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {filteredInventory.map((item, index) => (
                  <tr key={index} className="hover:bg-muted/30">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-foreground">{item.itemName}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">{item.currentStock.toFixed(2)} kg</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">{item.totalPurchased.toFixed(2)} kg</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">{item.totalSold.toFixed(2)} kg</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">Rs.{item.averagePurchasePrice.toFixed(2)}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-primary">Rs.{(item.currentStock * item.averagePurchasePrice).toFixed(2)}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(item.currentStock)}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <Button onClick={() => startEditing(item.itemName)} variant="outline" size="icon" className="h-10 w-10" disabled={isLoading}>
                          <Edit2 size={18} />
                        </Button>
                        <Button onClick={() => setDeleteConfirmItem(item.itemName)} variant="outline" size="icon" className="h-10 w-10 text-destructive hover:text-destructive" disabled={isLoading}>
                          <Trash2 size={18} />
                        </Button>
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
              <label htmlFor="editName" className="block text-sm font-medium text-muted-foreground mb-2">Item Name *</label>
              <Input
                id="editName"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={handleEditKeyDown}
                placeholder="Enter item name"
                className="h-12"
              />
            </div>
            <div>
              <label htmlFor="editStock" className="block text-sm font-medium text-muted-foreground mb-2">Current Stock (Kg)</label>
              <Input
                id="editStock"
                type="number"
                value={editStock}
                onChange={(e) => setEditStock(e.target.value)}
                onKeyDown={handleEditKeyDown}
                placeholder="0.00"
                step="0.01"
                className="h-12"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingItem(null)} disabled={isLoading}>Cancel</Button>
              <Button onClick={handleEditItem} disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Changes'}</Button>
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
            <AlertDialogAction onClick={() => deleteConfirmItem && handleDeleteItem(deleteConfirmItem)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isLoading}>
              {isLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Inventory;
