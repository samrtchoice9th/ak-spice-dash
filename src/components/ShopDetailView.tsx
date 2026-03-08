
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Package, Receipt, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ShopDetailViewProps {
  shopId: string;
  shopName: string;
  shopAddress?: string | null;
  shopPhone?: string | null;
  onBack: () => void;
}

interface Product {
  id: string;
  name: string;
  price: number;
  current_stock: number;
}

interface ReceiptRow {
  id: string;
  date: string;
  time: string;
  type: string;
  total_amount: number;
  note: string | null;
}

interface Member {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

export const ShopDetailView: React.FC<ShopDetailViewProps> = ({
  shopId, shopName, shopAddress, shopPhone, onBack
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [receipts, setReceipts] = useState<ReceiptRow[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [prodRes, recRes, memRes] = await Promise.all([
        supabase.from('products').select('id, name, price, current_stock').eq('shop_id', shopId).order('name'),
        supabase.from('receipts').select('id, date, time, type, total_amount, note').eq('shop_id', shopId).order('created_at', { ascending: false }).limit(100),
        supabase.from('shop_members').select('id, user_id, role, created_at').eq('shop_id', shopId),
      ]);
      if (prodRes.data) setProducts(prodRes.data);
      if (recRes.data) setReceipts(recRes.data);
      if (memRes.data) setMembers(memRes.data);
      setLoading(false);
    };
    fetchData();
  }, [shopId]);

  const totalStock = products.reduce((s, p) => s + p.current_stock, 0);
  const totalSales = receipts.filter(r => r.type === 'sale').reduce((s, r) => s + r.total_amount, 0);

  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft size={18} className="mr-2" /> Back to shops
      </Button>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">{shopName}</h2>
        {shopAddress && <p className="text-sm text-muted-foreground">{shopAddress}</p>}
        {shopPhone && <p className="text-sm text-muted-foreground">Tel: {shopPhone}</p>}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Products</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{products.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Stock</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{totalStock}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Sales Total</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">Rs. {totalSales.toFixed(2)}</p></CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading shop data...</div>
      ) : (
        <Tabs defaultValue="products">
          <TabsList>
            <TabsTrigger value="products"><Package size={16} className="mr-1" /> Products ({products.length})</TabsTrigger>
            <TabsTrigger value="receipts"><Receipt size={16} className="mr-1" /> Receipts ({receipts.length})</TabsTrigger>
            <TabsTrigger value="members"><Users size={16} className="mr-1" /> Members ({members.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            {products.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No products found</p>
            ) : (
              <div className="bg-card rounded-lg border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">Name</th>
                      <th className="text-right p-3 font-medium">Price</th>
                      <th className="text-right p-3 font-medium">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id} className="border-t">
                        <td className="p-3">{p.name}</td>
                        <td className="p-3 text-right">Rs. {p.price.toFixed(2)}</td>
                        <td className="p-3 text-right">{p.current_stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="receipts">
            {receipts.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No receipts found</p>
            ) : (
              <div className="bg-card rounded-lg border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">Date</th>
                      <th className="text-left p-3 font-medium">Time</th>
                      <th className="text-left p-3 font-medium">Type</th>
                      <th className="text-right p-3 font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receipts.map(r => (
                      <tr key={r.id} className="border-t">
                        <td className="p-3">{r.date}</td>
                        <td className="p-3">{r.time}</td>
                        <td className="p-3 capitalize">{r.type}</td>
                        <td className="p-3 text-right">Rs. {r.total_amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="members">
            {members.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No members found</p>
            ) : (
              <div className="bg-card rounded-lg border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">User ID</th>
                      <th className="text-left p-3 font-medium">Role</th>
                      <th className="text-left p-3 font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map(m => (
                      <tr key={m.id} className="border-t">
                        <td className="p-3 font-mono text-xs">{m.user_id.slice(0, 8)}...</td>
                        <td className="p-3 capitalize">{m.role}</td>
                        <td className="p-3">{new Date(m.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
