'use client';

import { motion } from 'framer-motion';

export default function SheetsMockup() {
  const chats = [
    { time: '14:23', id: 'CONV_001', from: 'Kunde', customer: 'Max M.', message: 'Hallo, ich brauche...', status: '●' },
    { time: '14:23', id: 'CONV_001', from: 'Bot', customer: 'Max M.', message: 'Gerne! 👋 Wie ist...', status: '●' },
    { time: '14:24', id: 'CONV_001', from: 'Kunde', customer: 'Max M.', message: 'Max Mustermann', status: '●' },
    { time: '14:24', id: 'CONV_001', from: 'Bot', customer: 'Max M.', message: 'Perfekt Max! 🎉 Wa...', status: '●' },
    { time: '14:25', id: 'CONV_001', from: 'Kunde', customer: 'Max M.', message: 'Morgen 14 Uhr', status: '●' },
    { time: '14:26', id: 'CONV_001', from: 'Bot', customer: 'Max M.', message: '✅ Verstanden! Ich...', status: '✓' },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200"
      >
        {/* Sheets Header */}
        <div className="bg-green-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
              <path d="M7 12h2v5H7zm4-5h2v10h-2zm4 3h2v7h-2z"/>
            </svg>
            <div>
              <div className="font-semibold">Horror Escape Bremen — Kundenanfragen</div>
              <div className="text-xs opacity-90">Aktualisiert vor wenigen Sekunden</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-50 border-b border-gray-200 flex gap-1 px-4 pt-3">
          <div className="bg-white px-4 py-2 rounded-t-lg font-medium text-sm border-t-2 border-green-500">
            Chat Verlauf
          </div>
          <div className="px-4 py-2 rounded-t-lg font-medium text-sm text-gray-600 hover:bg-white cursor-pointer">
            Übersicht
          </div>
          <div className="px-4 py-2 rounded-t-lg font-medium text-sm text-gray-600 hover:bg-white cursor-pointer">
            Analytics
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b-2 border-gray-300">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Zeit</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Gespräch</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Von</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Kunde</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Nachricht</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {chats.map((chat, idx) => (
                <motion.tr
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="border-b border-gray-200 hover:bg-green-50 transition-colors"
                >
                  <td className="px-4 py-3 text-gray-600">{chat.time}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{chat.id}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      chat.from === 'Bot' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {chat.from}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">{chat.customer}</td>
                  <td className="px-4 py-3 text-gray-600">{chat.message}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={chat.status === '✓' ? 'text-green-500 text-xl' : 'text-gray-400 text-xl'}>
                      {chat.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-green-500">▸</span> Echtzeit-Updates
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-green-500">▸</span> Auf Handy & Desktop
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-green-500">▸</span> Jede Nachricht gespeichert
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-green-500">▸</span> Export als Excel/PDF
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
