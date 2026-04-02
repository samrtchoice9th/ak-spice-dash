import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface SupplierFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { name: string; phone: string; whatsapp_number: string; address: string }) => Promise<void>;
  initial?: { name: string; phone: string; whatsapp_number: string; address: string };
  title?: string;
}

export const SupplierForm: React.FC<SupplierFormProps> = ({ open, onClose, onSave, initial, title = 'Add Supplier' }) => {
  const [name, setName] = useState(initial?.name || '');
  const [phone, setPhone] = useState(initial?.phone || '');
  const [whatsapp, setWhatsapp] = useState(initial?.whatsapp_number || '');
  const [address, setAddress] = useState(initial?.address || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    if (whatsapp.trim() && !/^\+?[0-9]{7,15}$/.test(whatsapp.trim())) e.whatsapp = 'Invalid WhatsApp number';
    if (phone.trim() && !/^\+?[0-9]{7,15}$/.test(phone.trim())) e.phone = 'Invalid phone number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave({ name: name.trim(), phone: phone.trim(), whatsapp_number: whatsapp.trim(), address: address.trim() });
      onClose();
    } catch {
      setErrors({ name: 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Name *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Supplier name" />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91XXXXXXXXXX" />
            {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
          </div>
          <div>
            <Label>WhatsApp Number</Label>
            <Input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="+91XXXXXXXXXX" />
            {errors.whatsapp && <p className="text-xs text-destructive mt-1">{errors.whatsapp}</p>}
          </div>
          <div>
            <Label>Address</Label>
            <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Address" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
