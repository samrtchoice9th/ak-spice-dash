import React, { useState, useMemo } from 'react';
import { useSuppliers } from '@/contexts/SuppliersContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, X, Search } from 'lucide-react';
import { SupplierForm } from '@/components/suppliers/SupplierForm';
import { Supplier } from '@/services/supplierService';

interface SupplierSelectProps {
  selectedSupplier: Supplier | null;
  onSelect: (supplier: Supplier | null) => void;
}

export const SupplierSelect: React.FC<SupplierSelectProps> = ({ selectedSupplier, onSelect }) => {
  const { suppliers, addSupplier } = useSuppliers();
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return suppliers.slice(0, 10);
    const q = search.toLowerCase();
    return suppliers.filter(s => s.name.toLowerCase().includes(q) || s.phone?.includes(q)).slice(0, 10);
  }, [suppliers, search]);

  if (selectedSupplier) {
    return (
      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg border">
        <span className="text-sm font-medium text-foreground flex-1">
          Supplier: {selectedSupplier.name}
          {selectedSupplier.phone && <span className="text-muted-foreground ml-2">({selectedSupplier.phone})</span>}
        </span>
        <Button variant="ghost" size="icon" onClick={() => onSelect(null)} className="h-7 w-7">
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Select supplier (optional)"
            value={search}
            onChange={e => { setSearch(e.target.value); setShowDropdown(true); }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            className="pl-8 h-9"
          />
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowForm(true)} className="gap-1 h-9">
          <UserPlus className="h-4 w-4" />
          New
        </Button>
      </div>

      {showDropdown && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto">
          {filtered.map(s => (
            <button
              key={s.id}
              className="w-full text-left px-3 py-2 hover:bg-accent text-sm"
              onMouseDown={() => { onSelect(s); setSearch(''); setShowDropdown(false); }}
            >
              <span className="font-medium">{s.name}</span>
              {s.phone && <span className="text-muted-foreground ml-2">{s.phone}</span>}
            </button>
          ))}
        </div>
      )}

      <SupplierForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSave={async (data) => {
          const newS = await addSupplier(data);
          onSelect(newS);
        }}
      />
    </div>
  );
};
