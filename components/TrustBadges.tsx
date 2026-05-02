'use client';

import { Lock, CheckCircle, Flag, Zap, Shield, Mail } from 'lucide-react';

export default function TrustBadges() {
  const badges = [
    { icon: Lock, text: 'SSL-Verschlüsselt' },
    { icon: CheckCircle, text: 'DSGVO-konform' },
    { icon: Flag, text: 'Made in Germany' },
    { icon: Zap, text: '24-48h Setup' },
    { icon: Shield, text: '14-Tage Geld-zurück' },
    { icon: Mail, text: 'Premium Support' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 py-6">
      {badges.map((badge, idx) => (
        <div
          key={idx}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition-colors"
        >
          <badge.icon className="w-5 h-5 flex-shrink-0 text-green-600" />
          <span className="font-medium">{badge.text}</span>
        </div>
      ))}
    </div>
  );
}
