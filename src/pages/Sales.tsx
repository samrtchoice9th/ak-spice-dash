
import React from 'react';
import { DataTable } from '@/components/DataTable';

const Sales = () => {
  return (
    <div className="w-full">
      <DataTable title="Sales" type="sales" />
    </div>
  );
};

export default Sales;
