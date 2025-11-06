
import React from 'react';
import { DataTable } from '@/components/DataTable';

const Purchase = () => {
  return (
    <DataTable 
      title="Purchase Management" 
      showAddItem={false} 
      showSave={true} 
      showPrint={false}
      showThermalPrint={true}
      type="purchase" 
    />
  );
};

export default Purchase;
