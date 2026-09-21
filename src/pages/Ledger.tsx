import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DayBookAccount, LedgerRow, dayBookService } from '@/services/dayBookService';

const ALL_ACCOUNTS = '__all__';
const WHOLE_YEAR = '__year__';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const money = (value: number) => `Rs. ${value.toLocaleString('en-LK', {
  minimumFractionDigits: 2, maximumFractionDigits: 2,
})}`;

const pad = (value: number) => String(value).padStart(2, '0');

const nowInSriLanka = () => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Colombo', year: 'numeric', month: '2-digit',
  }).format(new Date()).split('-');
  return { year: Number(parts[0]), month: Number(parts[1]) };
};

const Ledger = () => {
  const today = useMemo(nowInSriLanka, []);
  const [accounts, setAccounts] = useState<DayBookAccount[]>([]);
  const [accountId, setAccountId] = useState(ALL_ACCOUNTS);
  const [year, setYear] = useState(String(today.year));
  const [month, setMonth] = useState(String(today.month));
  const [entries, setEntries] = useState<LedgerRow[]>([]);
  const [loading, setLoading] = useState(true);

  const years = useMemo(() => {
    const list: string[] = [];
    for (let y = today.year; y >= 2024; y -= 1) list.push(String(y));
    return list;
  }, [today.year]);

  useEffect(() => {
    dayBookService.getAccounts()
      .then(setAccounts)
      .catch(() => toast.error('Could not load accounts'));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const selectedYear = Number(year);
    const start = month === WHOLE_YEAR ? `${selectedYear}-01-01` : `${selectedYear}-${pad(Number(month))}-01`;
    const endDate = month === WHOLE_YEAR
      ? new Date(selectedYear, 11, 31)
      : new Date(selectedYear, Number(month), 0);
    const end = `${endDate.getFullYear()}-${pad(endDate.getMonth() + 1)}-${pad(endDate.getDate())}`;

    setLoading(true);
    dayBookService.getLedger(start, end)
      .then(rows => { if (!cancelled) setEntries(rows); })
      .catch(() => { if (!cancelled) toast.error('Could not load the ledger'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [year, month]);

  const filtered = useMemo(
    () => accountId === ALL_ACCOUNTS ? entries : entries.filter(row => row.accountId === accountId),
    [entries, accountId]
  );

  const detailRows = useMemo(() => {
    let balance = 0;
    return filtered.map(row => {
      balance += row.debit - row.credit;
      return { ...row, balance };
    });
  }, [filtered]);

  const summary = useMemo(() => {
    const map = new Map<string, { name: string; debit: number; credit: number; count: number }>();
    entries.forEach(row => {
      const current = map.get(row.accountId) || { name: row.accountName, debit: 0, credit: 0, count: 0 };
      current.debit += row.debit;
      current.credit += row.credit;
      current.count += 1;
      map.set(row.accountId, current);
    });
    return [...map.entries()]
      .map(([id, value]) => ({ id, ...value, balance: value.debit - value.credit }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [entries]);

  const detailTotals = useMemo(() => filtered.reduce((sum, row) => ({
    debit: sum.debit + row.debit, credit: sum.credit + row.credit,
  }), { debit: 0, credit: 0 }), [filtered]);

  const periodLabel = month === WHOLE_YEAR ? `Year ${year}` : `${MONTHS[Number(month) - 1]} ${year}`;

  return (
    <div className="p-1 sm:p-4 space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Ledger</h1>
          <p className="text-sm text-muted-foreground">View-only account details for {periodLabel}</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:w-auto">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Account</label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger className="h-11 sm:w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_ACCOUNTS}>All accounts</SelectItem>
                {accounts.map(account => <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Year</label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="h-11 sm:w-32"><SelectValue /></SelectTrigger>
              <SelectContent>{years.map(value => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Month</label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="h-11 sm:w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={WHOLE_YEAR}>Whole year</SelectItem>
                {MONTHS.map((name, index) => <SelectItem key={name} value={String(index + 1)}>{name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Account Summary — {periodLabel}</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="hidden md:grid grid-cols-[2fr_100px_150px_150px_150px] gap-2 border-y bg-muted/50 px-4 py-3 text-sm font-semibold">
            <span>Account</span><span className="text-right">Entries</span><span className="text-right">Debit</span><span className="text-right">Credit</span><span className="text-right">Balance</span>
          </div>
          {loading ? <p className="py-10 text-center text-sm text-muted-foreground">Loading ledger...</p>
            : summary.length === 0 ? <p className="py-10 text-center text-sm text-muted-foreground">No entries for this period.</p>
            : <>
              <div className="hidden md:block">
                {summary.map(row => (
                  <div key={row.id} className="grid grid-cols-[2fr_100px_150px_150px_150px] gap-2 border-b px-4 py-3 text-sm last:border-0">
                    <span className="font-medium">{row.name}</span>
                    <span className="text-right tabular-nums">{row.count}</span>
                    <span className="text-right tabular-nums">{money(row.debit)}</span>
                    <span className="text-right tabular-nums">{money(row.credit)}</span>
                    <span className="text-right font-semibold tabular-nums">{money(row.balance)}</span>
                  </div>
                ))}
              </div>
              <div className="divide-y md:hidden">
                {summary.map(row => (
                  <div key={row.id} className="space-y-1 p-3 text-sm">
                    <div className="flex justify-between font-medium"><span>{row.name}</span><span>{row.count} entries</span></div>
                    <div className="flex justify-between text-muted-foreground"><span>Debit {money(row.debit)}</span><span>Credit {money(row.credit)}</span></div>
                    <div className="font-semibold">Balance {money(row.balance)}</div>
                  </div>
                ))}
              </div>
            </>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {accountId === ALL_ACCOUNTS ? 'All Transactions' : `${accounts.find(a => a.id === accountId)?.name || 'Account'} Transactions`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden md:grid grid-cols-[120px_minmax(150px,1fr)_minmax(180px,2fr)_130px_130px_140px] gap-2 border-y bg-muted/50 px-4 py-3 text-sm font-semibold">
            <span>Date</span><span>Account</span><span>Description</span><span className="text-right">Debit</span><span className="text-right">Credit</span><span className="text-right">Balance</span>
          </div>
          {loading ? <p className="py-10 text-center text-sm text-muted-foreground">Loading transactions...</p>
            : detailRows.length === 0 ? <p className="py-10 text-center text-sm text-muted-foreground">No transactions for this selection.</p>
            : <>
              <div className="hidden md:block">
                {detailRows.map(row => (
                  <div key={row.id} className="grid grid-cols-[120px_minmax(150px,1fr)_minmax(180px,2fr)_130px_130px_140px] gap-2 border-b px-4 py-3 text-sm last:border-0">
                    <span className="tabular-nums">{row.entryDate}</span>
                    <span>{row.accountName}</span>
                    <span className="text-muted-foreground">{row.description || '—'}</span>
                    <span className="text-right tabular-nums">{row.debit ? money(row.debit) : '—'}</span>
                    <span className="text-right tabular-nums">{row.credit ? money(row.credit) : '—'}</span>
                    <span className="text-right font-medium tabular-nums">{money(row.balance)}</span>
                  </div>
                ))}
              </div>
              <div className="divide-y md:hidden">
                {detailRows.map(row => (
                  <div key={row.id} className="space-y-1 p-3 text-sm">
                    <div className="flex justify-between font-medium"><span>{row.accountName}</span><span className="tabular-nums">{row.entryDate}</span></div>
                    {row.description && <p className="text-muted-foreground">{row.description}</p>}
                    <div className="flex justify-between"><span>{row.debit ? `Debit ${money(row.debit)}` : `Credit ${money(row.credit)}`}</span><span className="font-semibold">{money(row.balance)}</span></div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-5 border-t bg-muted/30 p-3 text-sm font-semibold">
                <span>Debit {money(detailTotals.debit)}</span>
                <span>Credit {money(detailTotals.credit)}</span>
                <span>Balance {money(detailTotals.debit - detailTotals.credit)}</span>
              </div>
            </>}
        </CardContent>
      </Card>
    </div>
  );
};

export default Ledger;
