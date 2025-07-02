
import React from 'react';
import { DataTable } from '@/components/DataTable';

const Sales = () => {
  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-gray-800">Sales Management</h1>
      <DataTable title="Sales" type="sales" />
    </div>
  );
};

export default Sales;
