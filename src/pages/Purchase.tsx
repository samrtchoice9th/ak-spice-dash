
import React from 'react';
import { DataTable } from '@/components/DataTable';

const Purchase = () => {
  return (
    <div className="w-full">
      <DataTable title="Purchase" showAddItem={true} showSave={true} type="purchase" />
    </div>
  );
};

export default Purchase;
