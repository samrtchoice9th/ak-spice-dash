import React, { useState, useMemo } from 'react';
import { Receipt, Edit, Printer, Smartphone, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Receipt as ReceiptType } from '@/contexts/ReceiptsContext';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const PAGE_SIZE = 50;

interface ReceiptsTableProps {
  receipts: ReceiptType[];
  onEdit: (receipt: ReceiptType) => void;
  onPrint: (receipt: ReceiptType) => void;
  onRawBTPrint?: (receipt: ReceiptType) => void;
  onDelete?: (id: string) => void;
}

const getTypeBadge = (type: string) => {
  const map: Record<string, { bg: string; label: string }> = {
    sales: { bg: 'bg-green-100 text-green-800', label: 'Sales' },
    purchase: { bg: 'bg-blue-100 text-blue-800', label: 'Purchase' },
    increase: { bg: 'bg-teal-100 text-teal-800', label: 'Stock In' },
    reduce: { bg: 'bg-orange-100 text-orange-800', label: 'Stock Out' },
    adjustment: { bg: 'bg-purple-100 text-purple-800', label: 'Adjustment' },
  };
  const info = map[type] || { bg: 'bg-muted text-muted-foreground', label: type };
  return <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${info.bg}`}>{info.label}</span>;
};

export const ReceiptsTable: React.FC<ReceiptsTableProps> = ({ receipts, onEdit, onPrint, onRawBTPrint, onDelete }) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const isMobile = useIsMobile();

  const filteredReceipts = useMemo(() => {
    if (!searchTerm.trim()) return receipts;
    const term = searchTerm.toLowerCase();
    return receipts.filter(r =>
      r.items.some(i => i.itemName.toLowerCase().includes(term)) ||
      r.totalAmount.toFixed(2).includes(term) ||
      r.type.toLowerCase().includes(term)
    );
  }, [receipts, searchTerm]);

  const visibleReceipts = useMemo(() => filteredReceipts.slice(0, visibleCount), [filteredReceipts, visibleCount]);
  const hasMore = visibleCount < filteredReceipts.length;

  const handleConfirmDelete = () => {
    if (deleteId && onDelete) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  const deleteDialog = (
    <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Receipt?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this receipt and reverse its stock effects. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  const searchBar = (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search by item, amount, type..."
        value={searchTerm}
        onChange={(e) => { setSearchTerm(e.target.value); setVisibleCount(PAGE_SIZE); }}
        className="pl-9 h-9"
      />
    </div>
  );

  const receiptCount = (
    <p className="text-xs text-muted-foreground">
      Showing {visibleReceipts.length} of {filteredReceipts.length} receipts
      {searchTerm && ` (filtered from ${receipts.length})`}
    </p>
  );

  const loadMoreButton = hasMore && (
    <div className="p-3 text-center border-t border-border">
      <Button variant="outline" size="sm" onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}>
        Load More ({filteredReceipts.length - visibleCount} remaining)
      </Button>
    </div>
  );

  if (receipts.length === 0) {
    return (
      <>
        {deleteDialog}
        <div className="bg-card rounded-lg shadow-lg overflow-hidden border border-border">
          <div className="px-4 sm:px-6 py-4 border-b border-border">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">All Receipts</h2>
          </div>
          <div className="p-6 sm:p-8 text-center">
            <Receipt className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium text-foreground">No receipts found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Start by creating sales or purchase entries to generate receipts.
            </p>
          </div>
        </div>
      </>
    );
  }

  // Mobile card view
  if (isMobile) {
    return (
      <>
        {deleteDialog}
        <div className="bg-card rounded-lg shadow-lg overflow-hidden border border-border">
          <div className="px-4 py-3 border-b border-border space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">All Receipts</h2>
            </div>
            {searchBar}
            {receiptCount}
          </div>
          <ScrollArea className="h-[600px]">
            <div className="divide-y divide-border">
              {visibleReceipts.map((receipt) => (
                <div key={receipt.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    {getTypeBadge(receipt.type)}
                    <span className="text-sm font-bold text-foreground">Rs.{receipt.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{receipt.date}</span>
                    <span>{receipt.time}</span>
                  </div>
                  {receipt.due_amount > 0 && (
                    <div className="text-xs text-destructive font-medium">
                      Due: Rs.{receipt.due_amount.toFixed(2)}
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-1">
                    <Button onClick={() => onEdit(receipt)} variant="outline" size="icon" className="h-10 w-10">
                      <Edit size={18} />
                    </Button>
                    <Button onClick={() => onPrint(receipt)} variant="outline" size="icon" className="h-10 w-10">
                      <Printer size={18} />
                    </Button>
                    {onRawBTPrint && (
                      <Button onClick={() => onRawBTPrint(receipt)} variant="outline" size="icon" className="h-10 w-10">
                        <Smartphone size={18} />
                      </Button>
                    )}
                    {onDelete && (
                      <Button onClick={() => setDeleteId(receipt.id)} variant="outline" size="icon" className="h-10 w-10 text-destructive hover:text-destructive">
                        <Trash2 size={18} />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {loadMoreButton}
          </ScrollArea>
        </div>
      </>
    );
  }

  // Desktop table view
  return (
    <>
      {deleteDialog}
      <div className="bg-card rounded-lg shadow-lg overflow-hidden border border-border">
        <div className="px-4 sm:px-6 py-4 border-b border-border space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">All Receipts</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-sm">{searchBar}</div>
            {receiptCount}
          </div>
        </div>
        
        <ScrollArea className="h-[600px]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Time</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Amount</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {visibleReceipts.map((receipt) => (
                  <tr key={receipt.id} className="hover:bg-muted/30">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      {getTypeBadge(receipt.type)}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-foreground">{receipt.date}</td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-foreground">{receipt.time}</td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">Rs.{receipt.totalAmount.toFixed(2)}</td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <Button onClick={() => onEdit(receipt)} variant="outline" size="sm" className="flex items-center space-x-1">
                          <Edit size={16} />
                          <span>Edit</span>
                        </Button>
                        <Button onClick={() => onPrint(receipt)} variant="outline" size="sm" className="flex items-center space-x-1">
                          <Printer size={16} />
                          <span>Print</span>
                        </Button>
                        {onRawBTPrint && (
                          <Button onClick={() => onRawBTPrint(receipt)} variant="outline" size="sm" className="flex items-center space-x-1">
                            <Smartphone size={16} />
                            <span>RawBT</span>
                          </Button>
                        )}
                        {onDelete && (
                          <Button onClick={() => setDeleteId(receipt.id)} variant="outline" size="sm" className="flex items-center space-x-1 text-destructive hover:text-destructive">
                            <Trash2 size={16} />
                            <span>Delete</span>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {loadMoreButton}
        </ScrollArea>
      </div>
    </>
  );
};
