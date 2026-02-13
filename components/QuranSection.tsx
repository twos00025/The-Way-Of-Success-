import React, { useState, useEffect } from 'react';
import SectionHeader from './SectionHeader';
import { Verse } from '../types';
import { INITIAL_VERSES } from '../constants';
import { Quote, Send } from 'lucide-react';

interface QuranSectionProps {
  onBack?: () => void;
}

const QuranSection: React.FC<QuranSectionProps> = ({ onBack }) => {
  const [verses, setVerses] = useState<Verse[]>([]);
  const [newText, setNewText] = useState('');
  const [newRef, setNewRef] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('app_verses');
    if (stored) {
      setVerses(JSON.parse(stored));
    } else {
      setVerses(INITIAL_VERSES);
    }
  }, []);

  const addVerse = () => {
    if (!newText.trim() || !newRef.trim()) return;
    const newVerse: Verse = {
      id: Date.now().toString(),
      text: newText,
      reference: newRef,
      addedAt: Date.now()
    };
    const updated = [newVerse, ...verses];
    setVerses(updated);
    localStorage.setItem('app_verses', JSON.stringify(updated));
    setNewText('');
    setNewRef('');
  };

  return (
    <div>
      <SectionHeader 
        title="Quranic Verses" 
        subtitle="The words of Allah for guidance and healing." 
        onBack={onBack}
      />

      {/* Input Form */}
      <div className="mb-10 p-6 bg-neutral-900/50 border border-emerald-900/20 rounded-3xl">
        <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
          <Quote size={20} className="rotate-180" /> Add a Verse
        </h3>
        <textarea
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Enter the Arabic or translation..."
          className="w-full bg-black border border-emerald-900/30 rounded-xl p-4 text-neutral-200 focus:outline-none focus:border-emerald-500 transition-all mb-4 min-h-[100px]"
        />
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            value={newRef}
            onChange={(e) => setNewRef(e.target.value)}
            placeholder="Reference (e.g. Quran 2:255)"
            className="flex-1 bg-black border border-emerald-900/30 rounded-xl px-4 py-3 text-neutral-200 focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={addVerse}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
          >
            <Send size={18} /> Add Verse
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {verses.map((v) => (
          <div key={v.id} className="p-8 bg-neutral-900 border-l-4 border-emerald-500 rounded-r-3xl rounded-bl-3xl relative overflow-hidden group hover:bg-neutral-800 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Quote size={80} />
            </div>
            <p className="text-xl font-amiri leading-relaxed text-neutral-200 mb-6 italic">
              "{v.text}"
            </p>
            <div className="flex justify-between items-center">
              <span className="text-emerald-500 font-bold text-sm uppercase tracking-widest">{v.reference}</span>
              <span className="text-neutral-600 text-xs">{new Date(v.addedAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuranSection;