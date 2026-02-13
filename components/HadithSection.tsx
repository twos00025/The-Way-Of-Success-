import React, { useState, useEffect } from 'react';
import SectionHeader from './SectionHeader';
import { Hadith } from '../types';
import { INITIAL_HADITHS } from '../constants';
import { ScrollText, Send } from 'lucide-react';

interface HadithSectionProps {
  onBack?: () => void;
}

const HadithSection: React.FC<HadithSectionProps> = ({ onBack }) => {
  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [newText, setNewText] = useState('');
  const [newNarrator, setNewNarrator] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('app_hadiths');
    if (stored) {
      setHadiths(JSON.parse(stored));
    } else {
      setHadiths(INITIAL_HADITHS);
    }
  }, []);

  const addHadith = () => {
    if (!newText.trim() || !newNarrator.trim()) return;
    const newHadith: Hadith = {
      id: Date.now().toString(),
      text: newText,
      narrator: newNarrator,
      addedAt: Date.now()
    };
    const updated = [newHadith, ...hadiths];
    setHadiths(updated);
    localStorage.setItem('app_hadiths', JSON.stringify(updated));
    setNewText('');
    setNewNarrator('');
  };

  return (
    <div>
      <SectionHeader 
        title="Hadith Collection" 
        subtitle="The wisdom and sayings of the Prophet (PBUH)." 
        onBack={onBack}
      />

      {/* Input Form */}
      <div className="mb-10 p-6 bg-neutral-900/50 border border-amber-900/20 rounded-3xl">
        <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
          <ScrollText size={20} /> Record a Hadith
        </h3>
        <textarea
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Enter the Hadith text..."
          className="w-full bg-black border border-amber-900/30 rounded-xl p-4 text-neutral-200 focus:outline-none focus:border-amber-500 transition-all mb-4 min-h-[100px]"
        />
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            value={newNarrator}
            onChange={(e) => setNewNarrator(e.target.value)}
            placeholder="Source (e.g. Sahih Muslim)"
            className="flex-1 bg-black border border-amber-900/30 rounded-xl px-4 py-3 text-neutral-200 focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={addHadith}
            className="bg-amber-600 hover:bg-amber-500 text-black px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
          >
            <Send size={18} /> Save Hadith
          </button>
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-6">
        {hadiths.map((h) => (
          <div key={h.id} className="p-8 bg-neutral-900 border border-emerald-900/10 rounded-3xl hover:border-amber-500/30 transition-all group">
            <p className="text-xl font-amiri leading-relaxed text-neutral-300 mb-6 border-l-2 border-emerald-500/30 pl-6">
              {h.text}
            </p>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <span className="w-8 h-px bg-amber-500"></span>
                <span className="text-amber-400 font-bold uppercase tracking-widest">{h.narrator}</span>
              </div>
              <span className="text-neutral-600">{new Date(h.addedAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HadithSection;