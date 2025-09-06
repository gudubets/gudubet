import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Gift, TrendingUp, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const banners = [
  {
    id: 1,
    title: "Hoş Geldin Bonusu",
    subtitle: "%100 Bonus + 50 Free Spin",
    description: "İlk yatırımında 1000₺'ye kadar %100 bonus kazan!",
    bgColor: "from-primary to-orange-600",
    icon: Gift,
    cta: "Hemen Katıl",
  },
  {
    id: 2,
    title: "Canlı Bahis Heyecanı",
    subtitle: "Her Maça Özel Oranlar",
    description: "Favori takımını destekle, yüksek oranlarla kazan!",
    bgColor: "from-secondary to-green-600",
    icon: TrendingUp,
    cta: "Bahis Yap",
  },
  {
    id: 3,
    title: "Haftalık Cashback",
    subtitle: "%10 Geri Ödeme",
    description: "Kayıpların %10'unu geri alarak şansını artır!",
    bgColor: "from-purple-500 to-blue-600",
    icon: Star,
    cta: "Detaylar",
  },
];

export function PromoBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-dark h-64 md:h-80">
      {/* Slides */}
      <div
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {banners.map((banner) => {
          const Icon = banner.icon;
          return (
            <div
              key={banner.id}
              className={`w-full flex-shrink-0 bg-gradient-to-r ${banner.bgColor} relative overflow-hidden`}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 right-10 w-32 h-32 rounded-full border-2 border-white/30"></div>
                <div className="absolute bottom-10 right-32 w-24 h-24 rounded-full border-2 border-white/20"></div>
              </div>

              {/* Content */}
              <div className="relative h-full flex items-center">
                <div className="container mx-auto px-6 md:px-8">
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <Icon className="h-8 w-8 text-white" />
                      <h2 className="text-2xl md:text-4xl font-bold text-white">
                        {banner.title}
                      </h2>
                    </div>
                    <p className="text-lg md:text-xl text-white/90 mb-2">
                      {banner.subtitle}
                    </p>
                    <p className="text-white/80 mb-6 text-sm md:text-base">
                      {banner.description}
                    </p>
                    <Button
                      size="lg"
                      className="bg-white text-gray-900 hover:bg-white/90 font-semibold"
                    >
                      {banner.cta}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
        onClick={nextSlide}
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSlide ? "bg-white" : "bg-white/40"
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
}