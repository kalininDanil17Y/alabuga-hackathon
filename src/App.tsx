import "./global.css";

import { Toaster } from "@/components/ui/feedback/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/feedback/sonner";
import { TooltipProvider } from "@/components/ui/overlay/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/dashboard";
import DashboardHome from "./pages/dashboard/home";
import DashboardMissions from "./pages/dashboard/missions";
import DashboardJournal from "./pages/dashboard/journal";
import DashboardJournalHistory from "./pages/dashboard/journal/history";
import DashboardJournalArtifacts from "./pages/dashboard/journal/artifacts";
import DashboardJournalRatings from "./pages/dashboard/journal/ratings";
import DashboardJournalStatistics from "./pages/dashboard/journal/statistics";
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
                        <Route path="journal" element={<DashboardJournal />}>
                            <Route index element={<Navigate to="history" replace />} />
                            <Route path="history" element={<DashboardJournalHistory />} />
                            <Route path="artifacts" element={<DashboardJournalArtifacts />} />
                            <Route path="ratings" element={<DashboardJournalRatings />} />
                            <Route path="statistics" element={<DashboardJournalStatistics />} />
                        </Route>
                        <Route path="shop" element={<DashboardShop />} />
                    </Route>

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </TooltipProvider>
    </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);

