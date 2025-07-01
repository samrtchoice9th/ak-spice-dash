
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sidebar, SidebarProvider, SidebarTrigger } from "./components/Sidebar";
import { ReceiptsProvider } from "./contexts/ReceiptsContext";
import { InventoryProvider } from "./contexts/InventoryContext";
import { ProductsProvider } from "./contexts/ProductsContext";
import Dashboard from "./pages/Dashboard";
import Sales from "./pages/Sales";
import Purchase from "./pages/Purchase";
import Inventory from "./pages/Inventory";
import ReceiptPage from "./pages/ReceiptPage";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ReceiptsProvider>
        <ProductsProvider>
          <InventoryProvider>
            <BrowserRouter>
              <SidebarProvider>
                <div className="flex min-h-screen bg-gray-50">
                  {/* Mobile toggle button */}
                  <div className="absolute top-4 left-4 z-50 xl:hidden">
                    <SidebarTrigger />
                  </div>

                  <Sidebar />

                  <div className="flex-1">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/sales" element={<Sales />} />
                    <Route path="/purchase" element={<Purchase />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/receipt" element={<ReceiptPage />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </div>
              </SidebarProvider>
            </BrowserRouter>
          </InventoryProvider>
        </ProductsProvider>
      </ReceiptsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
