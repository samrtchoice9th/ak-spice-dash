
import React from 'react';
import { DataTable } from '@/components/DataTable';

const Purchase = () => {
  return (
    <DataTable title="Purchase Management" showAddItem={false} showSave={true} type="purchase" />
  );
};

export default Purchase;
