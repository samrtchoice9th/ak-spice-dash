
import React from 'react';
import { DataTable } from '@/components/DataTable';

const Purchase = () => {
  return (
    <DataTable title="Purchase Management" showAddItem={true} showSave={true} type="purchase" />
  );
};

export default Purchase;
