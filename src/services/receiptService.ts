
import { supabase } from '@/integrations/supabase/client';
import { Receipt, ReceiptItem } from '@/contexts/ReceiptsContext';

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

    const receipts: Receipt[] = receiptsData.map(receipt => ({
      id: receipt.id,
      type: receipt.type as 'purchase' | 'sales' | 'adjustment' | 'increase' | 'reduce',
      totalAmount: Number(receipt.total_amount),
      date: receipt.date,
      time: receipt.time,
      customer_id: receipt.customer_id,
      supplier_id: receipt.supplier_id,
      paid_amount: Number(receipt.paid_amount || 0),
      due_amount: Number(receipt.due_amount || 0),
      due_date: receipt.due_date,
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
    const { data, error } = await supabase.functions.invoke('manage-receipt', {
      body: {
        action: 'create',
        type: receiptData.type,
        items: receiptData.items.map(item => ({
          itemName: item.itemName,
          qty: item.qty,
          price: item.price,
          total: item.total,
          reason: item.reason,
        })),
        totalAmount: receiptData.totalAmount,
        customer_id: receiptData.customer_id || null,
        supplier_id: receiptData.supplier_id || null,
        paid_amount: receiptData.paid_amount || 0,
        due_amount: receiptData.due_amount || 0,
        due_date: receiptData.due_date || null,
      },
    });

    if (error) {
      console.error('Error creating receipt:', error);
      throw error;
    }

    if (data?.error) {
      throw new Error(data.error);
    }

    return data as Receipt;
  },

  async updateReceipt(id: string, receiptData: Omit<Receipt, 'id' | 'date' | 'time'>): Promise<void> {
    const { data, error } = await supabase.functions.invoke('manage-receipt', {
      body: {
        action: 'update',
        receipt_id: id,
        type: receiptData.type,
        items: receiptData.items.map(item => ({
          itemName: item.itemName,
          qty: item.qty,
          price: item.price,
          total: item.total,
          reason: item.reason,
        })),
        totalAmount: receiptData.totalAmount,
      },
    });

    if (error) {
      console.error('Error updating receipt:', error);
      throw error;
    }

    if (data?.error) {
      throw new Error(data.error);
    }
  },

  async deleteReceipt(id: string): Promise<void> {
    const { data, error } = await supabase.functions.invoke('manage-receipt', {
      body: {
        action: 'delete',
        receipt_id: id,
      },
    });

    if (error) {
      console.error('Error deleting receipt:', error);
      throw error;
    }

    if (data?.error) {
      throw new Error(data.error);
    }
  }
};
