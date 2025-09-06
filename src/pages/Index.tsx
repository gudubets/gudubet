import { BettingSidebar } from "@/components/layout/BettingSidebar";
import { BettingNavbar } from "@/components/layout/BettingNavbar";
import { PromoBanner } from "@/components/sections/PromoBanner";
import { PopularBets } from "@/components/sections/PopularBets";
import { BetSlip } from "@/components/sections/BetSlip";
import { PaymentFooter } from "@/components/sections/PaymentFooter";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Layout Container */}
      <div className="flex">
        {/* Sidebar */}
        <BettingSidebar />
        
        {/* Main Content */}
        <div className="flex-1 md:ml-64">
          {/* Top Navigation */}
          <BettingNavbar />
          
          {/* Content Grid */}
          <div className="flex gap-6 p-4 md:p-6">
            {/* Left Content */}
            <div className="flex-1 space-y-6">
              {/* Promo Banner */}
              <PromoBanner />
              
              {/* Popular Bets */}
              <PopularBets />
            </div>
            
            {/* Right Sidebar - Bet Slip */}
            <div className="hidden lg:block w-80">
              <BetSlip />
            </div>
          </div>
          
          {/* Footer */}
          <PaymentFooter />
        </div>
      </div>
    </div>
  );
};

export default Index;
