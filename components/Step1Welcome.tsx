'use client';

import { motion } from 'framer-motion';
import WhatsAppMockup from './WhatsAppMockup';
import SheetsMockup from './SheetsMockup';
import TrustBadges from './TrustBadges';
import Image from 'next/image';
import { Star } from 'lucide-react';

interface Step1Props {
  onNext: () => void;
}

export default function Step1Welcome({ onNext }: Step1Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 py-12"
    >
      {/* Logo + Title */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <Image
            src="/mrbell_glocke_2.png"
            alt="Mr. Bell"
            width={80}
            height={80}
            className="object-contain"
          />
        </div>
        <h1 className="text-5xl md:text-6xl font-playfair font-bold text-anthracite mb-4">
          Willkommen bei Mr. Bell
        </h1>
        <p className="text-2xl text-gray-600">
          Ihr WhatsApp-Bot in 5 Minuten
        </p>
      </div>

      {/* Divider */}
      <div className="border-t-2 border-gray-200 mb-12"></div>

      {/* Animation Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-playfair font-bold text-center mb-12">
          So funktioniert's
        </h2>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <WhatsAppMockup />
          <SheetsMockup />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t-2 border-gray-200 mb-12"></div>

      {/* Benefits */}
      <div className="mb-12">
        <h2 className="text-3xl font-playfair font-bold text-center mb-8">
          Ihre Vorteile
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold mb-2">24/7 Verfügbar</h3>
            <p className="text-gray-600">
              Keine Anfrage bleibt unbeantwortet
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">Volle Transparenz</h3>
            <p className="text-gray-600">
              Jeder Chat-Verlauf gespeichert
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold mb-2">Mehr Umsatz</h3>
            <p className="text-gray-600">
              Bis zu 30% mehr Buchungen
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">⏱</div>
            <h3 className="text-xl font-bold mb-2">Zeit sparen</h3>
            <p className="text-gray-600">
              70% weniger manuelle Nachrichten
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t-2 border-gray-200 mb-12"></div>

      {/* Pricing */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 mb-12">
        <div className="text-center">
          <div className="text-5xl font-bold text-anthracite mb-2">
            69€<span className="text-2xl text-gray-600">/Monat</span>
          </div>
          <p className="text-gray-600 mb-6">Monatlich kündbar</p>
          
          <div className="bg-yellow-100 border-2 border-yellow-400 rounded-xl p-4 mb-6 inline-block">
            <p className="text-lg font-bold text-yellow-900 mb-1">
              🎉 SPECIAL OFFER
            </p>
            <p className="text-yellow-800">
              Erste 3 Monate: <span className="font-bold text-2xl">50% Rabatt!</span>
            </p>
            <p className="text-3xl font-bold text-yellow-900 mt-2">
              Nur 34,50€/Monat
            </p>
            <p className="text-sm text-yellow-700">
              (Sie sparen 103,50€)
            </p>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="text-center mb-12">
        <button
          onClick={onNext}
          className="btn-primary text-xl px-12 py-4"
        >
          Jetzt starten — Nur 5 Minuten! →
        </button>
      </div>

      {/* Divider */}
      <div className="border-t-2 border-gray-200 mb-8"></div>

      {/* Trust Badges */}
      <TrustBadges />

      {/* Divider */}
      <div className="border-t-2 border-gray-200 mb-8"></div>

      {/* Testimonials */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-gray-700 mb-4 italic">
            "Spart uns 10 Stunden pro Woche!"
          </p>
          <p className="text-sm text-gray-600">
            — Sarah K., Escape Room Bremen
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-gray-700 mb-4 italic">
            "Setup war unglaublich einfach!"
          </p>
          <p className="text-sm text-gray-600">
            — Mike R., Tattoo Studio Hamburg
          </p>
        </div>
      </div>

      <p className="text-center text-gray-600">
        Bereits <span className="font-bold">50+ Businesses</span> vertrauen Mr. Bell
      </p>
    </motion.div>
  );
}
