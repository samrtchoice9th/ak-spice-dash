
import React, { useState, useMemo } from 'react';
import { useProducts } from '@/contexts/ProductsContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Edit2, Trash2, Plus, Printer, Settings as SettingsIcon, Search, PackageMinus, Smartphone, Cable } from 'lucide-react';
import { AddItemDialog } from '@/components/AddItemDialog';
import { DataTable } from '@/components/DataTable';
import { toast } from 'sonner';

const Settings = () => {
  const { products, updateProduct, deleteProduct, loading } = useProducts();
  const isMobile = useIsMobile();
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [itemSearch, setItemSearch] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('items');

  

  // Shop management functions removed - single shop mode

  const filteredProducts = useMemo(() => {
    if (!itemSearch.trim()) return products;
    const q = itemSearch.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(q));
  }, [products, itemSearch]);

  const handleEditProduct = async () => {
    if (editingProduct && editName.trim()) {
      const trimmed = editName.trim();
      // Duplicate name check (case-insensitive, exclude self)
      const isDuplicate = products.some(
        p => p.id !== editingProduct.id && p.name.toLowerCase() === trimmed.toLowerCase()
      );
      if (isDuplicate) {
        toast.error('An item with this name already exists.');
        return;
      }
      try {
        await updateProduct(editingProduct.id, { name: trimmed });
        toast.success('Item name updated successfully!');
        setEditingProduct(null);
        setEditName('');
      } catch (error) {
        console.error('Error updating product:', error);
        toast.error('Failed to update item name. Please try again.');
      }
    }
  };

  const handleDeleteProduct = async () => {
    if (deleteConfirmProduct) {
      try {
        await deleteProduct(deleteConfirmProduct.id);
        toast.success('Item deleted successfully!');
        setDeleteConfirmProduct(null);
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete item. Please try again.');
      }
    }
  };

  const startEditing = (product: any) => {
    setEditingProduct(product);
    setEditName(product.name);
  };




  return (
    <div className="flex-1 p-3 sm:p-6 lg:p-8">
      <h1 className="text-lg sm:text-2xl font-bold text-center mb-4 sm:mb-8 text-foreground">Settings</h1>
      
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg mb-4 sm:mb-6 max-w-xl mx-auto">
        <button
          onClick={() => setActiveTab('items')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'items'
              ? 'bg-card text-primary shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <SettingsIcon className="inline w-4 h-4 mr-1" />
          Items
        </button>
        <button
          onClick={() => setActiveTab('adjustment')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'adjustment'
              ? 'bg-card text-primary shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <PackageMinus className="inline w-4 h-4 mr-1" />
          Stock Adj.
        </button>
        <button
          onClick={() => setActiveTab('printer')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'printer'
              ? 'bg-card text-primary shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Printer className="inline w-4 h-4 mr-1" />
          Printer
        </button>
      </div>

      {/* Items Management Tab */}
      {activeTab === 'items' && (
        <div className="bg-card rounded-lg shadow-lg border border-border">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border flex justify-between items-center">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">
              Manage Items <span className="text-sm font-normal text-muted-foreground">({products.length})</span>
            </h2>
            <Button onClick={() => setShowAddDialog(true)} className="flex items-center space-x-2">
              <Plus size={16} />
              <span className="hidden sm:inline">Add New Item</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
          {products.length > 0 && (
            <div className="px-4 sm:px-6 py-2 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  placeholder="Search items..."
                  className="w-full pl-9 pr-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          )}
          
          {loading ? (
            <div className="p-6 text-center text-muted-foreground">Loading items...</div>
          ) : products.length === 0 ? (
            <div className="p-6 text-center">
              <SettingsIcon className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-foreground">No items found</h3>
              <p className="mt-1 text-sm text-muted-foreground">Start by adding your first item.</p>
            </div>
          ) : isMobile ? (
            /* Mobile Card View */
            <div className="divide-y divide-border">
              {filteredProducts.map((product) => {
                const displayPrice = product.avg_cost || 0;
                const displayStock = product.current_stock || 0;
                return (
                  <div key={product.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">{product.name}</span>
                      <div className="flex items-center gap-2">
                        <Button onClick={() => startEditing(product)} variant="outline" size="icon" className="h-10 w-10">
                          <Edit2 size={18} />
                        </Button>
                        <Button onClick={() => setDeleteConfirmProduct(product)} variant="outline" size="icon" className="h-10 w-10 text-destructive hover:text-destructive">
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>Price: <strong className="text-foreground">Rs.{displayPrice.toFixed(2)}</strong></span>
                      <span>Stock: <strong className="text-foreground">{displayStock.toFixed(2)} kg</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Desktop Table View */
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Item Name</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Price (Rs/Kg)</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Stock (Kg)</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {filteredProducts.map((product) => {
                    const displayPrice = product.avg_cost || 0;
                    const displayStock = product.current_stock || 0;
                    return (
                      <tr key={product.id} className="hover:bg-muted/30">
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-foreground">{product.name}</div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-foreground">Rs.{displayPrice.toFixed(2)}</div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-foreground">{displayStock.toFixed(2)}</div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <Button onClick={() => startEditing(product)} variant="outline" size="icon" className="h-10 w-10">
                              <Edit2 size={18} />
                            </Button>
                            <Button onClick={() => setDeleteConfirmProduct(product)} variant="outline" size="icon" className="h-10 w-10 text-destructive hover:text-destructive">
                              <Trash2 size={18} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Stock Adjustment Tab */}
      {activeTab === 'adjustment' && (
        <DataTable title="Stock Adjustment" showSave={true} type="adjustment" />
      )}

      {/* Printer Settings Tab */}
      {activeTab === 'printer' && (
        <div className="space-y-6 max-w-2xl mx-auto">
          <div className="bg-card rounded-lg shadow-lg p-4 sm:p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Printer className="h-5 w-5" />
              Printer Setup
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Printing is automatic based on your device — no pairing, no Bluetooth.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 border border-border rounded-lg">
                <Cable className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-foreground">Windows Desktop</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Prints directly to your USB thermal printer (e.g. <strong>XPrinter XP-80C</strong>)
                    through the browser print dialog. Select the XPrinter and 80mm paper when the dialog appears.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border border-border rounded-lg">
                <Smartphone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-foreground">Android</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Prints through the <strong>RawBT</strong> app. Install RawBT from Google Play and pair
                    your thermal printer once inside the RawBT app.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}




      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="editName" className="block text-sm font-medium text-muted-foreground mb-2">
                Item Name *
              </label>
              <input id="editName" type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleEditProduct(); }}
                className="w-full px-3 py-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                placeholder="Enter item name"
                autoFocus
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingProduct(null)}>
                Cancel
              </Button>
              <Button onClick={handleEditProduct}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Item Dialog */}
      <AddItemDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmProduct} onOpenChange={() => setDeleteConfirmProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to delete "<strong>{deleteConfirmProduct?.name}</strong>"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bluetooth Device Selection Dialog */}
      <Dialog open={showBluetoothDialog} onOpenChange={setShowBluetoothDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Bluetooth Printer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Make sure your thermal printer is in pairing mode and discoverable.
            </div>
            
            <Button
              onClick={scanForBluetoothDevices}
              disabled={isScanning}
              className="w-full flex items-center justify-center space-x-2"
            >
              {isScanning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <Search size={16} />
                  <span>Scan for Devices</span>
                </>
              )}
            </Button>

            {bluetoothDevices.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-foreground">Available Devices:</div>
                {bluetoothDevices.map((device) => (
                  <div
                    key={device.id}
                    className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center space-x-3">
                      <Bluetooth size={16} className="text-primary" />
                      <div>
                        <div className="font-medium">{device.name}</div>
                        <div className="text-xs text-muted-foreground">{device.id}</div>
                      </div>
                    </div>
                    <Button
                      onClick={() => connectToDevice(device)}
                      size="sm"
                      variant="outline"
                    >
                      Connect
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {!isScanning && bluetoothDevices.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Bluetooth className="mx-auto mb-2" size={32} />
                <div className="text-sm">No devices found</div>
                <div className="text-xs mt-1">Make sure your printer is discoverable</div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowBluetoothDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
