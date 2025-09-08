import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';
import { SlotMachine } from '@/components/games/SlotMachine';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

const SlotGame = () => {
  const { gameSlug } = useParams<{ gameSlug: string }>();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getCurrentUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!gameSlug) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Geçersiz oyun</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/casino">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Casino'ya Dön
            </Button>
          </Link>
        </div>

        {/* Slot Machine Component */}
        <SlotMachine gameSlug={gameSlug} user={user} />
      </div>

      <Footer />
    </div>
  );
};

export default SlotGame;