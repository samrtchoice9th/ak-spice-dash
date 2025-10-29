
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
import { AuthProvider } from "./contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import Sales from "./pages/Sales";
import Purchase from "./pages/Purchase";
import StockAdjustment from "./pages/StockAdjustment";
import Inventory from "./pages/Inventory";
import ReceiptPage from "./pages/ReceiptPage";
import Report from "./pages/Report";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <ReceiptsProvider>
          <ProductsProvider>
            <InventoryProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/*" element={
                    <ProtectedRoute>
                      <SidebarProvider>
                        <div className="flex min-h-screen bg-gray-50 w-full">
                          <Sidebar />
                          
                          <div className="flex-1 flex flex-col xl:ml-0">
                            <TopNavigation />
                            
                            <main className="flex-1">
                              <Routes>
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/sales" element={<Sales />} />
                                <Route path="/purchase" element={<Purchase />} />
                                <Route path="/stock-adjustment" element={<StockAdjustment />} />
                                <Route path="/inventory" element={<Inventory />} />
                                <Route path="/receipt" element={<ReceiptPage />} />
                                <Route path="/report" element={<Report />} />
                                <Route path="/settings" element={<Settings />} />
                                <Route path="*" element={<NotFound />} />
                              </Routes>
                            </main>
                          </div>
                        </div>
                      </SidebarProvider>
                    </ProtectedRoute>
                  } />
                </Routes>
              </BrowserRouter>
            </InventoryProvider>
          </ProductsProvider>
        </ReceiptsProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
