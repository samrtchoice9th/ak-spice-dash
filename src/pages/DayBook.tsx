import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, CheckCircle2, Lock, Plus, Save, Unlock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { receiptService } from '@/services/receiptService';
import { DayBookAccount, DayBookEntry, DayClosure, dayBookService } from '@/services/dayBookService';

const BLANK_ROWS = 5;
const ADD_ACCOUNT = '__add_account__';

const todayInSriLanka = () => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Colombo', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date());

const newRow = (index: number): DayBookEntry => ({
  id: `new-${Date.now()}-${index}`,
  accountId: '', description: '', debit: null, credit: null, entryOrder: index,
});

const withBlankRows = (saved: DayBookEntry[]) => [
  ...saved,
  ...Array.from({ length: Math.max(BLANK_ROWS, BLANK_ROWS - saved.length) }, (_, i) => newRow(saved.length + i)),
];

const money = (value: number) => `Rs. ${value.toLocaleString('en-LK', {
  minimumFractionDigits: 2, maximumFractionDigits: 2,
})}`;

const DayBook = () => {
  const [date, setDate] = useState(todayInSriLanka);
  const [accounts, setAccounts] = useState<DayBookAccount[]>([]);
  const [rows, setRows] = useState<DayBookEntry[]>(() => withBlankRows([]));
  const [sales, setSales] = useState(0);
  const [purchases, setPurchases] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [closing, setClosing] = useState(false);
  const [closure, setClosure] = useState<DayClosure | null>(null);
  const [openingBalance, setOpeningBalance] = useState(0);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [pendingRow, setPendingRow] = useState<number | null>(null);
  const fieldsRef = useRef<Record<string, HTMLElement | null>>({});

  const loadDay = useCallback(async () => {
    setLoading(true);
    try {
      const [selectedYear, selectedMonth] = date.split('-').map(Number);
      const [accountList, entries, totals] = await Promise.all([
        dayBookService.getAccounts(),
        dayBookService.getEntries(date),
        receiptService.getMonthlyDailyTotals(selectedYear, selectedMonth - 1),
      ]);
      setAccounts(accountList);
      setRows(withBlankRows(entries));
      setSales(totals[date]?.totalSales || 0);
      setPurchases(totals[date]?.totalPurchases || 0);
    } catch (error) {
      console.error('Failed to load Day Book:', error);
      toast.error('Could not load the Day Book');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => { loadDay(); }, [loadDay]);

  const totals = useMemo(() => rows.reduce((sum, row) => ({
    debit: sum.debit + (row.debit || 0),
    credit: sum.credit + (row.credit || 0),
  }), { debit: purchases, credit: sales }), [rows, purchases, sales]);

  const updateRow = (index: number, patch: Partial<DayBookEntry>) => {
    setRows(current => {
      const next = current.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row);
      if (index === current.length - 1) next.push(newRow(next.length));
      return next;
    });
  };

  const moveNext = (event: React.KeyboardEvent, rowIndex: number, field: string) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const order = ['account', 'description', 'debit', 'credit'];
    const fieldIndex = order.indexOf(field);
    const nextField = fieldIndex === order.length - 1 ? 'account' : order[fieldIndex + 1];
    const nextRow = fieldIndex === order.length - 1 ? rowIndex + 1 : rowIndex;
    const view = window.matchMedia('(min-width: 768px)').matches ? 'desktop' : 'mobile';
    window.setTimeout(() => fieldsRef.current[`${view}-${nextRow}-${nextField}`]?.focus(), 0);
  };

  const handleAccount = (value: string, rowIndex: number) => {
    if (value === ADD_ACCOUNT) {
      setPendingRow(rowIndex);
      setAccountDialogOpen(true);
      return;
    }
    updateRow(rowIndex, { accountId: value });
    const view = window.matchMedia('(min-width: 768px)').matches ? 'desktop' : 'mobile';
    window.setTimeout(() => fieldsRef.current[`${view}-${rowIndex}-description`]?.focus(), 0);
  };

  const addAccount = async () => {
    if (!newAccountName.trim()) return;
    try {
      const account = await dayBookService.addAccount(newAccountName);
      setAccounts(current => [...current, account].sort((a, b) => a.name.localeCompare(b.name)));
      if (pendingRow !== null) updateRow(pendingRow, { accountId: account.id });
      setAccountDialogOpen(false);
      setNewAccountName('');
      toast.success('Account added');
    } catch (error: unknown) {
      const errorCode = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
      toast.error(errorCode === '23505' ? 'That account already exists' : 'Could not add account');
    }
  };

  const save = async () => {
    const entered = rows.filter(row => row.accountId || row.description.trim() || row.debit || row.credit);
    const invalid = entered.some(row => !row.accountId || ((!row.debit && !row.credit) || (!!row.debit && !!row.credit)));
    if (invalid) {
      toast.error('Complete each row with an account and either Debit or Credit');
      return;
    }
    setSaving(true);
    try {
      await dayBookService.saveEntries(date, entered);
      await loadDay();
      toast.success('Day Book saved');
    } catch (error) {
      console.error('Failed to save Day Book:', error);
      toast.error('Could not save the Day Book');
    } finally {
      setSaving(false);
    }
  };

  const amountInput = (row: DayBookEntry, index: number, side: 'debit' | 'credit', mobile: boolean) => (
    <Input
      ref={node => { fieldsRef.current[`${mobile ? 'mobile' : 'desktop'}-${index}-${side}`] = node; }}
      aria-label={`${side} row ${index + 1}`}
      type="number" min="0" step="0.01" inputMode="decimal"
      value={row[side] ?? ''}
      onKeyDown={event => moveNext(event, index, side)}
      onChange={event => {
        const value = event.target.value === '' ? null : Math.max(0, Number(event.target.value));
        updateRow(index, side === 'debit' ? { debit: value, credit: value ? null : row.credit } : { credit: value, debit: value ? null : row.debit });
      }}
      className="h-11 text-right tabular-nums"
    />
  );

  const editableRow = (row: DayBookEntry, index: number, mobile = false) => (
    <div key={`${mobile ? 'mobile' : 'desktop'}-${row.id}`} className={mobile ? 'border-b p-3 space-y-3 last:border-0' : 'grid grid-cols-[minmax(180px,1fr)_minmax(220px,2fr)_150px_150px] gap-2 border-b p-2 last:border-0'}>
      <div>
        {mobile && <label className="mb-1 block text-xs font-medium text-muted-foreground">Account</label>}
        <Select value={row.accountId} onValueChange={value => handleAccount(value, index)}>
          <SelectTrigger ref={node => { fieldsRef.current[`${mobile ? 'mobile' : 'desktop'}-${index}-account`] = node; }} onKeyDown={event => moveNext(event, index, 'account')} className="h-11">
            <SelectValue placeholder="Select account" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map(account => <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>)}
            <SelectItem value={ADD_ACCOUNT}><span className="flex items-center gap-2 font-medium"><Plus className="h-4 w-4" /> Add New Account</span></SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        {mobile && <label className="mb-1 block text-xs font-medium text-muted-foreground">Description</label>}
        <Input ref={node => { fieldsRef.current[`${mobile ? 'mobile' : 'desktop'}-${index}-description`] = node; }} value={row.description} onChange={event => updateRow(index, { description: event.target.value })} onKeyDown={event => moveNext(event, index, 'description')} placeholder="Transaction description" className="h-11" />
      </div>
      <div className={mobile ? 'grid grid-cols-2 gap-3' : 'contents'}>
        <div>{mobile && <label className="mb-1 block text-xs font-medium text-muted-foreground">Debit</label>}{amountInput(row, index, 'debit', mobile)}</div>
        <div>{mobile && <label className="mb-1 block text-xs font-medium text-muted-foreground">Credit</label>}{amountInput(row, index, 'credit', mobile)}</div>
      </div>
    </div>
  );

  return (
    <div className="p-1 sm:p-4 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-xl font-bold text-foreground">Day Book</h1><p className="text-sm text-muted-foreground">Daily accounts and transactions</p></div>
        <div className="w-full sm:w-56"><label htmlFor="day-book-date" className="mb-1 block text-xs font-medium text-muted-foreground">Date</label><div className="relative"><CalendarDays className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input id="day-book-date" type="date" value={date} onChange={event => setDate(event.target.value)} className="h-11 pl-9" /></div></div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="hidden md:grid grid-cols-[minmax(180px,1fr)_minmax(220px,2fr)_150px_150px] gap-2 border-b bg-muted/50 px-4 py-3 text-sm font-semibold"><span>Account</span><span>Description</span><span className="text-right">Debit</span><span className="text-right">Credit</span></div>
          <div className="grid grid-cols-[minmax(180px,1fr)_minmax(220px,2fr)_150px_150px] gap-2 border-b bg-secondary/50 p-3 text-sm max-md:hidden"><span className="font-semibold">Total Sales</span><span className="text-muted-foreground">From saved sales receipts</span><span className="text-right">—</span><span className="text-right font-semibold text-primary">{money(sales)}</span></div>
          <div className="grid grid-cols-[minmax(180px,1fr)_minmax(220px,2fr)_150px_150px] gap-2 border-b bg-secondary/50 p-3 text-sm max-md:hidden"><span className="font-semibold">Total Purchase</span><span className="text-muted-foreground">From saved purchase receipts</span><span className="text-right font-semibold text-destructive">{money(purchases)}</span><span className="text-right">—</span></div>
          <div className="md:hidden divide-y bg-secondary/50"><div className="flex justify-between p-3"><span className="font-semibold">Total Sales</span><span className="font-semibold text-primary">Credit {money(sales)}</span></div><div className="flex justify-between p-3"><span className="font-semibold">Total Purchase</span><span className="font-semibold text-destructive">Debit {money(purchases)}</span></div></div>
          {loading ? <p className="py-12 text-center text-sm text-muted-foreground">Loading Day Book...</p> : <><div className="hidden md:block">{rows.map((row, index) => editableRow(row, index))}</div><div className="md:hidden">{rows.map((row, index) => editableRow(row, index, true))}</div></>}
          <div className="flex flex-col gap-3 border-t bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-5 text-sm font-semibold"><span>Debit {money(totals.debit)}</span><span>Credit {money(totals.credit)}</span></div><Button onClick={save} disabled={loading || saving} className="min-h-11"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save Day Book'}</Button></div>
        </CardContent>
      </Card>

      <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}><DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Add New Account</DialogTitle></DialogHeader><Input autoFocus value={newAccountName} onChange={event => setNewAccountName(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') addAccount(); }} placeholder="Account name" className="h-11" /><DialogFooter><Button onClick={addAccount} disabled={!newAccountName.trim()} className="min-h-11">Add Account</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
};

export default DayBook;