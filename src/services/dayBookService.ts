import { supabase } from '@/integrations/supabase/client';

const SHOP_ID = 'a0000000-0000-0000-0000-000000000001';

export interface DayBookAccount {
  id: string;
  name: string;
}

export interface DayBookEntry {
  id: string;
  accountId: string;
  description: string;
  debit: number | null;
  credit: number | null;
  entryOrder: number;
}

export interface LedgerRow {
  id: string;
  entryDate: string;
  accountId: string;
  accountName: string;
  description: string;
  debit: number;
  credit: number;
}

export const dayBookService = {
  async getAccounts(): Promise<DayBookAccount[]> {
    const { data, error } = await supabase
      .from('accounts')
      .select('id, name')
      .order('name');
    if (error) throw error;
    return data || [];
  },

  async addAccount(name: string): Promise<DayBookAccount> {
    const { data, error } = await supabase
      .from('accounts')
      .insert({ shop_id: SHOP_ID, name: name.trim() })
      .select('id, name')
      .single();
    if (error) throw error;
    return data;
  },

  async getEntries(entryDate: string): Promise<DayBookEntry[]> {
    const { data, error } = await supabase
      .from('day_book_entries')
      .select('id, account_id, description, debit, credit, entry_order')
      .eq('entry_date', entryDate)
      .order('entry_order')
      .order('created_at');
    if (error) throw error;
    return (data || []).map(row => ({
      id: row.id,
      accountId: row.account_id,
      description: row.description,
      debit: row.debit === null ? null : Number(row.debit),
      credit: row.credit === null ? null : Number(row.credit),
      entryOrder: row.entry_order,
    }));
  },

  // Read-only ledger: all entries in a date range with their account names.
  async getLedger(startDate: string, endDate: string): Promise<LedgerRow[]> {
    const { data, error } = await supabase
      .from('day_book_entries')
      .select('id, entry_date, account_id, description, debit, credit, entry_order, accounts(name)')
      .gte('entry_date', startDate)
      .lte('entry_date', endDate)
      .order('entry_date')
      .order('entry_order')
      .limit(5000);
    if (error) throw error;
    return (data || []).map((row: Record<string, unknown>) => ({
      id: row.id as string,
      entryDate: row.entry_date as string,
      accountId: row.account_id as string,
      accountName: ((row.accounts as { name?: string } | null)?.name) || 'Unknown account',
      description: (row.description as string) || '',
      debit: row.debit === null ? 0 : Number(row.debit),
      credit: row.credit === null ? 0 : Number(row.credit),
    }));
  },

  async saveEntries(entryDate: string, entries: DayBookEntry[]): Promise<void> {
    const { data: existing, error: existingError } = await supabase
      .from('day_book_entries')
      .select('id')
      .eq('entry_date', entryDate);
    if (existingError) throw existingError;

    const rows = entries.map((entry, index) => ({
      id: entry.id.startsWith('new-') ? undefined : entry.id,
      shop_id: SHOP_ID,
      entry_date: entryDate,
      account_id: entry.accountId,
      description: entry.description.trim(),
      debit: entry.debit,
      credit: entry.credit,
      entry_order: index,
    }));

    if (rows.length > 0) {
      const { error } = await supabase.from('day_book_entries').upsert(rows);
      if (error) throw error;
    }

    const savedIds = new Set(rows.flatMap(row => row.id ? [row.id] : []));
    const removedIds = (existing || []).map(row => row.id).filter(id => !savedIds.has(id));
    if (removedIds.length > 0) {
      const { error } = await supabase.from('day_book_entries').delete().in('id', removedIds);
      if (error) throw error;
    }
  },
};