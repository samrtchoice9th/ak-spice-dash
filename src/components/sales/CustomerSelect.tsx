import React, { useState, useMemo } from 'react';
import { useCustomers } from '@/contexts/CustomersContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, X, Search } from 'lucide-react';
import { CustomerForm } from '@/components/customers/CustomerForm';
import { Customer } from '@/services/customerService';

interface CustomerSelectProps {
  selectedCustomer: Customer | null;
  onSelect: (customer: Customer | null) => void;
}

export const CustomerSelect: React.FC<CustomerSelectProps> = ({ selectedCustomer, onSelect }) => {
  const { customers, addCustomer } = useCustomers();
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return customers.slice(0, 10);
    const q = search.toLowerCase();
    return customers.filter(c => c.name.toLowerCase().includes(q) || c.phone?.includes(q)).slice(0, 10);
  }, [customers, search]);

  if (selectedCustomer) {
    return (
      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg border">
        <span className="text-sm font-medium text-foreground flex-1">
          Customer: {selectedCustomer.name}
          {selectedCustomer.phone && <span className="text-muted-foreground ml-2">({selectedCustomer.phone})</span>}
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
            placeholder="Select customer (optional)"
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
          {filtered.map(c => (
            <button
              key={c.id}
              className="w-full text-left px-3 py-2 hover:bg-accent text-sm"
              onMouseDown={() => { onSelect(c); setSearch(''); setShowDropdown(false); }}
            >
              <span className="font-medium">{c.name}</span>
              {c.phone && <span className="text-muted-foreground ml-2">{c.phone}</span>}
            </button>
          ))}
        </div>
      )}

      <CustomerForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSave={async (data) => {
          const newC = await addCustomer(data);
          onSelect(newC);
        }}
      />
    </div>
  );
};
