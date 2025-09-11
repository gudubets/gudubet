import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useSendDeviceFingerprintOnMount } from './hooks/useDeviceFingerprint';
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
import SlotGame from "./pages/SlotGame";
import DepositWithdrawal from "./pages/DepositWithdrawal";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminUsersList from "./pages/admin/users/AdminUsersList";
import DevicesManager from "./pages/admin/risk/DevicesManager";
import BonusRulesEditor from "./pages/admin/bonuses/BonusRulesEditor";
import AdminBets from "./pages/admin/AdminBets";
import AdminGameSessions from "./pages/admin/AdminGameSessions";
import AdminBonuses from "./pages/admin/AdminBonuses";
import AdminFinance from "./pages/admin/AdminFinance";
import AdminManagement from "./pages/admin/AdminManagement";
import AdminBalance from "./pages/admin/AdminBalance";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminCRM from "./pages/admin/AdminCRM";
import AdminCompetitorAnalysis from "./pages/admin/AdminCompetitorAnalysis";
import AdminGameProviders from "./pages/admin/AdminGameProviders";
import AdminWithdrawals from "./pages/admin/AdminWithdrawals";
import AdminFraudDetection from "./pages/admin/AdminFraudDetection";
import CookiePolicy from "./pages/CookiePolicy";
import AgeWarning from "./pages/AgeWarning";
import Game from "./pages/Game";
import BonusesList from "./pages/admin/bonuses/BonusesList";
import BonusForm from "./pages/admin/bonuses/BonusForm";
import MyBonuses from "./pages/user/bonuses/MyBonuses";
import BonusProgress from "./pages/user/bonuses/BonusProgress";
import RequestWithdrawal from "./pages/user/RequestWithdrawal";
import PasswordSecurity from "./pages/PasswordSecurity";
import AdminRiskQueue from "./pages/admin/AdminRiskQueue";
import AdminReports from "./pages/admin/AdminReports";

const queryClient = new QueryClient();

const App = () => {
  // Initialize device fingerprinting for security tracking
  useSendDeviceFingerprintOnMount();
  
  return (
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
          <Route path="/user/bonuses" element={<MyBonuses />} />
          <Route path="/user/bonuses/progress" element={<BonusProgress />} />
          <Route path="/user/withdraw" element={<RequestWithdrawal />} />
          <Route path="/password-security" element={<PasswordSecurity />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="users-list" element={<AdminUsersList />} />
            <Route path="devices" element={<DevicesManager />} />
            <Route path="bonuses/:id/rules" element={<BonusRulesEditor />} />
            <Route path="bets" element={<AdminBets />} />
            <Route path="game-sessions" element={<AdminGameSessions />} />
            <Route path="game-providers" element={<AdminGameProviders />} />
            <Route path="bonuses/list" element={<BonusesList />} />
            <Route path="bonuses/create" element={<BonusForm />} />
            <Route path="bonuses/rules" element={<BonusesList />} />
            <Route path="bonuses/:id/edit" element={<BonusForm />} />
            <Route path="bonuses/:id/rules" element={<BonusRulesEditor />} />
            <Route path="finance" element={<AdminFinance />} />
            <Route path="withdrawals" element={<AdminWithdrawals />} />
            <Route path="fraud-detection" element={<AdminFraudDetection />} />
            <Route path="balance" element={<AdminBalance />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="crm" element={<AdminCRM />} />
            <Route path="competitor-analysis" element={<AdminCompetitorAnalysis />} />
            <Route path="management" element={<AdminManagement />} />
            <Route path="risk-queue" element={<AdminRiskQueue />} />
            <Route path="reports" element={<AdminReports />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
