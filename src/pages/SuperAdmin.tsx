
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Store, Users, Shield } from 'lucide-react';
import { ShopDetailView } from '@/components/ShopDetailView';

interface ShopWithOwner {
  id: string;
  name: string;
  owner_id: string;
  status: string;
  created_at: string;
  address?: string | null;
  phone?: string | null;
  owner_email?: string;
}

const SuperAdmin = () => {
  const { toast } = useToast();
  const [shops, setShops] = useState<ShopWithOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'all'>('pending');
  const [selectedShop, setSelectedShop] = useState<ShopWithOwner | null>(null);

  const fetchShops = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setShops(data as ShopWithOwner[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const approveShop = async (shopId: string, ownerId: string) => {
    const { error: shopError } = await supabase
      .from('shops')
      .update({ status: 'active' })
      .eq('id', shopId);

    if (shopError) {
      toast({ title: 'Error', description: 'Failed to approve shop', variant: 'destructive' });
      return;
    }

    const { error: roleError } = await supabase
      .from('user_roles')
      .update({ role: 'admin' })
      .eq('user_id', ownerId);

    if (roleError) console.error('Failed to update role:', roleError);

    const { error: memberError } = await supabase
      .from('shop_members')
      .update({ role: 'admin' })
      .eq('shop_id', shopId)
      .eq('user_id', ownerId);

    if (memberError) console.error('Failed to update member role:', memberError);

    toast({ title: 'Approved', description: 'Shop has been approved and activated' });
    fetchShops();
  };

  const suspendShop = async (shopId: string) => {
    const { error } = await supabase
      .from('shops')
      .update({ status: 'suspended' })
      .eq('id', shopId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to suspend shop', variant: 'destructive' });
      return;
    }

    toast({ title: 'Suspended', description: 'Shop has been suspended' });
    fetchShops();
  };

  // If a shop is selected, show its detail view
  if (selectedShop) {
    return (
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <ShopDetailView
          shopId={selectedShop.id}
          shopName={selectedShop.name}
          shopAddress={selectedShop.address}
          shopPhone={selectedShop.phone}
          onBack={() => setSelectedShop(null)}
        />
      </div>
    );
  }

  const filteredShops = shops.filter(shop => {
    if (activeTab === 'pending') return shop.status === 'pending';
    if (activeTab === 'active') return shop.status === 'active';
    return true;
  });

  const pendingCount = shops.filter(s => s.status === 'pending').length;

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center space-x-3 mb-6">
        <Shield className="w-8 h-8 text-primary" />
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Super Admin Panel</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-lg shadow p-4 border">
          <div className="flex items-center space-x-3">
            <Store className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Shops</p>
              <p className="text-2xl font-bold">{shops.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg shadow p-4 border">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Active Shops</p>
              <p className="text-2xl font-bold">{shops.filter(s => s.status === 'active').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg shadow p-4 border">
          <div className="flex items-center space-x-3">
            <Users className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-sm text-muted-foreground">Pending Approval</p>
              <p className="text-2xl font-bold">{pendingCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg mb-6 max-w-md">
        {(['pending', 'active', 'all'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors capitalize ${
              activeTab === tab
                ? 'bg-card text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab} {tab === 'pending' && pendingCount > 0 && `(${pendingCount})`}
          </button>
        ))}
      </div>

      {/* Shops List */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading shops...</div>
      ) : filteredShops.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border">
          <Store className="mx-auto w-12 h-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No {activeTab !== 'all' ? activeTab : ''} shops found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredShops.map(shop => (
            <div
              key={shop.id}
              className={`bg-card rounded-lg shadow border p-4 ${
                shop.status === 'active' ? 'cursor-pointer hover:border-primary/50 transition-colors' : ''
              }`}
              onClick={() => shop.status === 'active' && setSelectedShop(shop)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{shop.name}</h3>
                  {shop.address && <p className="text-sm text-muted-foreground">{shop.address}</p>}
                  {shop.phone && <p className="text-sm text-muted-foreground">Tel: {shop.phone}</p>}
                  <p className="text-sm text-muted-foreground">
                    Created: {new Date(shop.created_at).toLocaleDateString()}
                  </p>
                  <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                    shop.status === 'active' ? 'bg-green-100 text-green-800' :
                    shop.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {shop.status}
                  </span>
                </div>
                <div className="flex space-x-2" onClick={e => e.stopPropagation()}>
                  {shop.status === 'pending' && (
                    <Button
                      onClick={() => approveShop(shop.id, shop.owner_id)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle size={16} className="mr-1" />
                      Approve
                    </Button>
                  )}
                  {shop.status === 'active' && (
                    <Button
                      onClick={() => suspendShop(shop.id)}
                      size="sm"
                      variant="outline"
                      className="text-destructive border-destructive/30 hover:bg-destructive/10"
                    >
                      <XCircle size={16} className="mr-1" />
                      Suspend
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SuperAdmin;
