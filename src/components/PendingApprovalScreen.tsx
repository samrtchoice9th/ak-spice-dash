
import React from 'react';
import { Clock, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useShop } from '@/contexts/ShopContext';

export const PendingApprovalScreen: React.FC = () => {
  const { signOut } = useAuth();
  const { shop } = useShop();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
          <Clock className="w-8 h-8 text-amber-600" />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pending Approval</h2>
          <p className="mt-2 text-gray-600">
            Your shop <strong>"{shop?.name || 'Your Shop'}"</strong> is awaiting approval from the system administrator.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            You will be able to access the system once your shop has been approved.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            ⏳ Status: <strong>Pending Review</strong>
          </p>
        </div>

        <Button
          onClick={() => signOut()}
          variant="outline"
          className="flex items-center space-x-2 mx-auto"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </Button>
      </div>
    </div>
  );
};
