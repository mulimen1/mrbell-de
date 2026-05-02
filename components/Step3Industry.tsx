'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import ProgressBar from './ProgressBar';

interface Step3Props {
  onNext: (data: string) => void;
  onBack: () => void;
}

export default function Step3Industry({ onNext, onBack }: Step3Props) {
  const [industry, setIndustry] = useState('');

  const industries = [
    'Escape Room',
    'Tattoo Studio',
    'Friseur/Salon',
    'Fotostudio',
    'Massage/Wellness',
    'Personal Trainer',
    'Autowerkstatt',
    'Handwerker',
    'Restaurant/Café',
    'Boutique/Einzelhandel',
    'Fitness Studio',
    'Andere',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (industry) {
      onNext(industry);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="max-w-2xl mx-auto px-4 py-12"
    >
      <ProgressBar currentStep={2} totalSteps={13} />

      <h2 className="text-4xl font-playfair font-bold text-anthracite mb-4">
        In welcher Branche sind Sie tätig?
      </h2>

      <form onSubmit={handleSubmit}>
        <select
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="dropdown mb-6"
          required
        >
          <option value="">Bitte wählen Sie...</option>
          {industries.map((ind) => (
            <option key={ind} value={ind}>
              {ind}
            </option>
          ))}
        </select>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            ← Zurück
          </button>
          <button
            type="submit"
            className="btn-primary flex-1"
            disabled={!industry}
          >
            Weiter →
          </button>
        </div>
      </form>
    </motion.div>
  );
}
