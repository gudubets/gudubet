import { useState, useCallback } from 'react';

interface PasswordStrength {
  score: number; // 0-4
  level: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong';
  label: string;
  feedback: string[];
  isSecure: boolean;
}

// Yaygın zayıf şifreler listesi
const COMMON_WEAK_PASSWORDS = [
  '12345678', '123456789', '1234567890', 'password', 'password123', 
  'qwerty', 'qwertyui', 'qwerty123', 'admin', 'admin123',
  'welcome', 'welcome123', 'login', 'login123', 'test123',
  'guest', 'guest123', '11111111', '00000000', 'abc123',
  'iloveyou', 'princess', 'dragon', 'monkey', 'letmein',
  'trustno1', 'sunshine', 'master', 'hello', 'charlie',
  'superman', 'michael', 'nicole', 'jordan', 'superman',
  '123qwe', 'qwe123', 'asd123', 'zxc123', '147258',
  '987654321', '123321', '111111', '000000', 'football'
];

// Türkçe yaygın zayıf şifreler
const TURKISH_WEAK_PASSWORDS = [
  'sifre123', 'parola', 'parola123', 'admin123', 'kullanici',
  'test1234', 'deneme123', 'galatasaray', 'fenerbahce', 'besiktas',
  'istanbul', 'ankara', 'izmir', 'turkiye', 'merhaba',
  'hosgeldin', 'asdasd', 'qweasd', '159753', 'asd123'
];

export const usePasswordSecurity = () => {
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    level: 'very-weak',
    label: 'Çok Zayıf',
    feedback: [],
    isSecure: false
  });

  const checkPasswordStrength = useCallback((password: string): PasswordStrength => {
    if (!password) {
      return {
        score: 0,
        level: 'very-weak',
        label: 'Çok Zayıf',
        feedback: ['Şifre girmelisiniz'],
        isSecure: false
      };
    }

    let score = 0;
    const feedback: string[] = [];

    // Uzunluk kontrolü
    if (password.length >= 8) score += 1;
    else feedback.push('En az 8 karakter olmalı');

    if (password.length >= 12) score += 1;

    // Karakter çeşitliliği kontrolleri
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Küçük harf içermeli');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Büyük harf içermeli');

    if (/[0-9]/.test(password)) score += 1;
    else feedback.push('Rakam içermeli');

    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    else feedback.push('Özel karakter içermeli (!@#$%^&*)');

    // Yaygın zayıf şifre kontrolü
    const lowerPassword = password.toLowerCase();
    if (COMMON_WEAK_PASSWORDS.includes(lowerPassword) || 
        TURKISH_WEAK_PASSWORDS.includes(lowerPassword)) {
      score = Math.max(0, score - 2);
      feedback.push('Çok yaygın bir şifre, daha özgün bir şifre seçin');
    }

    // Ardışık karakter kontrolü
    if (/123456|abcdef|qwerty|asdfgh/i.test(password)) {
      score = Math.max(0, score - 1);
      feedback.push('Ardışık karakterlerden kaçının');
    }

    // Tekrar eden karakter kontrolü
    if (/(.)\1{2,}/.test(password)) {
      score = Math.max(0, score - 1);
      feedback.push('Çok fazla tekrar eden karakter var');
    }

    // Kişisel bilgi benzeri kontrol (basit)
    if (/admin|user|test|demo|guest/i.test(password)) {
      score = Math.max(0, score - 1);
      feedback.push('Kişisel veya genel terimlerden kaçının');
    }

    // Skor normalizasyonu (0-4 aralığında)
    score = Math.min(4, Math.max(0, score - 2));

    let level: PasswordStrength['level'];
    let label: string;
    let isSecure: boolean;

    switch (score) {
      case 0:
        level = 'very-weak';
        label = 'Çok Zayıf';
        isSecure = false;
        break;
      case 1:
        level = 'weak';
        label = 'Zayıf';
        isSecure = false;
        break;
      case 2:
        level = 'fair';
        label = 'Orta';
        isSecure = false;
        break;
      case 3:
        level = 'good';
        label = 'İyi';
        isSecure = true;
        break;
      case 4:
        level = 'strong';
        label = 'Güçlü';
        isSecure = true;
        break;
      default:
        level = 'very-weak';
        label = 'Çok Zayıf';
        isSecure = false;
    }

    return {
      score,
      level,
      label,
      feedback: feedback.slice(0, 3), // En fazla 3 öneri göster
      isSecure
    };
  }, []);

  const updatePasswordStrength = useCallback((password: string) => {
    const strength = checkPasswordStrength(password);
    setPasswordStrength(strength);
    return strength;
  }, [checkPasswordStrength]);

  return {
    passwordStrength,
    updatePasswordStrength,
    checkPasswordStrength
  };
};