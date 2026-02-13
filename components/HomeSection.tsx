import React, { useState, useEffect } from 'react';
import { Section, Verse, Hadith, PrayerState } from '../types';
import { NAVIGATION_ITEMS, INITIAL_VERSES, INITIAL_HADITHS } from '../constants';
import { Clock, Quote, BookOpen, Sparkles, Fingerprint, ChevronRight } from 'lucide-react';

interface HomeSectionProps {
  onNavigate: (section: Section) => void;
}

const HomeSection: React.FC<HomeSectionProps> = ({ onNavigate }) => {
  const [dailyVerse, setDailyVerse] = useState<Verse | null>(INITIAL_VERSES[0] || null);
  const [dailyHadith, setDailyHadith] = useState<Hadith | null>(INITIAL_HADITHS[0] || null);
  const [prayerProgress, setPrayerProgress] = useState(0);
  const [tasbihCount, setTasbihCount] = useState(0);

  useEffect(() => {
    const day = new Date().getDate();
    if (INITIAL_VERSES.length > 0) {
      setDailyVerse(INITIAL_VERSES[day % INITIAL_VERSES.length]);
    }
    if (INITIAL_HADITHS.length > 0) {
      setDailyHadith(INITIAL_HADITHS[day % INITIAL_HADITHS.length]);
    }

    const storedTracker = localStorage.getItem('app_prayer_tracker');
    if (storedTracker) {
      try {
        const data: PrayerState = JSON.parse(storedTracker);
        if (data.lastUpdated === new Date().toDateString()) {
          const count = [data.fajr, data.dhuhr, data.asr, data.maghrib, data.isha].filter(Boolean).length;
          setPrayerProgress(count);
        }
      } catch (e) {
        console.error("Failed to parse tracker data", e);
      }
    }

    const savedTasbih = localStorage.getItem('app_tasbih_data');
    if (savedTasbih) {
      setTasbihCount(JSON.parse(savedTasbih).count || 0);
    }
  }, []);

  return (
    <div className="space-y-16 pb-24">
      {/* Hero Section */}
      <section className="relative h-[500px] md:h-[600px] rounded-[3rem] overflow-hidden border border-emerald-900/20 group bg-black shadow-2xl animate-scale-in">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center brightness-[0.25] transition-transform duration-[2000ms] group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-center items-center text-center px-8">
          <div className="max-w-4xl space-y-8">
            <div className="flex flex-col items-center">
              <span className="text-[#D4AF37] font-amiri text-3xl mb-3 select-none animate-pulse no-select">﷽</span>
              <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mb-6" />
              <h1 className="text-5xl md:text-7xl font-playfair font-black text-white leading-tight gold-glow tracking-tighter">
                The Way Of <span className="text-[#D4AF37]">Success</span>
              </h1>
              <p className="text-[10px] md:text-xs text-emerald-400 font-black uppercase tracking-[0.6em] mt-6 opacity-70">
                I Am Nothing But An Islamic Servant
              </p>
            </div>
            
            <p className="text-base md:text-xl text-neutral-300 font-amiri italic max-w-2xl mx-auto leading-relaxed border-x border-emerald-500/10 px-10">
              "Verily, with every hardship comes ease. Strengthen your Iman daily through the light of truth."
            </p>

            <div className="flex flex-wrap justify-center gap-5 pt-8">
              <button 
                onClick={() => onNavigate('quran')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4 rounded-2xl font-black transition-all transform hover:-translate-y-1 shadow-2xl shadow-emerald-950/60 flex items-center gap-3 border border-emerald-400/20 text-xs uppercase tracking-widest"
              >
                Holy Quran <BookOpen size={18} />
              </button>
              <button 
                onClick={() => onNavigate('tasbih')}
                className="bg-white/5 hover:bg-white/10 backdrop-blur-2xl text-[#D4AF37] border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 px-10 py-4 rounded-2xl font-black transition-all flex items-center gap-3 text-xs uppercase tracking-widest"
              >
                Digital Tasbih <Fingerprint size={18} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Decorative corner element */}
        <div className="absolute bottom-12 right-12 text-[#D4AF37] opacity-10 pointer-events-none transition-transform duration-1000 group-hover:rotate-12">
           <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M0 100V80C0 35.8172 35.8172 0 80 0H100V20C100 64.1828 64.1828 100 20 100H0Z" fill="currentColor"/>
           </svg>
        </div>
      </section>

      {/* Daily Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Verse Card */}
        <div className="group bg-neutral-900/40 backdrop-blur-xl border border-emerald-500/10 rounded-[2.5rem] p-10 relative overflow-hidden transition-all duration-500 hover:border-emerald-500/30 islamic-card">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] -rotate-12 group-hover:rotate-0 transition-all duration-1000">
            <BookOpen size={140} className="text-emerald-500" />
          </div>
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-3 text-emerald-500 mb-8">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Sparkles size={16} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Divine Guidance</span>
            </div>
            {dailyVerse ? (
              <div className="space-y-8 flex-grow">
                <p className="text-2xl md:text-3xl font-amiri text-white leading-relaxed italic">
                  "{dailyVerse.text}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="h-[1.5px] w-12 bg-emerald-500/40" />
                  <p className="text-[#D4AF37] font-black tracking-[0.2em] text-[10px] uppercase">— {dailyVerse.reference}</p>
                </div>
              </div>
            ) : (
              <p className="text-neutral-500 font-amiri text-xl italic">Knowledge is seeking you...</p>
            )}
          </div>
        </div>

        {/* Hadith Card */}
        <div className="group bg-neutral-900/40 backdrop-blur-xl border border-amber-500/10 rounded-[2.5rem] p-10 relative overflow-hidden transition-all duration-500 hover:border-amber-500/30 islamic-card">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12 group-hover:rotate-0 transition-all duration-1000">
            <Quote size={140} className="text-amber-500" />
          </div>
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-3 text-amber-500 mb-8">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Quote size={16} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Prophetic Wisdom</span>
            </div>
            {dailyHadith ? (
              <div className="space-y-8 flex-grow">
                <p className="text-xl md:text-2xl font-amiri text-neutral-200 leading-relaxed italic">
                  "{dailyHadith.text}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="h-[1.5px] w-12 bg-amber-500/40" />
                  <p className="text-emerald-500 font-black tracking-[0.2em] text-[10px] uppercase">— {dailyHadith.narrator}</p>
                </div>
              </div>
            ) : (
              <p className="text-neutral-500 font-amiri text-xl italic">Seeking the Sunnah...</p>
            )}
          </div>
        </div>
      </div>

      {/* Progress & Quick Links Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Quick Links */}
        <div className="md:col-span-8 grid grid-cols-2 lg:grid-cols-4 gap-5">
          {NAVIGATION_ITEMS.filter(item => !['home', 'tracker'].includes(item.id)).map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="group p-8 bg-neutral-900/30 border border-neutral-800/40 rounded-[2rem] text-center hover:border-emerald-500/40 hover:bg-emerald-950/10 transition-all relative overflow-hidden islamic-card"
            >
              <div className="text-emerald-500 mb-5 flex justify-center group-hover:scale-110 transition-all duration-500">
                {React.cloneElement(item.icon as React.ReactElement, { size: 32, strokeWidth: 1.5 })}
              </div>
              <h3 className="font-black text-neutral-400 text-[10px] uppercase tracking-[0.3em] group-hover:text-white transition-colors">{item.label}</h3>
              <div className="mt-4 h-[1.5px] w-0 bg-emerald-500 mx-auto group-hover:w-1/3 transition-all duration-700 rounded-full" />
            </button>
          ))}
        </div>

        {/* Dashboard Progress */}
        <div className="md:col-span-4 space-y-6">
          <button 
            onClick={() => onNavigate('tracker')}
            className="w-full bg-gradient-to-br from-neutral-900 to-black border border-emerald-500/10 rounded-[2.5rem] p-10 flex flex-col justify-between hover:border-emerald-500/30 transition-all group shadow-2xl islamic-card"
          >
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-2xl font-playfair font-bold text-white mb-2 text-left italic">Salah Progress</h3>
                <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-widest text-left">Daily Obligation</p>
              </div>
              <Clock className="text-emerald-500/20 group-hover:rotate-45 transition-transform duration-700" size={36} />
            </div>
            
            <div className="space-y-8">
              <div className="flex justify-between items-end">
                <div className="flex flex-col text-left">
                  <span className="text-5xl font-montserrat font-black text-white tracking-tighter">
                    {prayerProgress}<span className="text-neutral-800 text-3xl mx-1 font-light">/</span>5
                  </span>
                </div>
                <div className="text-right pb-1">
                  <div className="text-2xl font-playfair italic text-[#D4AF37] gold-glow">
                    {Math.round((prayerProgress / 5) * 100)}%
                  </div>
                </div>
              </div>
              
              <div className="h-2 w-full bg-neutral-900 rounded-full overflow-hidden p-0.5 border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-[#D4AF37] rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(16,185,129,0.25)]" 
                  style={{ width: `${(prayerProgress / 5) * 100}%` }}
                />
              </div>
            </div>
          </button>

          <button 
            onClick={() => onNavigate('tasbih')}
            className="w-full bg-black/40 border border-emerald-900/10 rounded-[2rem] p-8 flex items-center justify-between hover:border-emerald-500/40 transition-all group islamic-card"
          >
             <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-emerald-500/5 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-all duration-700 border border-emerald-500/10">
                  <Fingerprint size={28} />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-white text-base">Current Tasbih</h4>
                  <p className="text-[9px] text-neutral-600 uppercase tracking-[0.4em] font-black mt-1">Dhkr Ongoing</p>
                </div>
             </div>
             <div className="flex items-center gap-2">
                <span className="text-3xl font-montserrat font-black text-[#D4AF37] gold-glow">{tasbihCount}</span>
                <ChevronRight size={18} className="text-neutral-800 group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all" />
             </div>
          </button>
        </div>
      </div>

      {/* Decorative Footer Divider */}
      <div className="flex flex-col items-center pt-20">
        <div className="flex items-center gap-6 w-full max-w-md mb-8">
          <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
          <div className="text-[#D4AF37] opacity-10 no-select">
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 0L24 16L40 20L24 24L20 40L16 24L0 20L16 16L20 0Z" fill="currentColor"/>
            </svg>
          </div>
          <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
        </div>
        <p className="text-neutral-700 text-[10px] font-amiri tracking-[0.5em] uppercase opacity-40 italic">
          Ya Allah, Grant us the Path of Success
        </p>
      </div>
    </div>
  );
};

export default HomeSection;