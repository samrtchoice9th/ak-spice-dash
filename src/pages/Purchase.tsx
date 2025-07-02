
import React from 'react';
import { DataTable } from '@/components/DataTable';

const Purchase = () => {
  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-gray-800">Purchase Management</h1>
      <DataTable title="Purchase" showAddItem={true} showSave={true} type="purchase" />
    </div>
  );
};

export default Purchase;
