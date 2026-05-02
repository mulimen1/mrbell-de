'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import ProgressBar from './ProgressBar';

interface Step2Props {
  onNext: (data: string) => void;
  onBack: () => void;
}

export default function Step2BusinessName({ onNext, onBack }: Step2Props) {
  const [businessName, setBusinessName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (businessName.trim()) {
      onNext(businessName);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="max-w-2xl mx-auto px-4 py-12"
    >
      <ProgressBar currentStep={1} totalSteps={13} />

      <h2 className="text-4xl font-playfair font-bold text-anthracite mb-4">
        Wie heißt Ihr Business?
      </h2>
      <p className="text-gray-600 mb-8">
        Der Name wird in automatischen Antworten verwendet
      </p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="z.B. Horror Escape Bremen"
          className="input-field mb-6"
          autoFocus
          required
        />

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
            disabled={!businessName.trim()}
          >
            Weiter →
          </button>
        </div>
      </form>
    </motion.div>
  );
}
