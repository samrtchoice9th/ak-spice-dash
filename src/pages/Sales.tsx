
import React from 'react';
import { DataTable } from '@/components/DataTable';

const Sales = () => {
  return (
    <DataTable 
      title="Sales Management" 
      showSave={true} 
      showPrint={false}
      showThermalPrint={true}
      type="sales" 
    />
  );
};

export default Sales;
