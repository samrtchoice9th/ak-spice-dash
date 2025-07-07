
import React from 'react';

interface DataTableContainerProps {
  title: string;
  children: React.ReactNode;
}

export const DataTableContainer: React.FC<DataTableContainerProps> = ({ title, children }) => {
  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-gray-800">{title}</h1>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            {children}
          </table>
        </div>
      </div>
    </div>
  );
};
