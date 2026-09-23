import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DayBookAccount, DayBookEntry, LedgerRow } from '@/services/dayBookService';

const SHOP_NAME = 'AK SPICE TRADING';
const SHOP_ADDRESS = '86, In Front of Tile Factory, Mahiyangana';
const SHOP_PHONE = '0773962001';

const money = (value: number) => `Rs. ${value.toLocaleString('en-LK', {
  minimumFractionDigits: 2, maximumFractionDigits: 2,
})}`;

const addHeader = (doc: jsPDF, title: string, subtitle: string) => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(SHOP_NAME, 105, 14, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(SHOP_ADDRESS, 105, 20, { align: 'center' });
  doc.text(`Mob: ${SHOP_PHONE}`, 105, 25, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(title, 14, 35);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(subtitle, 14, 41);
  doc.setFontSize(8);
  doc.text(`Exported: ${new Date().toLocaleString('en-LK', { timeZone: 'Asia/Colombo' })}`, 196, 41, { align: 'right' });
};

const tableStyles = {
  fontSize: 9,
  cellPadding: 2.2,
  lineColor: [0, 0, 0] as [number, number, number],
  lineWidth: 0.1,
  textColor: [0, 0, 0] as [number, number, number],
};

const headStyles = {
  fillColor: [230, 230, 230] as [number, number, number],
  textColor: [0, 0, 0] as [number, number, number],
  fontStyle: 'bold' as const,
};

export interface DayBookPdfData {
  date: string;
  openingBalance: number;
  sales: number;
  purchases: number;
  entries: DayBookEntry[];
  accounts: DayBookAccount[];
  totalDebit: number;
  totalCredit: number;
  closingBalance: number;
  isClosed: boolean;
}

export const exportDayBookPdf = ({ date, openingBalance, sales, purchases, entries, accounts, totalDebit, totalCredit, closingBalance, isClosed }: DayBookPdfData) => {
  const doc = new jsPDF();
  addHeader(doc, 'Day Book', `Date: ${date}${isClosed ? '  (Day Closed)' : ''}`);

  const accountName = (id: string) => accounts.find(a => a.id === id)?.name || '—';
  const filled = entries.filter(row => row.accountId || row.description.trim() || row.debit || row.credit);

  const body: string[][] = [
    ['Opening Balance', 'Brought forward from the previous day', '', money(openingBalance)],
    ['Total Sales', 'From saved sales receipts', '', money(sales)],
    ['Total Purchase', 'From saved purchase receipts', money(purchases), ''],
    ...filled.map(row => [
      accountName(row.accountId),
      row.description || '—',
      row.debit ? money(row.debit) : '',
      row.credit ? money(row.credit) : '',
    ]),
  ];

  autoTable(doc, {
    startY: 46,
    head: [['Account', 'Description', 'Debit', 'Credit']],
    body,
    foot: [[
      'Totals', '',
      money(totalDebit),
      money(totalCredit),
    ]],
    styles: tableStyles,
    headStyles,
    footStyles: { ...headStyles },
    columnStyles: { 2: { halign: 'right' }, 3: { halign: 'right' } },
    theme: 'grid',
  });

  const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 46;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`Closing Balance: ${money(closingBalance)}`, 196, finalY + 9, { align: 'right' });

  doc.save(`day-book-${date}.pdf`);
};

export interface LedgerPdfData {
  periodLabel: string;
  accountLabel: string;
  summary: { id: string; name: string; count: number; debit: number; credit: number; balance: number }[];
  details: (LedgerRow & { balance: number })[];
  totalDebit: number;
  totalCredit: number;
}

export const exportLedgerPdf = ({ periodLabel, accountLabel, summary, details, totalDebit, totalCredit }: LedgerPdfData) => {
  const doc = new jsPDF();
  addHeader(doc, 'Ledger', `Period: ${periodLabel}   Account: ${accountLabel}`);

  autoTable(doc, {
    startY: 46,
    head: [['Account', 'Entries', 'Debit', 'Credit', 'Balance']],
    body: summary.map(row => [row.name, String(row.count), money(row.debit), money(row.credit), money(row.balance)]),
    styles: tableStyles,
    headStyles,
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' } },
    theme: 'grid',
  });

  let y = ((doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 46) + 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Transactions', 14, y);

  autoTable(doc, {
    startY: y + 3,
    head: [['Date', 'Account', 'Description', 'Debit', 'Credit', 'Balance']],
    body: details.map(row => [
      row.entryDate,
      row.accountName,
      row.description || '—',
      row.debit ? money(row.debit) : '',
      row.credit ? money(row.credit) : '',
      money(row.balance),
    ]),
    foot: [['', '', 'Totals', money(totalDebit), money(totalCredit), money(totalDebit - totalCredit)]],
    styles: tableStyles,
    headStyles,
    footStyles: { ...headStyles },
    columnStyles: { 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right' } },
    theme: 'grid',
  });

  const safeName = `${periodLabel}-${accountLabel}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  doc.save(`ledger-${safeName}.pdf`);
};
