import React, { useState, useMemo } from 'react';
import { useSuppliers } from '@/contexts/SuppliersContext';
import { useReceipts } from '@/contexts/ReceiptsContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Phone, MapPin } from 'lucide-react';
import { SupplierForm } from '@/components/suppliers/SupplierForm';
import { DueAlert } from '@/components/customers/DueAlert';
import { WhatsAppButton } from '@/components/WhatsAppButton';

const Suppliers = () => {
  const { suppliers, loading, addSupplier } = useSuppliers();
  const { receipts } = useReceipts();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const supplierDues = useMemo(() => {
    const map: Record<string, { totalDue: number; nearestDueDate: string | null }> = {};
    for (const r of receipts) {
      if (r.supplier_id && r.due_amount && r.due_amount > 0) {
        if (!map[r.supplier_id]) map[r.supplier_id] = { totalDue: 0, nearestDueDate: null };
        map[r.supplier_id].totalDue += r.due_amount;
        if (r.due_date && (!map[r.supplier_id].nearestDueDate || r.due_date < map[r.supplier_id].nearestDueDate!)) {
          map[r.supplier_id].nearestDueDate = r.due_date;
        }
      }
    }
    return map;
  }, [receipts]);

  const filtered = useMemo(() => {
    if (!search.trim()) return suppliers;
    const q = search.toLowerCase();
    return suppliers.filter(s => s.name.toLowerCase().includes(q) || s.phone?.includes(q));
  }, [suppliers, search]);

  return (
    <div className="p-1 sm:p-4">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-lg sm:text-xl font-bold text-foreground">Suppliers</h1>
        <Button size="sm" onClick={() => setShowForm(true)} className="gap-1">
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search suppliers..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground py-8">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No suppliers found</p>
      ) : (
        <div className="space-y-2">
          {filtered.map(s => {
            const due = supplierDues[s.id];
            return (
              <div
                key={s.id}
                className={`p-3 rounded-lg border bg-card cursor-pointer hover:bg-accent/50 transition-colors ${
                  due && due.totalDue > 0 && due.nearestDueDate && new Date(due.nearestDueDate) <= new Date()
                    ? 'border-destructive/50'
                    : due && due.totalDue > 0
                    ? 'border-yellow-400/50'
                    : ''
                }`}
                onClick={() => navigate(`/suppliers/${s.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{s.name}</p>
                    <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                      {s.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{s.phone}</span>}
                      {s.address && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{s.address}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    {due && due.totalDue > 0 && <DueAlert dueAmount={due.totalDue} dueDate={due.nearestDueDate} />}
                    {s.whatsapp_number && (
                      <WhatsAppButton phone={s.whatsapp_number} message={`Hi ${s.name}`} label="" size="icon" variant="ghost" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <SupplierForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSave={async (data) => { await addSupplier(data); }}
      />
    </div>
  );
};

export default Suppliers;
