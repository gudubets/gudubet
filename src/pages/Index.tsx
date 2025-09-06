import Header from '@/components/layout/Header';
import HeroSection from '@/components/sections/HeroSection';
import GameCategories from '@/components/sections/GameCategories';
import LiveScoresSection from '@/components/sections/LiveScoresSection';
import Footer from '@/components/sections/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <GameCategories />
      <LiveScoresSection />
      <Footer />
    </div>
  );
};

export default Index;
