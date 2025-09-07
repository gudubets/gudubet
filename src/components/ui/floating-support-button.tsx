import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FloatingSupportButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate('/live-support')}
      className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-2xl hover:shadow-xl transition-all duration-300 hover:scale-110 animate-pulse"
      size="icon"
    >
      <MessageCircle className="h-8 w-8 text-white" />
      <span className="sr-only">Canlı Destek</span>
    </Button>
  );
};

export default FloatingSupportButton;