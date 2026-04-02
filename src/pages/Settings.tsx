
import React, { useState, useEffect } from 'react';
import { useProducts } from '@/contexts/ProductsContext';
import { useInventory } from '@/contexts/InventoryContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Edit2, Trash2, Plus, Printer, Bluetooth, Wifi, Cable, Settings as SettingsIcon, Search, CheckCircle } from 'lucide-react';
import { AddItemDialog } from '@/components/AddItemDialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';

// Extend Navigator interface for Web Bluetooth API
declare global {
  interface Navigator {
    bluetooth?: {
      requestDevice(options: any): Promise<BluetoothDevice>;
    };
  }
  
  interface BluetoothDevice {
    id: string;
    name?: string;
    gatt?: BluetoothRemoteGATTServer;
  }
  
  interface BluetoothRemoteGATTServer {
    connected: boolean;
    connect(): Promise<BluetoothRemoteGATTServer>;
    disconnect(): void;
  }
}

const Settings = () => {
  const { products, updateProduct, deleteProduct, loading } = useProducts();
  const { inventory } = useInventory();
  const { toast } = useToast();
  // Shop context removed - single shop mode
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('items');
  const [printerConnection, setPrinterConnection] = useState('bluetooth');
  const [paperSize, setPaperSize] = useState('3inch');
  const [showReceiptPreview, setShowReceiptPreview] = useState(false);
  const [bluetoothDevices, setBluetoothDevices] = useState<any[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showBluetoothDialog, setShowBluetoothDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleInviteStaff = async () => {
    if (!inviteEmail.trim() || !shop) return;
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail.trim()) || inviteEmail.trim().length > 255) {
      toast({ title: 'Invalid Email', description: 'Please enter a valid email address', variant: 'destructive' });
      return;
    }
    
    setInviting(true);
    try {
      const { error } = await supabase
        .from('shop_invitations')
        .insert({ shop_id: shop.id, email: inviteEmail.trim(), role: 'staff' });

      if (error) throw error;

      toast({ title: 'Invitation Sent', description: `Staff invitation sent to ${inviteEmail}` });
      setInviteEmail('');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to send invitation', variant: 'destructive' });
    } finally {
      setInviting(false);
    }
  };

  const handleUpdateShopName = async () => {
    if (!shopName.trim() || !shop) return;
    if (shopName.trim().length > 100) {
      toast({ title: 'Error', description: 'Shop name must be less than 100 characters', variant: 'destructive' });
      return;
    }
    const { error } = await supabase
      .from('shops')
      .update({ name: shopName.trim() })
      .eq('id', shop.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update shop name', variant: 'destructive' });
    } else {
      toast({ title: 'Updated', description: 'Shop name updated' });
      refreshShop();
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    const { error } = await supabase
      .from('shop_members')
      .delete()
      .eq('id', memberId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to remove member', variant: 'destructive' });
    } else {
      toast({ title: 'Removed', description: 'Member removed from shop' });
      refreshShop();
    }
  };

  const handleEditProduct = async () => {
    if (editingProduct && editName.trim()) {
      try {
        await updateProduct(editingProduct.id, {
          name: editName.trim()
        });
        toast({
          title: "Success",
          description: "Item name updated successfully!",
        });
        setEditingProduct(null);
        setEditName('');
      } catch (error) {
        console.error('Error updating product:', error);
        toast({
          title: "Error",
          description: "Failed to update item name. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleDeleteProduct = async () => {
    if (deleteConfirmProduct) {
      try {
        await deleteProduct(deleteConfirmProduct.id);
        toast({
          title: "Success",
          description: "Item deleted successfully!",
        });
        setDeleteConfirmProduct(null);
      } catch (error) {
        console.error('Error deleting product:', error);
        toast({
          title: "Error",
          description: "Failed to delete item. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const startEditing = (product: any) => {
    setEditingProduct(product);
    setEditName(product.name);
  };

  const scanForBluetoothDevices = async () => {
    setIsScanning(true);
    setBluetoothDevices([]);

    try {
      // Check if Web Bluetooth API is available
      if (!navigator.bluetooth) {
        toast({
          title: "Bluetooth Not Supported",
          description: "Web Bluetooth API is not supported in this browser. Please use Chrome, Edge, or Opera.",
          variant: "destructive"
        });
        setIsScanning(false);
        return;
      }

      // Request Bluetooth device scan
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service']
      });

      if (device) {
        setBluetoothDevices([{
          id: device.id,
          name: device.name || 'Unknown Device',
          device: device
        }]);
        
        toast({
          title: "Device Found",
          description: `Found ${device.name || 'Unknown Device'}`,
        });
      }
    } catch (error: any) {
      console.error('Bluetooth scan error:', error);
      
      if (error.name === 'NotFoundError') {
        toast({
          title: "No Device Selected",
          description: "No Bluetooth device was selected.",
          variant: "destructive"
        });
      } else if (error.name === 'NotAllowedError') {
        toast({
          title: "Permission Denied",
          description: "Bluetooth access was denied. Please allow Bluetooth permissions.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Bluetooth Error",
          description: error.message || "Failed to scan for Bluetooth devices.",
          variant: "destructive"
        });
      }
    }

    setIsScanning(false);
  };

  const connectToDevice = async (device: any) => {
    try {
      if (device.device.gatt?.connected) {
        toast({
          title: "Already Connected",
          description: `Already connected to ${device.name}`,
        });
        setSelectedDevice(device);
        setShowBluetoothDialog(false);
        return;
      }

      const server = await device.device.gatt?.connect();
      if (server) {
        setSelectedDevice(device);
        setShowBluetoothDialog(false);
        
        toast({
          title: "Connected Successfully",
          description: `Connected to ${device.name}`,
        });

        // Store the connection in localStorage for persistence
        localStorage.setItem('selectedBluetoothPrinter', JSON.stringify({
          id: device.id,
          name: device.name
        }));
      }
    } catch (error: any) {
      console.error('Connection error:', error);
      toast({
        title: "Connection Failed",
        description: `Failed to connect to ${device.name}: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const disconnectDevice = () => {
    if (selectedDevice?.device?.gatt?.connected) {
      selectedDevice.device.gatt.disconnect();
    }
    setSelectedDevice(null);
    localStorage.removeItem('selectedBluetoothPrinter');
    
    toast({
      title: "Disconnected",
      description: "Bluetooth printer disconnected",
    });
  };

  // Load saved device on component mount
  useEffect(() => {
    const savedDevice = localStorage.getItem('selectedBluetoothPrinter');
    if (savedDevice) {
      try {
        const deviceInfo = JSON.parse(savedDevice);
        setSelectedDevice(deviceInfo);
      } catch (error) {
        console.error('Error loading saved device:', error);
      }
    }
  }, []);

  const ReceiptPreview = () => (
    <div className="bg-white border rounded-lg p-4 max-w-xs mx-auto font-mono text-xs">
      <div className="text-center border-b border-dashed border-gray-400 pb-2 mb-2">
        <div className="font-bold text-sm">{shop?.name?.toUpperCase() || 'YOUR SHOP'}</div>
        <div className="text-xs">Mo: +974773962001</div>
        <div className="text-xs">36, In Front of Ajile Factory</div>
        <div className="text-xs">Mahiyangana</div>
      </div>
      
      <div className="flex justify-between text-xs mb-2">
        <div>Invoice N: INVM-25-12345</div>
        <div>25/06/2025</div>
      </div>
      
      <div className="border-b border-dashed border-gray-400 pb-1 mb-2">
        <div className="flex justify-between font-bold">
          <span>ITEM</span>
          <span>QTY</span>
          <span>PRICE</span>
          <span>AMT</span>
        </div>
      </div>
      
      <div className="mb-2">
        <div className="font-bold">Turmeric Powder</div>
        <div className="flex justify-between">
          <span>2kg</span>
          <span>150.00</span>
          <span>Rs.300.00</span>
        </div>
      </div>
      
      <div className="border-t border-b border-gray-400 py-2 text-center">
        <div className="font-bold">Invoice Total Rs. : 300.00</div>
      </div>
      
      <div className="text-center text-xs mt-2">
        <div>Thank you for your business!</div>
        <div>Visit us again</div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-gray-800">Settings</h1>
      
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6 max-w-lg mx-auto">
        <button
          onClick={() => setActiveTab('items')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'items'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <SettingsIcon className="inline w-4 h-4 mr-2" />
          Items
        </button>
        <button
          onClick={() => setActiveTab('printer')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'printer'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Printer className="inline w-4 h-4 mr-2" />
          Printer
        </button>
        <button
          onClick={() => setActiveTab('shop')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'shop'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Store className="inline w-4 h-4 mr-2" />
          Shop
        </button>
      </div>

      {/* Items Management Tab */}
      {activeTab === 'items' && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Manage Items</h2>
            <Button onClick={() => setShowAddDialog(true)} className="flex items-center space-x-2">
              <Plus size={16} />
              <span>Add New Item</span>
            </Button>
          </div>
          
          {loading ? (
            <div className="p-6 text-center">Loading items...</div>
          ) : products.length === 0 ? (
            <div className="p-6 text-center">
              <SettingsIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No items found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Start by adding your first item.
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
                      Price (Rs/Kg)
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock (Kg)
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => {
                    // Find matching inventory item for this product
                    const inventoryItem = inventory.find(inv => inv.itemName === product.name);
                    const displayPrice = inventoryItem?.averagePurchasePrice || 0;
                    const displayStock = inventoryItem?.currentStock || 0;
                    
                    return (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">Rs.{displayPrice.toFixed(2)}</div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{displayStock.toFixed(2)}</div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => startEditing(product)}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                              title="Edit item"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmProduct(product)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                              title="Delete item"
                            >
                              <Trash2 size={16} />
                            </button>
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

      {/* Printer Settings Tab */}
      {activeTab === 'printer' && (
        <div className="space-y-6">
          {/* Connection Settings */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Printer Connection</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => setPrinterConnection('bluetooth')}
                className={`flex items-center space-x-3 p-4 border rounded-lg transition-colors ${
                  printerConnection === 'bluetooth'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Bluetooth size={20} />
                <span>Bluetooth</span>
              </button>
              <button
                onClick={() => setPrinterConnection('wifi')}
                className={`flex items-center space-x-3 p-4 border rounded-lg transition-colors ${
                  printerConnection === 'wifi'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Wifi size={20} />
                <span>Wi-Fi Direct</span>
              </button>
              <button
                onClick={() => setPrinterConnection('wired')}
                className={`flex items-center space-x-3 p-4 border rounded-lg transition-colors ${
                  printerConnection === 'wired'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Cable size={20} />
                <span>Wired</span>
              </button>
            </div>

            {/* Bluetooth Device Selection */}
            {printerConnection === 'bluetooth' && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-md font-medium text-gray-900">Bluetooth Printer</h4>
                  <Button
                    onClick={() => setShowBluetoothDialog(true)}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Search size={16} />
                    <span>Find Printer</span>
                  </Button>
                </div>

                {selectedDevice ? (
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="text-green-600" size={20} />
                      <div>
                        <div className="font-medium text-green-900">{selectedDevice.name}</div>
                        <div className="text-sm text-green-700">Connected</div>
                      </div>
                    </div>
                    <Button
                      onClick={disconnectDevice}
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                    <Bluetooth className="mx-auto text-gray-400 mb-2" size={24} />
                    <div className="text-sm text-gray-600">No Bluetooth printer connected</div>
                    <div className="text-xs text-gray-500 mt-1">Click "Find Printer" to search for devices</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Page Settings */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Page Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paper Size
                </label>
                <select
                  value={paperSize}
                  onChange={(e) => setPaperSize(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="3inch">3 inch (76mm) - Thermal</option>
                  <option value="2inch">2 inch (58mm) - Thermal</option>
                  <option value="a4">A4 - Standard</option>
                </select>
              </div>
            </div>
          </div>

          {/* Receipt Preview */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Receipt Preview</h3>
              <Button
                onClick={() => setShowReceiptPreview(!showReceiptPreview)}
                variant="outline"
              >
                {showReceiptPreview ? 'Hide Preview' : 'Show Preview'}
              </Button>
            </div>
            
            {showReceiptPreview && (
              <div className="mt-4">
                <ReceiptPreview />
              </div>
            )}
          </div>
        </div>
      )}


      {/* Shop Management Tab */}
      {activeTab === 'shop' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Store size={20} />
              <span>Shop Information</span>
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shop Name</label>
                <div className="flex space-x-2">
                  <Input value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="Shop name" />
                  <Button onClick={handleUpdateShopName} disabled={shopName === shop?.name}>Save</Button>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Status: <span className={`font-medium ${shop?.status === 'active' ? 'text-green-600' : 'text-amber-600'}`}>{shop?.status || 'Unknown'}</span>
              </p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Users size={20} />
              <span>Shop Members ({shopMembers.length})</span>
            </h3>
            <div className="space-y-3">
              {shopMembers.map(member => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">User: {member.user_id.slice(0, 8)}...</p>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${member.role === 'owner' ? 'bg-purple-100 text-purple-800' : member.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{member.role}</span>
                  </div>
                  {member.role === 'staff' && (
                    <Button onClick={() => handleRemoveMember(member.id)} size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50"><Trash2 size={14} /></Button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <UserPlus size={20} />
              <span>Invite Staff</span>
            </h3>
            <p className="text-sm text-gray-500 mb-4">Send an invitation to a staff member. When they sign up with this email, they'll automatically join your shop.</p>
            <div className="flex space-x-2">
              <Input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="staff@example.com" />
              <Button onClick={handleInviteStaff} disabled={inviting || !inviteEmail.trim()}>{inviting ? 'Sending...' : 'Invite'}</Button>
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
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-red-600 hover:bg-red-700">
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
            <div className="text-sm text-gray-600">
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
                <div className="text-sm font-medium text-gray-700">Available Devices:</div>
                {bluetoothDevices.map((device) => (
                  <div
                    key={device.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <Bluetooth size={16} className="text-blue-600" />
                      <div>
                        <div className="font-medium">{device.name}</div>
                        <div className="text-xs text-gray-500">{device.id}</div>
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
              <div className="text-center py-8 text-gray-500">
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
