import { Shield, Lock, Award, CreditCard, Smartphone } from "lucide-react";

const paymentMethods = [
  { name: "Visa", logo: "💳" },
  { name: "MasterCard", logo: "💳" },
  { name: "Bitcoin", logo: "₿" },
  { name: "Ethereum", logo: "Ξ" },
  { name: "Papara", logo: "📱" },
  { name: "Ecopayz", logo: "💰" },
];

const securityFeatures = [
  { icon: Shield, label: "SSL Güvenlik", desc: "256-bit şifreleme" },
  { icon: Lock, label: "Güvenli Ödeme", desc: "PCI DSS uyumlu" },
  { icon: Award, label: "Lisanslı", desc: "Curacao Gaming" },
];

export function PaymentFooter() {
  return (
    <footer className="bg-sidebar border-t border-border mt-12">
      <div className="container mx-auto px-4 py-8">
        {/* Payment Methods */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Ödeme Yöntemleri
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {paymentMethods.map((method) => (
              <div
                key={method.name}
                className="bg-card border border-border rounded-lg p-4 flex flex-col items-center justify-center hover:border-primary/50 transition-colors group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                  {method.logo}
                </div>
                <span className="text-xs text-muted-foreground text-center">
                  {method.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Security Features */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-secondary" />
            Güvenlik & Lisanslar
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {securityFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.label}
                  className="bg-card border border-border rounded-lg p-4 flex items-center gap-3 hover:border-secondary/50 transition-colors"
                >
                  <Icon className="h-8 w-8 text-secondary flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-foreground">{feature.label}</h4>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact & Support */}
        <div className="border-t border-border pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div>
              <h4 className="font-semibold text-foreground mb-2">7/24 Destek</h4>
              <p className="text-sm text-muted-foreground">+90 (212) 123-4567</p>
              <p className="text-sm text-muted-foreground">destek@gudubets.com</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Sorumlu Oyun</h4>
              <p className="text-sm text-muted-foreground">18+ yaş sınırı</p>
              <p className="text-sm text-muted-foreground">Kumar bağımlılığına dikkat</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Hızlı Linkler</h4>
              <p className="text-sm text-muted-foreground">Kullanım Koşulları</p>
              <p className="text-sm text-muted-foreground">Gizlilik Politikası</p>
            </div>
          </div>
          
          <div className="border-t border-border mt-6 pt-4 text-center">
            <p className="text-xs text-muted-foreground">
              © 2024 GuduBets. Tüm hakları saklıdır. | License: 8048/JAZ2020-013
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}