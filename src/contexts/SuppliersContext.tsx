import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supplierService, Supplier } from '@/services/supplierService';

interface SuppliersContextType {
  suppliers: Supplier[];
  loading: boolean;
  addSupplier: (s: { name: string; phone?: string; whatsapp_number?: string; address?: string }) => Promise<Supplier>;
  updateSupplier: (id: string, s: { name?: string; phone?: string; whatsapp_number?: string; address?: string }) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  refreshSuppliers: () => Promise<void>;
}

const SuppliersContext = createContext<SuppliersContextType | undefined>(undefined);

export const useSuppliers = () => {
  const ctx = useContext(SuppliersContext);
  if (!ctx) throw new Error('useSuppliers must be used within SuppliersProvider');
  return ctx;
};

export const SuppliersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      setSuppliers(await supplierService.getAll());
    } catch (e) {
      console.error('Failed to fetch suppliers:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refreshSuppliers(); }, [refreshSuppliers]);

  const addSupplier = async (s: { name: string; phone?: string; whatsapp_number?: string; address?: string }) => {
    const newS = await supplierService.create(s);
    setSuppliers(prev => [newS, ...prev]);
    return newS;
  };

  const updateSupplier = async (id: string, s: { name?: string; phone?: string; whatsapp_number?: string; address?: string }) => {
    await supplierService.update(id, s);
    setSuppliers(prev => prev.map(x => x.id === id ? { ...x, ...s } : x));
  };

  const deleteSupplier = async (id: string) => {
    await supplierService.delete(id);
    setSuppliers(prev => prev.filter(x => x.id !== id));
  };

  return (
    <SuppliersContext.Provider value={{ suppliers, loading, addSupplier, updateSupplier, deleteSupplier, refreshSuppliers }}>
      {children}
    </SuppliersContext.Provider>
  );
};
