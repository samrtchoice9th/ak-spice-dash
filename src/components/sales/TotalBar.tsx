import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, Plus } from 'lucide-react';

interface TotalBarProps {
  distinctItems: number;
  grandTotal: number;
  isSaving: boolean;
  hasErrors: boolean;
  onSave: () => void;
  onAddRow: () => void;
}

export const TotalBar: React.FC<TotalBarProps> = React.memo(({
  distinctItems,
  grandTotal,
  isSaving,
  hasErrors,
  onSave,
  onAddRow,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card shadow-lg">
      <div className="flex items-center justify-between px-4 py-3 max-w-screen-xl mx-auto">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onAddRow} className="gap-1">
            <Plus className="h-4 w-4" />
            Row
          </Button>
          <span className="text-sm text-muted-foreground">
            {distinctItems} item{distinctItems !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="text-xl font-bold text-foreground">
          Rs. {grandTotal.toFixed(2)}
        </div>

        <Button
          onClick={onSave}
          disabled={isSaving || hasErrors}
          className="gap-2 min-w-[100px]"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
});

TotalBar.displayName = 'TotalBar';
