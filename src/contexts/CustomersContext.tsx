import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { customerService, Customer } from '@/services/customerService';

interface CustomersContextType {
  customers: Customer[];
  loading: boolean;
  addCustomer: (c: { name: string; phone?: string; whatsapp_number?: string; address?: string }) => Promise<Customer>;
  updateCustomer: (id: string, c: { name?: string; phone?: string; whatsapp_number?: string; address?: string }) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  refreshCustomers: () => Promise<void>;
}

const CustomersContext = createContext<CustomersContextType | undefined>(undefined);

export const useCustomers = () => {
  const ctx = useContext(CustomersContext);
  if (!ctx) throw new Error('useCustomers must be used within CustomersProvider');
  return ctx;
};

export const CustomersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setCustomers(await customerService.getAll());
    } catch (e) {
      console.error('Failed to fetch customers:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refreshCustomers(); }, [refreshCustomers]);

  const addCustomer = async (c: { name: string; phone?: string; whatsapp_number?: string; address?: string }) => {
    const newC = await customerService.create(c);
    setCustomers(prev => [newC, ...prev]);
    return newC;
  };

  const updateCustomer = async (id: string, c: { name?: string; phone?: string; whatsapp_number?: string; address?: string }) => {
    await customerService.update(id, c);
    setCustomers(prev => prev.map(x => x.id === id ? { ...x, ...c } : x));
  };

  const deleteCustomer = async (id: string) => {
    await customerService.delete(id);
    setCustomers(prev => prev.filter(x => x.id !== id));
  };

  return (
    <CustomersContext.Provider value={{ customers, loading, addCustomer, updateCustomer, deleteCustomer, refreshCustomers }}>
      {children}
    </CustomersContext.Provider>
  );
};
