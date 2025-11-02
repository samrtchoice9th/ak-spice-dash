
export interface TableRow {
  id: string;
  itemName: string;
  qty: number;
  price: number;
  adjustmentType?: 'increase' | 'reduce';
  reason?: string;
}
