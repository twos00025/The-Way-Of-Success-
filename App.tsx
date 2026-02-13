import React, { useState, useEffect } from 'react';
import { NAVIGATION_ITEMS } from './constants';
import { Section } from './types';
import HomeSection from './components/HomeSection';
import WallpapersSection from './components/WallpapersSection';
import BooksSection from './components/BooksSection';
import QuranSection from './components/QuranSection';
import HadithSection from './components/HadithSection';
import TrackerSection from './components/TrackerSection';
import ReelsSection from './components/ReelsSection';
import NasheedSection from './components/NasheedSection';
import TasbihSection from './components/TasbihSection';
import CalendarSection from './components/CalendarSection';
import NotificationManager from './components/NotificationManager';
import Logo from './components/Logo';
import { Menu, X, Settings, Star } from 'lucide-react';

export default function App() {
  const [activeSection, setActiveSection] = useState<Section>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const navigateToHome = () => {
    setActiveSection('home');
    setIsMobileMenuOpen(false);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'home': return <HomeSection onNavigate={setActiveSection} />;
      case 'wallpapers': return <WallpapersSection onBack={navigateToHome} />;
      case 'books': return <BooksSection onBack={navigateToHome} />;
      case 'nasheed': return <NasheedSection onBack={navigateToHome} />;
      case 'quran': return <QuranSection onBack={navigateToHome} />;
      case 'hadith': return <HadithSection onBack={navigateToHome} />;
      case 'tracker': return <TrackerSection onBack={navigateToHome} />;
      case 'reels': return <ReelsSection onBack={navigateToHome} />;
      case 'tasbih': return <TasbihSection onBack={navigateToHome} />;
      case 'calendar': return <CalendarSection onBack={navigateToHome} />;
      case 'settings': return (
        <div className="max-w-2xl mx-auto">
          <div className="mb-10">
            <button 
              onClick={navigateToHome}
              className="text-emerald-500 hover:text-emerald-400 text-sm font-bold mb-4 flex items-center gap-2 transition-all"
            >
              <span className="text-lg">←</span> Back to Home
            </button>
            <h2 className="text-4xl font-montserrat font-bold text-emerald-500 mb-2">Settings</h2>
            <p className="text-neutral-500">Customize your daily spiritual experience.</p>
          </div>
          <NotificationManager />
          <div className="mt-8 p-8 bg-black/60 backdrop-blur-xl rounded-3xl border border-neutral-800/50 islamic-card">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-[#D4AF37]/20 rounded-2xl flex items-center justify-center text-[#D4AF37]">
                <Star size={24} />
              </div>
              <div>
                <h4 className="font-bold text-white text-lg">About The Way of Success</h4>
                <p className="text-sm text-neutral-500 italic">"Verily, in the remembrance of Allah do hearts find rest."</p>
              </div>
            </div>
            <div className="h-px bg-neutral-800/50 my-6"></div>
            <p className="text-sm text-neutral-400 leading-relaxed mb-4">Version 1.2.0 - Optimized for daily growth. All your data, including verses, prayers, and media, is stored safely and locally on your device.</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-emerald-500/50 font-bold uppercase tracking-widest">Built for Ummah</span>
              <span className="text-xs text-neutral-700">© 2024 TWOS Project</span>
            </div>
          </div>
        </div>
      );
      default: return <HomeSection onNavigate={setActiveSection} />;
    }
  };

  return (
    <div className={`min-h-screen text-neutral-200 flex flex-col md:flex-row bg-transparent transition-opacity duration-700 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
      {/* Background Notification Logic Runner */}
      <NotificationManager hideUI />

      {/* Mobile Header */}
      <header className="md:hidden bg-black/90 backdrop-blur-2xl border-b border-emerald-900/30 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <Logo size="sm" className="!p-0 !bg-transparent" onClick={navigateToHome} />
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-emerald-500 p-2 hover:bg-emerald-900/20 rounded-xl transition-all">
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <nav className={`
        fixed inset-0 z-40 bg-black/98 md:bg-black/20 backdrop-blur-3xl md:backdrop-blur-none md:relative md:flex md:w-72 md:flex-col
        transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
        ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-full md:translate-x-0 opacity-100'}
      `}>
        <div className="flex flex-col h-full border-r border-emerald-900/10 p-8 bg-black/40 md:bg-transparent">
          <div className="hidden md:block mb-12">
            <Logo size="md" className="!bg-transparent !p-0 items-start" onClick={navigateToHome} />
          </div>

          <div className="space-y-1.5 flex-grow overflow-y-auto no-scrollbar">
            {NAVIGATION_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`
                  w-full flex items-center space-x-3 px-5 py-3.5 rounded-2xl transition-all group
                  ${activeSection === item.id 
                    ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-500/40 shadow-[0_10px_20px_rgba(16,185,129,0.1)]' 
                    : 'text-neutral-500 hover:bg-white/5 hover:text-neutral-200 hover:translate-x-1'}
                `}
              >
                <span className={`transition-colors duration-300 ${activeSection === item.id ? 'text-emerald-400' : 'text-neutral-600 group-hover:text-emerald-500'}`}>
                  {item.icon}
                </span>
                <span className="font-bold tracking-wide text-sm">{item.label}</span>
              </button>
            ))}
            
            <div className="pt-6 mt-6 border-t border-emerald-900/10">
              <button
                onClick={() => {
                  setActiveSection('settings');
                  setIsMobileMenuOpen(false);
                }}
                className={`
                  w-full flex items-center space-x-3 px-5 py-3.5 rounded-2xl transition-all group
                  ${activeSection === 'settings' 
                    ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-500/40' 
                    : 'text-neutral-500 hover:bg-white/5 hover:text-neutral-200 hover:translate-x-1'}
                `}
              >
                <Settings size={20} className={activeSection === 'settings' ? 'text-emerald-400' : 'text-neutral-600 group-hover:text-emerald-500'} />
                <span className="font-bold tracking-wide text-sm">Settings</span>
              </button>
            </div>
          </div>

          <div className="mt-auto pt-8 border-t border-emerald-900/10 flex flex-col items-center">
            <p className="text-[10px] text-neutral-600 font-black uppercase tracking-[0.4em] opacity-50">As-salamu alaykum</p>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-screen relative no-scrollbar">
        {/* Atmospheric overlays */}
        <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.06),_transparent_45%)]" />
        <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_bottom_left,_rgba(212,175,55,0.04),_transparent_45%)]" />
        
        {/* Animated Container for smooth transitions */}
        <div 
          key={activeSection} 
          className="max-w-6xl mx-auto p-8 md:p-12 lg:p-16 relative z-10 animate-fade-in"
        >
          {renderSection()}
        </div>
      </main>
    </div>
  );
}