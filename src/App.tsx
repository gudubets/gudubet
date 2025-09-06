import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Casino from "./pages/Casino";
import LiveCasino from "./pages/LiveCasino";
import SportsBetting from "./pages/SportsBetting";
import LiveBetting from "./pages/LiveBetting";
import Promotions from "./pages/Promotions";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminBets from "./pages/admin/AdminBets";
import AdminGameSessions from "./pages/admin/AdminGameSessions";
import AdminBonuses from "./pages/admin/AdminBonuses";
import AdminFinance from "./pages/admin/AdminFinance";
import AdminCompetitorAnalysis from "./pages/admin/AdminCompetitorAnalysis";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/casino" element={<Casino />} />
          <Route path="/live-casino" element={<LiveCasino />} />
          <Route path="/sports-betting" element={<SportsBetting />} />
          <Route path="/live-betting" element={<LiveBetting />} />
          <Route path="/promotions" element={<Promotions />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="bets" element={<AdminBets />} />
            <Route path="game-sessions" element={<AdminGameSessions />} />
            <Route path="bonuses" element={<AdminBonuses />} />
            <Route path="finance" element={<AdminFinance />} />
            <Route path="competitor-analysis" element={<AdminCompetitorAnalysis />} />
            <Route path="management" element={<AdminManagement />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
