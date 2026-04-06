
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
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
import { CustomersProvider } from "./contexts/CustomersContext";
import { SuppliersProvider } from "./contexts/SuppliersContext";
import { AuthProvider } from "./contexts/AuthContext";
import { RoleProtectedRoute } from "./components/RoleProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Sales from "./pages/Sales";
import Purchase from "./pages/Purchase";

import Inventory from "./pages/Inventory";
import ReceiptPage from "./pages/ReceiptPage";
import Report from "./pages/Report";
import Settings from "./pages/Settings";
import Customers from "./pages/Customers";
import CustomerDetail from "./pages/CustomerDetail";
import Suppliers from "./pages/Suppliers";
import SupplierDetail from "./pages/SupplierDetail";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
                <ReceiptsProvider>
                  <ProductsProvider>
                    <CustomersProvider>
                      <SuppliersProvider>
                        <InventoryProvider>
                          <SidebarProvider>
                            <div className="flex min-h-screen bg-background w-full">
                              <Sidebar />
                              <div className="flex-1 flex flex-col xl:ml-0">
                                <TopNavigation />
                                <main className="flex-1 px-2 sm:px-4 pt-2">
                                  <Routes>
                                    <Route path="/" element={<RoleProtectedRoute requiredRole="super_admin"><Dashboard /></RoleProtectedRoute>} />
                                    <Route path="/sales" element={<Sales />} />
                                    <Route path="/purchase" element={<Purchase />} />
                                    <Route path="/customers" element={<RoleProtectedRoute requiredRole="admin"><Customers /></RoleProtectedRoute>} />
                                    <Route path="/customers/:id" element={<RoleProtectedRoute requiredRole="admin"><CustomerDetail /></RoleProtectedRoute>} />
                                    <Route path="/suppliers" element={<RoleProtectedRoute requiredRole="admin"><Suppliers /></RoleProtectedRoute>} />
                                    <Route path="/suppliers/:id" element={<RoleProtectedRoute requiredRole="admin"><SupplierDetail /></RoleProtectedRoute>} />
                                    <Route path="/stock-adjustment" element={<RoleProtectedRoute requiredRole="super_admin"><StockAdjustment /></RoleProtectedRoute>} />
                                    <Route path="/inventory" element={<RoleProtectedRoute requiredRole="super_admin"><Inventory /></RoleProtectedRoute>} />
                                    <Route path="/receipt" element={<RoleProtectedRoute requiredRole="admin"><ReceiptPage /></RoleProtectedRoute>} />
                                    <Route path="/report" element={<Report />} />
                                    <Route path="/settings" element={<RoleProtectedRoute requiredRole="super_admin"><Settings /></RoleProtectedRoute>} />
                                    <Route path="*" element={<NotFound />} />
                                  </Routes>
                                </main>
                              </div>
                            </div>
                          </SidebarProvider>
                        </InventoryProvider>
                      </SuppliersProvider>
                    </CustomersProvider>
                  </ProductsProvider>
                </ReceiptsProvider>
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
