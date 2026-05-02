'use client';

import { useState } from 'react';
import Image from 'next/image';
import Step1Welcome from '@/components/Step1Welcome';
import Step2BusinessName from '@/components/Step2BusinessName';
import Step3Industry from '@/components/Step3Industry';

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    businessName: '',
    industry: '',
    whatsappNumber: '',
    email: '',
    website: '',
    hasAPI: '',
    openingHours: '',
    services: '',
    faq: '',
    address: '',
    apiKey1: '',
    apiKey2: '',
  });

  const handleStepData = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setCurrentStep(currentStep + 1);
  };

  const goBack = () => {
    setCurrentStep(Math.max(0, currentStep - 1));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/mrbell_glocke_2.png"
              alt="Mr. Bell"
              width={40}
              height={40}
              className="object-contain"
            />
            <span className="text-xl font-playfair font-bold text-anthracite">
              Mr. Bell
            </span>
          </div>
          {currentStep > 0 && (
            <span className="text-sm text-gray-600">
              Onboarding • Schritt {currentStep} von 13
            </span>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>
        {currentStep === 0 && (
          <Step1Welcome onNext={() => setCurrentStep(1)} />
        )}
        
        {currentStep === 1 && (
          <Step2BusinessName
            onNext={(value) => handleStepData('businessName', value)}
            onBack={goBack}
          />
        )}

        {currentStep === 2 && (
          <Step3Industry
            onNext={(value) => handleStepData('industry', value)}
            onBack={goBack}
          />
        )}

        {/* Placeholder for remaining steps */}
        {currentStep > 2 && currentStep < 13 && (
          <div className="max-w-2xl mx-auto px-4 py-12 text-center">
            <h2 className="text-3xl font-playfair font-bold mb-4">
              Step {currentStep + 1} - Coming Soon
            </h2>
            <p className="text-gray-600 mb-8">
              Weitere Steps werden implementiert...
            </p>
            <button onClick={goBack} className="btn-primary">
              ← Zurück
            </button>
          </div>
        )}

        {currentStep === 13 && (
          <div className="max-w-2xl mx-auto px-4 py-12 text-center">
            <div className="mb-8">
              <Image
                src="/mrbell_glocke_2.png"
                alt="Mr. Bell"
                width={120}
                height={120}
                className="mx-auto"
              />
            </div>
            <h2 className="text-4xl font-playfair font-bold text-anthracite mb-4">
              🎉 Fast geschafft!
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Vielen Dank für Ihre Anmeldung!
            </p>
            <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6 mb-8">
              <h3 className="font-bold text-lg mb-2">Was passiert jetzt?</h3>
              <ul className="text-left space-y-2 text-gray-700">
                <li>✅ Wir richten Ihren Bot ein (24-48h)</li>
                <li>✅ Sie erhalten Zugang zum Dashboard</li>
                <li>✅ Ihr Bot geht live!</li>
              </ul>
            </div>
            <pre className="bg-gray-100 p-4 rounded text-left text-sm overflow-auto mb-8">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-600">
          <p className="mb-2">
            © 2026 Mr. Bell • Made in Germany
          </p>
          <p>
            <a href="mailto:support@mrbell.de" className="text-green-600 hover:underline">
              support@mrbell.de
            </a>
            {' • '}
            <a href="https://wa.me/4915142886513" className="text-green-600 hover:underline">
              WhatsApp: +49 151 4288 6513
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
