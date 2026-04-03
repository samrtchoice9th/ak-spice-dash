
import React from 'react';

interface DataTableContainerProps {
  title: string;
  children: React.ReactNode;
}

export const DataTableContainer: React.FC<DataTableContainerProps> = ({ title, children }) => {
  return (
    <div className="flex-1 p-3 sm:p-6 lg:p-8">
      <h1 className="text-lg sm:text-2xl font-bold text-center mb-4 sm:mb-8 text-foreground">{title}</h1>
      
      <div className="bg-card rounded-lg shadow-lg overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            {children}
          </table>
        </div>
      </div>
    </div>
  );
};
