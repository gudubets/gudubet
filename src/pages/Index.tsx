import { useEffect } from 'react';
import Header from '@/components/layout/Header';
import HeroSection from '@/components/sections/HeroSection';
import GameCategories from '@/components/sections/GameCategories';
import LiveScoresSection from '@/components/sections/LiveScoresSection';
import Footer from '@/components/sections/Footer';

const Index = () => {
  useEffect(() => {
    // Create super admin on app load (only runs once)
    const initializeSuperAdmin = async () => {
      try {
        const { createSuperAdmin } = await import('@/utils/createSuperAdmin');
        await createSuperAdmin();
      } catch (error) {
        console.log('Super admin initialization:', error);
      }
    };

    initializeSuperAdmin();
  }, []);

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
