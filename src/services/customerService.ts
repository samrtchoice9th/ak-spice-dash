import { supabase } from '@/integrations/supabase/client';

export interface Customer {
  id: string;
  shop_id: string | null;
  name: string;
  phone: string | null;
  whatsapp_number: string | null;
  address: string | null;
  created_at: string;
}

export const customerService = {
  async getAll(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name');
    if (error) throw error;
    return (data || []) as Customer[];
  },

  async create(customer: { name: string; phone?: string; whatsapp_number?: string; address?: string }): Promise<Customer> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: membership } = await supabase
      .from('shop_members')
      .select('shop_id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    const { data, error } = await supabase
      .from('customers')
      .insert({
        name: customer.name.trim(),
        phone: customer.phone?.trim() || null,
        whatsapp_number: customer.whatsapp_number?.trim() || null,
        address: customer.address?.trim() || null,
        shop_id: membership?.shop_id || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Customer;
  },

  async update(id: string, customer: { name?: string; phone?: string; whatsapp_number?: string; address?: string }): Promise<void> {
    const updates: Record<string, unknown> = {};
    if (customer.name !== undefined) updates.name = customer.name.trim();
    if (customer.phone !== undefined) updates.phone = customer.phone.trim() || null;
    if (customer.whatsapp_number !== undefined) updates.whatsapp_number = customer.whatsapp_number.trim() || null;
    if (customer.address !== undefined) updates.address = customer.address.trim() || null;

    const { error } = await supabase.from('customers').update(updates).eq('id', id);
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) throw error;
  },
};
