
import React from 'react';

interface TableHeaderProps {
  type?: 'purchase' | 'sales' | 'adjustment';
}

export const TableHeader: React.FC<TableHeaderProps> = ({ type = 'sales' }) => {
  const isAdjustment = type === 'adjustment';

  return (
    <thead className="hidden md:table-header-group">
      <tr className="bg-muted/50 border-b-2 border-border">
        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground border-r border-border">
          Item Name
        </th>
        {isAdjustment && (
          <th className="px-6 py-4 text-center text-sm font-semibold text-foreground border-r border-border">
            Action
          </th>
        )}
        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground border-r border-border">
          Qty (Kg)
        </th>
        {isAdjustment && (
          <th className="px-6 py-4 text-left text-sm font-semibold text-foreground border-r border-border">
            Cost (per Kg)
          </th>
        )}
        {isAdjustment && (
          <th className="px-6 py-4 text-left text-sm font-semibold text-foreground border-r border-border">
            Reason
          </th>
        )}
        {isAdjustment && (
          <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
            Value
          </th>
        )}
        {!isAdjustment && (
          <>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground border-r border-border">
              Price
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
              Total
            </th>
          </>
        )}
      </tr>
    </thead>
  );
};
