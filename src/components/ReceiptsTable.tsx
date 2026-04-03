import React, { useState } from 'react';
import { Receipt, Edit, Printer, Smartphone, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Receipt as ReceiptType } from '@/contexts/ReceiptsContext';
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

interface ReceiptsTableProps {
  receipts: ReceiptType[];
  onEdit: (receipt: ReceiptType) => void;
  onPrint: (receipt: ReceiptType) => void;
  onRawBTPrint?: (receipt: ReceiptType) => void;
  onDelete?: (id: string) => void;
}

export const ReceiptsTable: React.FC<ReceiptsTableProps> = ({ receipts, onEdit, onPrint, onRawBTPrint, onDelete }) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);

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

  if (receipts.length === 0) {
    return (
      <>
        {deleteDialog}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">All Receipts</h2>
          </div>
          <div className="p-6 sm:p-8 text-center">
            <Receipt className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No receipts found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start by creating sales or purchase entries to generate receipts.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {deleteDialog}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">All Receipts</h2>
        </div>
        
        <ScrollArea className="h-[600px]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Time</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {receipts.map((receipt) => (
                  <tr key={receipt.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        receipt.type === 'sales' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {receipt.type === 'sales' ? 'Sales' : 'Purchase'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{receipt.date}</td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell text-sm text-gray-900">{receipt.time}</td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Rs.{receipt.totalAmount.toFixed(2)}</td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <Button onClick={() => onEdit(receipt)} variant="outline" size="sm" className="flex items-center space-x-1">
                          <Edit size={16} />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                        <Button onClick={() => onPrint(receipt)} variant="outline" size="sm" className="flex items-center space-x-1">
                          <Printer size={16} />
                          <span className="hidden sm:inline">Print</span>
                        </Button>
                        {onRawBTPrint && (
                          <Button onClick={() => onRawBTPrint(receipt)} variant="outline" size="sm" className="flex items-center space-x-1">
                            <Smartphone size={16} />
                            <span className="hidden sm:inline">RawBT</span>
                          </Button>
                        )}
                        {onDelete && (
                          <Button onClick={() => setDeleteId(receipt.id)} variant="outline" size="sm" className="flex items-center space-x-1 text-destructive hover:text-destructive">
                            <Trash2 size={16} />
                            <span className="hidden sm:inline">Delete</span>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollArea>
      </div>
    </>
  );
};
