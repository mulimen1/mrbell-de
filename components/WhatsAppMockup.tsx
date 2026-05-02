'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function WhatsAppMockup() {
  const [currentMessage, setCurrentMessage] = useState(0);

  const messages = [
    { from: 'customer', text: 'Hallo, ich brauche einen Termin', time: '14:23' },
    { from: 'bot', text: 'Gerne! 👋 Wie ist dein vollständiger Name?', time: '14:23' },
    { from: 'customer', text: 'Max Mustermann', time: '14:24' },
    { from: 'bot', text: 'Perfekt Max! 🎉 Wann möchtest du kommen?', time: '14:24' },
    { from: 'customer', text: 'Morgen 14 Uhr', time: '14:25' },
    { from: 'bot', text: '✅ Verstanden!\n\n📋 Zusammenfassung:\n• Max Mustermann\n• 03.05.2026\n• 14:00 Uhr\n\nIch habe deine Anfrage weitergeleitet! 🚀', time: '14:26' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Phone Frame */}
      <div className="relative bg-white rounded-[3rem] shadow-2xl p-4 border-8 border-gray-800">
        {/* Phone Notch */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl"></div>
        
        {/* WhatsApp Header */}
        <div className="bg-green-600 text-white p-4 rounded-t-xl flex items-center gap-3 mt-4">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-2xl">
            🤖
          </div>
          <div>
            <div className="font-semibold">Mr. Bell Bot</div>
            <div className="text-xs opacity-90">online</div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="bg-gray-50 p-4 min-h-[400px] rounded-b-xl space-y-3">
          {messages.slice(0, currentMessage + 1).map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.from === 'customer' ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`max-w-[80%] ${msg.from === 'customer' ? 'bg-white' : 'bg-green-500 text-white'} p-3 rounded-lg shadow`}>
                <div className="text-sm whitespace-pre-line">{msg.text}</div>
                <div className={`text-xs mt-1 ${msg.from === 'customer' ? 'text-gray-500' : 'text-white opacity-70'}`}>
                  {msg.time}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Arrow Animation */}
      <motion.div
        className="absolute -right-20 top-1/2 transform -translate-y-1/2"
        animate={{ x: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <path d="M10 30 L50 30 M40 20 L50 30 L40 40" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </motion.div>
    </div>
  );
}
