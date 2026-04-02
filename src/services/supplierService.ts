import { supabase } from '@/integrations/supabase/client';

export interface Supplier {
  id: string;
  shop_id: string | null;
  name: string;
  phone: string | null;
  whatsapp_number: string | null;
  address: string | null;
  created_at: string;
}

export const supplierService = {
  async getAll(): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('name');
    if (error) throw error;
    return (data || []) as Supplier[];
  },

  async create(supplier: { name: string; phone?: string; whatsapp_number?: string; address?: string }): Promise<Supplier> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: membership } = await supabase
      .from('shop_members')
      .select('shop_id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    const { data, error } = await supabase
      .from('suppliers')
      .insert({
        name: supplier.name.trim(),
        phone: supplier.phone?.trim() || null,
        whatsapp_number: supplier.whatsapp_number?.trim() || null,
        address: supplier.address?.trim() || null,
        shop_id: membership?.shop_id || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Supplier;
  },

  async update(id: string, supplier: { name?: string; phone?: string; whatsapp_number?: string; address?: string }): Promise<void> {
    const updates: Record<string, unknown> = {};
    if (supplier.name !== undefined) updates.name = supplier.name.trim();
    if (supplier.phone !== undefined) updates.phone = supplier.phone.trim() || null;
    if (supplier.whatsapp_number !== undefined) updates.whatsapp_number = supplier.whatsapp_number.trim() || null;
    if (supplier.address !== undefined) updates.address = supplier.address.trim() || null;

    const { error } = await supabase.from('suppliers').update(updates).eq('id', id);
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    if (error) throw error;
  },
};
