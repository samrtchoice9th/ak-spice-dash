
import { supabase } from '@/integrations/supabase/client';
import { Receipt, ReceiptItem } from '@/contexts/ReceiptsContext';
import { receiptSchema } from '@/lib/validations';

export const receiptService = {
  async getAllReceipts(): Promise<Receipt[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: receiptsData, error: receiptsError } = await supabase
      .from('receipts')
      .select(`
        *,
        receipt_items (*)
      `)
      .order('created_at', { ascending: false })
      .limit(5000);

    if (receiptsError) {
      console.error('Error fetching receipts:', receiptsError);
      throw receiptsError;
    }

    // Transform the data to match our Receipt interface
    const receipts: Receipt[] = receiptsData.map(receipt => ({
      id: receipt.id,
      type: receipt.type as 'purchase' | 'sales' | 'adjustment' | 'increase' | 'reduce',
      totalAmount: Number(receipt.total_amount),
      date: receipt.date,
      time: receipt.time,
      items: receipt.receipt_items.map((item: any) => ({
        id: item.id,
        itemName: item.item_name,
        qty: Number(item.qty),
        price: Number(item.price),
        total: Number(item.total),
        reason: item.reason
      }))
    }));

    return receipts;
  },

  async createReceipt(receiptData: Omit<Receipt, 'id' | 'date' | 'time'>): Promise<Receipt> {
    // Validate input
    const validatedData = receiptSchema.parse(receiptData);
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User must be authenticated to create receipts');
    }

    const now = new Date();
    const date = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    const time = now.toLocaleTimeString();

    // Insert receipt
    const { data: receiptResult, error: receiptError } = await supabase
      .from('receipts')
      .insert({
        type: validatedData.type,
        total_amount: validatedData.totalAmount,
        date,
        time,
        user_id: user.id
      })
      .select()
      .single();

    if (receiptError) {
      console.error('Error creating receipt:', receiptError);
      throw receiptError;
    }

    // Insert receipt items
    const itemsToInsert = validatedData.items.map(item => ({
      receipt_id: receiptResult.id,
      item_name: item.itemName,
      qty: item.qty,
      price: item.price,
      total: item.total,
      reason: item.reason
    }));

    const { data: itemsResult, error: itemsError } = await supabase
      .from('receipt_items')
      .insert(itemsToInsert)
      .select();

    if (itemsError) {
      console.error('Error creating receipt items:', itemsError);
      throw itemsError;
    }

    const newReceipt: Receipt = {
      id: receiptResult.id,
      type: validatedData.type,
      totalAmount: validatedData.totalAmount,
      date,
      time,
      items: validatedData.items.map((item, index) => ({
        ...item,
        id: itemsResult[index].id
      }))
    };

    return newReceipt;
  },

  async updateReceipt(id: string, receiptData: Omit<Receipt, 'id' | 'date' | 'time'>): Promise<void> {
    // Validate input
    const validatedData = receiptSchema.parse(receiptData);
    
    // Update receipt
    const { error: receiptError } = await supabase
      .from('receipts')
      .update({
        type: validatedData.type,
        total_amount: validatedData.totalAmount,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (receiptError) {
      console.error('Error updating receipt:', receiptError);
      throw receiptError;
    }

    // Delete existing items
    const { error: deleteError } = await supabase
      .from('receipt_items')
      .delete()
      .eq('receipt_id', id);

    if (deleteError) {
      console.error('Error deleting receipt items:', deleteError);
      throw deleteError;
    }

    // Insert updated items
    const itemsToInsert = validatedData.items.map(item => ({
      receipt_id: id,
      item_name: item.itemName,
      qty: item.qty,
      price: item.price,
      total: item.total,
      reason: item.reason
    }));

    const { error: itemsError } = await supabase
      .from('receipt_items')
      .insert(itemsToInsert);

    if (itemsError) {
      console.error('Error updating receipt items:', itemsError);
      throw itemsError;
    }
  },

  async deleteReceipt(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('receipts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting receipt:', error);
      throw error;
    }
  }
};
