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
import VIP from "./pages/VIP";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Partnership from "./pages/Partnership";
import ResponsibleGaming from "./pages/ResponsibleGaming";
import ContactUs from "./pages/ContactUs";
import HelpCenter from "./pages/HelpCenter";
import BettingRules from "./pages/BettingRules";
import LiveSupport from "./pages/LiveSupport";
import NotFound from "./pages/NotFound";
import DepositWithdrawal from "./pages/DepositWithdrawal";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminBets from "./pages/admin/AdminBets";
import AdminGameSessions from "./pages/admin/AdminGameSessions";
import AdminBonuses from "./pages/admin/AdminBonuses";
import AdminFinance from "./pages/admin/AdminFinance";
import AdminManagement from "./pages/admin/AdminManagement";
import AdminBalance from "./pages/admin/AdminBalance";
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
          <Route path="/vip" element={<VIP />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/partnership" element={<Partnership />} />
          <Route path="/responsible-gaming" element={<ResponsibleGaming />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/help-center" element={<HelpCenter />} />
          <Route path="/betting-rules" element={<BettingRules />} />
          <Route path="/live-support" element={<LiveSupport />} />
          <Route path="/deposit-withdrawal" element={<DepositWithdrawal />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="bets" element={<AdminBets />} />
            <Route path="game-sessions" element={<AdminGameSessions />} />
            <Route path="bonuses" element={<AdminBonuses />} />
            <Route path="finance" element={<AdminFinance />} />
            <Route path="balance" element={<AdminBalance />} />
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
