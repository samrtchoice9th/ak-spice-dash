
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Navigate } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { TopNavigation } from "./components/TopNavigation";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ReceiptsProvider } from "./contexts/ReceiptsContext";
import { InventoryProvider } from "./contexts/InventoryContext";
import { ProductsProvider } from "./contexts/ProductsContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ShopProvider } from "./contexts/ShopContext";
import { RoleProtectedRoute } from "./components/RoleProtectedRoute";
import { PendingApprovalScreen } from "./components/PendingApprovalScreen";
import { useShop } from "./contexts/ShopContext";
import { useUserRole } from "./hooks/useUserRole";
import Dashboard from "./pages/Dashboard";
import Sales from "./pages/Sales";
import Purchase from "./pages/Purchase";
import StockAdjustment from "./pages/StockAdjustment";
import Inventory from "./pages/Inventory";
import ReceiptPage from "./pages/ReceiptPage";
import Report from "./pages/Report";
import Settings from "./pages/Settings";
import SuperAdmin from "./pages/SuperAdmin";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isShopPending, isShopActive, loading: shopLoading } = useShop();
  const { isSuperAdmin, loading: roleLoading } = useUserRole();

  if (shopLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // If shop is pending and user is not super admin, show pending screen
  if (isShopPending && !isSuperAdmin) {
    return <PendingApprovalScreen />;
  }

  return (
    <ReceiptsProvider>
      <ProductsProvider>
        <InventoryProvider>
          <SidebarProvider>
            <div className="flex min-h-screen bg-gray-50 w-full">
              <Sidebar />
              
              <div className="flex-1 flex flex-col xl:ml-0">
                <TopNavigation />
                
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<RoleProtectedRoute><Dashboard /></RoleProtectedRoute>} />
                    <Route path="/sales" element={<Sales />} />
                    <Route path="/purchase" element={<Purchase />} />
                    <Route path="/stock-adjustment" element={<RoleProtectedRoute><StockAdjustment /></RoleProtectedRoute>} />
                    <Route path="/inventory" element={<RoleProtectedRoute><Inventory /></RoleProtectedRoute>} />
                    <Route path="/receipt" element={<ReceiptPage />} />
                    <Route path="/report" element={<RoleProtectedRoute><Report /></RoleProtectedRoute>} />
                    <Route path="/settings" element={<RoleProtectedRoute><Settings /></RoleProtectedRoute>} />
                    <Route path="/super-admin" element={<RoleProtectedRoute requiredRole="super_admin"><SuperAdmin /></RoleProtectedRoute>} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </div>
          </SidebarProvider>
        </InventoryProvider>
      </ProductsProvider>
    </ReceiptsProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <ShopProvider>
                  <AppContent />
                </ShopProvider>
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
