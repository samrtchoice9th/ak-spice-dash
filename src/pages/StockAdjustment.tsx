
import React from 'react';
import { DataTable } from '@/components/DataTable';

const StockAdjustment = () => {
  return (
    <DataTable title="Stock Adjustment" showSave={true} type="adjustment" />
  );
};

export default StockAdjustment;
