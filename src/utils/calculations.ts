
import { TableRow } from '@/types/table';

export const calculateRowTotal = (qty: number, price: number): number => {
  return qty * price;
};

export const calculateGrandTotal = (rows: TableRow[]): number => {
  return rows.reduce((sum, row) => sum + calculateRowTotal(row.qty, row.price), 0);
};
