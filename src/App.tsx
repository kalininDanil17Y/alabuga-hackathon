import "./global.css";

import { Toaster } from "@/components/ui/feedback/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/feedback/sonner";
import { TooltipProvider } from "@/components/ui/overlay/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/dashboard";
import DashboardHome from "./pages/dashboard/home";
import DashboardMissions from "./pages/dashboard/missions";
import DashboardShop from "./pages/dashboard/shop";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/dashboard" element={<Dashboard />}>
                        <Route index element={<DashboardHome />} />
                        <Route path="missions" element={<DashboardMissions />} />
                        <Route path="shop" element={<DashboardShop />} />
                    </Route>

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </TooltipProvider>
    </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
