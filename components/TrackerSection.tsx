import React, { useState, useEffect, useMemo } from 'react';
import SectionHeader from './SectionHeader';
import { PrayerState, QadaState, UserProfile } from '../types';
import { 
  Check, 
  History, 
  BarChart3, 
  Plus, 
  Minus, 
  TrendingUp, 
  Clock,
  User as UserIcon,
  Save,
  Trash2,
  Trophy,
  Sparkles,
  Calendar,
  Layers
} from 'lucide-react';

interface TrackerSectionProps {
  onBack?: () => void;
}

const TrackerSection: React.FC<TrackerSectionProps> = ({ onBack }) => {
  const [view, setView] = useState<'daily' | 'stats' | 'qada' | 'setup'>('daily');
  const [profile, setProfile] = useState<UserProfile>({ birthDate: '', hasSetup: false });
  const [todayPrayers, setTodayPrayers] = useState<PrayerState>({
    fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false
  });
  const [qada, setQada] = useState<QadaState>({
    fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0
  });

  const now = new Date();
  const todayStr = now.toDateString();

  useEffect(() => {
    // Load profile from storage
    const storedProfile = localStorage.getItem('app_user_profile');
    if (storedProfile) {
      try {
        const parsedProfile = JSON.parse(storedProfile);
        setProfile(parsedProfile);
        if (!parsedProfile.hasSetup) {
          setView('setup');
        }
      } catch (e) { 
        setView('setup'); 
      }
    } else {
      setView('setup');
    }

    const storedDaily = localStorage.getItem(`prayer_daily_${todayStr}`);
    if (storedDaily) setTodayPrayers(JSON.parse(storedDaily));

    const storedQada = localStorage.getItem('app_qada_tracker');
    if (storedQada) setQada(JSON.parse(storedQada));
  }, []);

  const totalOwedInDays = useMemo(() => {
    if (!profile.birthDate) return 0;
    const birth = new Date(profile.birthDate);
    const startAge9 = new Date(birth);
    startAge9.setFullYear(birth.getFullYear() + 9);
    if (now < startAge9) return 0;
    const diffTime = Math.abs(now.getTime() - startAge9.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [profile.birthDate]);

  const stats = useMemo(() => {
    const totalPossibleEach = totalOwedInDays;
    const completedEach = {
      fajr: qada.fajr + (todayPrayers.fajr ? 1 : 0),
      dhuhr: qada.dhuhr + (todayPrayers.dhuhr ? 1 : 0),
      asr: qada.asr + (todayPrayers.asr ? 1 : 0),
      maghrib: qada.maghrib + (todayPrayers.maghrib ? 1 : 0),
      isha: qada.isha + (todayPrayers.isha ? 1 : 0),
    };

    const totalPrayersCompleted = Object.values(completedEach).reduce((a, b) => a + b, 0);
    const totalPrayersOwed = totalOwedInDays * 5;
    const remainingPrayers = Math.max(0, totalPrayersOwed - totalPrayersCompleted);
    
    // Average remaining days (if user prays all 5)
    const remainingDays = Math.ceil(remainingPrayers / 5);
    const remainingYears = Math.floor(remainingDays / 365);
    const remainingMonths = Math.floor((remainingDays % 365) / 30);
    const remainingDaysFinal = remainingDays % 30;

    return { 
      totalPossibleEach, 
      completedEach, 
      totalPrayersOwed, 
      totalPrayersCompleted,
      remainingDays,
      remainingYears,
      remainingMonths,
      remainingDaysFinal
    };
  }, [totalOwedInDays, qada, todayPrayers]);

  const toggleToday = (p: keyof PrayerState) => {
    if (p === 'lastUpdated') return;
    const updated = { ...todayPrayers, [p]: !todayPrayers[p], lastUpdated: todayStr };
    setTodayPrayers(updated);
    localStorage.setItem(`prayer_daily_${todayStr}`, JSON.stringify(updated));
    localStorage.setItem('app_prayer_tracker', JSON.stringify(updated));
  };

  const updateQada = (p: keyof QadaState, amount: number) => {
    setQada(prev => {
      const newVal = Math.max(0, prev[p] + amount);
      const updated = { ...prev, [p]: newVal };
      localStorage.setItem('app_qada_tracker', JSON.stringify(updated));
      return updated;
    });
  };

  const logBulkQada = (days: number) => {
    setQada(prev => {
      const updated = {
        fajr: prev.fajr + days,
        dhuhr: prev.dhuhr + days,
        asr: prev.asr + days,
        maghrib: prev.maghrib + days,
        isha: prev.isha + days,
      };
      localStorage.setItem('app_qada_tracker', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    const newProfile = { ...profile, birthDate: newDate };
    setProfile(newProfile);
    // Persist immediately to local storage
    localStorage.setItem('app_user_profile', JSON.stringify(newProfile));
  };

  const saveProfile = () => {
    if (!profile.birthDate) return;
    const newProfile = { ...profile, hasSetup: true };
    setProfile(newProfile);
    localStorage.setItem('app_user_profile', JSON.stringify(newProfile));
    setView('daily');
  };

  const resetProfile = () => {
    if (confirm("Reset Individual Profile? This will clear all calculations but keep your Qada log numbers.")) {
      const newProfile = { birthDate: '', hasSetup: false };
      setProfile(newProfile);
      localStorage.setItem('app_user_profile', JSON.stringify(newProfile));
      setView('setup');
    }
  };

  if (view === 'setup') {
    return (
      <div className="max-w-xl mx-auto animate-fade-in py-10">
        <div className="bg-neutral-900/50 border border-emerald-900/30 rounded-[3rem] p-12 text-center backdrop-blur-xl">
          <div className="w-24 h-24 bg-[#D4AF37]/10 rounded-[2rem] flex items-center justify-center text-[#D4AF37] mx-auto mb-10 border border-[#D4AF37]/20">
            <UserIcon size={48} />
          </div>
          <h2 className="text-4xl font-playfair font-black text-white mb-6">Start Your Path</h2>
          <p className="text-neutral-400 mb-10 leading-relaxed font-amiri text-xl">
            To calculate your life-long journey of prayer, please share your date of birth. 
            We begin tracking from age 9 (Bulugh).
          </p>
          <div className="space-y-8">
            <div className="text-left">
              <label className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em] mb-3 block">Date of Birth</label>
              <input 
                type="date" 
                value={profile.birthDate}
                className="w-full bg-black/60 border border-emerald-900/50 rounded-2xl p-5 text-white focus:outline-none focus:border-emerald-500 transition-all font-bold"
                onChange={handleDateChange}
              />
            </div>
            <button 
              onClick={saveProfile}
              disabled={!profile.birthDate}
              className={`w-full flex items-center justify-center gap-3 font-black py-5 rounded-2xl transition-all shadow-2xl ${
                profile.birthDate 
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40 transform hover:-translate-y-1' 
                  : 'bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-50'
              }`}
            >
              <Save size={20} />
              Set My Journey
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <SectionHeader 
        title="Qaza e Umri" 
        subtitle={`Guidance through ${totalOwedInDays} days of spiritual accountability.`} 
        onBack={onBack}
      />

      {/* Tabs */}
      <div className="flex bg-neutral-900/40 p-2 rounded-3xl border border-emerald-900/10 mb-12 backdrop-blur-xl max-w-2xl mx-auto md:mx-0">
        {[
          { id: 'daily', label: 'Today', icon: <Clock size={18} /> },
          { id: 'qada', label: 'Recovery', icon: <History size={18} /> },
          { id: 'stats', label: 'Journey Stats', icon: <BarChart3 size={18} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id as any)}
            className={`
              flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all text-sm
              ${view === tab.id ? 'bg-[#D4AF37] text-black shadow-lg shadow-amber-900/20' : 'text-neutral-500 hover:text-neutral-200'}
            `}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Daily View */}
      {view === 'daily' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-neutral-900/40 border border-emerald-500/10 rounded-[2.5rem] p-10 relative overflow-hidden backdrop-blur-md">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-2xl font-playfair font-bold text-white mb-1">Today's Salah</h3>
                  <p className="text-xs font-black text-emerald-500 uppercase tracking-widest">{todayStr}</p>
                </div>
                <div className="flex flex-col items-end">
                   <span className="text-4xl font-montserrat font-black text-[#D4AF37]">
                     {Object.values(todayPrayers).filter(v => v === true).length}<span className="text-neutral-800 text-3xl mx-1">/</span>5
                   </span>
                </div>
              </div>
              
              <div className="space-y-4">
                {(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => toggleToday(p)}
                    className={`
                      w-full flex items-center justify-between p-6 rounded-3xl transition-all border group
                      ${todayPrayers[p] 
                        ? 'bg-emerald-950/20 border-emerald-500/50' 
                        : 'bg-black/40 border-neutral-800 hover:border-[#D4AF37]/40'}
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xs uppercase tracking-tighter transition-all ${todayPrayers[p] ? 'bg-emerald-500 text-white' : 'bg-neutral-900 text-neutral-500 group-hover:bg-[#D4AF37]/20 group-hover:text-[#D4AF37]'}`}>
                        {p.substring(0, 1)}
                      </div>
                      <span className="capitalize font-black tracking-[0.2em] text-sm text-neutral-300 group-hover:text-white transition-colors">{p}</span>
                    </div>
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center transition-all border-2
                      ${todayPrayers[p] ? 'bg-emerald-500 border-emerald-400 text-white rotate-0' : 'bg-transparent border-neutral-800 text-transparent -rotate-90'}
                    `}>
                      <Check size={20} strokeWidth={4} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-5 space-y-6">
             <div className="bg-gradient-to-br from-emerald-950/20 to-black border border-emerald-500/20 rounded-[2.5rem] p-10">
                <h4 className="font-playfair font-bold text-white text-xl mb-6 flex items-center gap-3">
                  <TrendingUp size={22} className="text-emerald-500" /> Progression
                </h4>
                <div className="space-y-8">
                  <div>
                    <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-3">
                      <span className="text-neutral-500">Weekly Purity</span>
                      <span className="text-emerald-500">Excellent</span>
                    </div>
                    <div className="h-3 w-full bg-neutral-900 rounded-full p-0.5">
                      <div className="h-full bg-emerald-500 w-[82%] rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-3">
                      <span className="text-neutral-500">Focus Score</span>
                      <span className="text-amber-500">Rising</span>
                    </div>
                    <div className="h-3 w-full bg-neutral-900 rounded-full p-0.5">
                      <div className="h-full bg-amber-500 w-[65%] rounded-full shadow-[0_0_15px_rgba(245,158,11,0.3)]" />
                    </div>
                  </div>
                </div>
             </div>

             <div className="bg-neutral-900/60 border border-neutral-800 rounded-[2.5rem] p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                   <Sparkles size={100} className="text-[#D4AF37]" />
                </div>
                <h4 className="font-playfair font-bold text-neutral-400 mb-4 italic">Daily Reminder</h4>
                <p className="text-lg text-neutral-300 font-amiri leading-relaxed italic border-l-2 border-[#D4AF37] pl-6">
                  "Maintain with care the prayers and particularly the middle prayer and stand before Allah, devoutly obedient."
                </p>
             </div>
          </div>
        </div>
      )}

      {/* Qada View */}
      {view === 'qada' && (
        <div className="space-y-8">
          <div className="bg-neutral-900/40 border border-amber-900/20 rounded-[3rem] p-12 backdrop-blur-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-16">
              <div className="max-w-md">
                <h3 className="text-3xl font-playfair font-bold text-white mb-4">Obligation Recovery</h3>
                <p className="text-neutral-500 font-amiri text-lg italic">"Verily, the prayer is a prescription at fixed times." — Reclaim your missed prayers.</p>
              </div>
              <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 px-10 py-8 rounded-[2rem] text-center min-w-[200px]">
                <p className="text-[10px] text-[#D4AF37] uppercase font-black tracking-[0.3em] mb-3">Total Prayers Owed</p>
                <p className="text-5xl font-montserrat font-black text-white">
                  {Math.max(0, (totalOwedInDays * 5) - (Object.values(qada) as number[]).reduce((a, b) => a + b, 0))}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const).map(p => (
                <div key={p} className="bg-black/60 border border-neutral-800 rounded-3xl p-8 text-center group hover:border-[#D4AF37]/40 transition-all">
                  <h4 className="capitalize font-black text-neutral-500 mb-6 text-xs tracking-widest">{p}</h4>
                  <div className="text-4xl font-montserrat font-black text-white mb-8 group-hover:text-[#D4AF37] transition-colors">
                    {qada[p]}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => updateQada(p, -1)} className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-500 p-3 rounded-2xl transition-all"><Minus size={18} className="mx-auto"/></button>
                    <button onClick={() => updateQada(p, 1)} className="flex-1 bg-emerald-600/10 hover:bg-emerald-600/30 text-emerald-500 p-3 rounded-2xl transition-all border border-emerald-500/10"><Plus size={18} className="mx-auto"/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Yearly & Monthly Bulk Logging */}
          <div className="bg-neutral-900/20 border border-neutral-800/50 rounded-[2.5rem] p-10">
            <h4 className="text-lg font-playfair font-bold text-white mb-8 flex items-center gap-3">
              <Layers size={22} className="text-[#D4AF37]" /> Bulk Recovery Actions
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button 
                onClick={() => logBulkQada(1)}
                className="group bg-neutral-900/40 hover:bg-neutral-800 border border-neutral-800 rounded-2xl p-6 text-center transition-all hover:border-[#D4AF37]/30"
              >
                <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center text-[#D4AF37] mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Calendar size={20} />
                </div>
                <h5 className="font-black text-xs uppercase tracking-widest text-neutral-300">Complete 1 Day</h5>
                <p className="text-[10px] text-neutral-500 mt-1">+5 Prayers total</p>
              </button>

              <button 
                onClick={() => logBulkQada(30)}
                className="group bg-neutral-900/40 hover:bg-neutral-800 border border-neutral-800 rounded-2xl p-6 text-center transition-all hover:border-emerald-500/30"
              >
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Calendar size={20} />
                </div>
                <h5 className="font-black text-xs uppercase tracking-widest text-neutral-300">Complete 1 Month</h5>
                <p className="text-[10px] text-neutral-500 mt-1">+150 Prayers total</p>
              </button>

              <button 
                onClick={() => logBulkQada(365)}
                className="group bg-neutral-900/40 hover:bg-neutral-800 border border-neutral-800 rounded-2xl p-6 text-center transition-all hover:border-amber-500/30"
              >
                <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Layers size={20} />
                </div>
                <h5 className="font-black text-xs uppercase tracking-widest text-neutral-300">Complete 1 Year</h5>
                <p className="text-[10px] text-neutral-500 mt-1">+1825 Prayers total</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats View */}
      {view === 'stats' && (
        <div className="space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              {/* Debt Breakdown Card */}
              <div className="bg-neutral-900/40 border border-[#D4AF37]/10 rounded-[2.5rem] p-10 backdrop-blur-md">
                 <h3 className="text-2xl font-playfair font-bold text-white mb-8">Remaining Obligation</h3>
                 <div className="grid grid-cols-3 gap-6">
                    <div className="bg-black/40 border border-neutral-800 rounded-3xl p-6 text-center">
                       <p className="text-4xl font-montserrat font-black text-white">{stats.remainingYears}</p>
                       <p className="text-[10px] text-neutral-500 uppercase font-black tracking-widest mt-2">Years</p>
                    </div>
                    <div className="bg-black/40 border border-neutral-800 rounded-3xl p-6 text-center">
                       <p className="text-4xl font-montserrat font-black text-white">{stats.remainingMonths}</p>
                       <p className="text-[10px] text-neutral-500 uppercase font-black tracking-widest mt-2">Months</p>
                    </div>
                    <div className="bg-black/40 border border-neutral-800 rounded-3xl p-6 text-center">
                       <p className="text-4xl font-montserrat font-black text-white">{stats.remainingDaysFinal}</p>
                       <p className="text-[10px] text-neutral-500 uppercase font-black tracking-widest mt-2">Days</p>
                    </div>
                 </div>
                 <div className="mt-8 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 text-center">
                    <p className="text-xs text-emerald-400 font-amiri italic tracking-wide">
                      This represents your estimated total spiritual debt from age 9 to today.
                    </p>
                 </div>
              </div>

              {/* Individual Prayer Progress */}
              <div className="bg-neutral-900/40 border border-emerald-900/10 rounded-[2.5rem] p-12 backdrop-blur-md">
                <h3 className="text-2xl font-playfair font-bold text-white mb-10">Lifetime Progress Overview</h3>
                <div className="space-y-10">
                  {(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const).map(p => {
                    const percent = Math.min(100, (stats.completedEach[p] / stats.totalPossibleEach) * 100) || 0;
                    return (
                      <div key={p}>
                        <div className="flex justify-between items-end mb-4">
                          <span className="capitalize font-black text-neutral-400 text-xs tracking-widest">{p}</span>
                          <div className="text-right">
                            <span className="text-lg text-emerald-500 font-black">{stats.completedEach[p]}</span>
                            <span className="text-xs text-neutral-600 ml-2">/ {stats.totalPossibleEach} Days</span>
                          </div>
                        </div>
                        <div className="h-4 w-full bg-neutral-950 rounded-full overflow-hidden border border-neutral-900">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-700 to-emerald-400 transition-all duration-1000 relative" 
                            style={{ width: `${percent}%` }}
                          >
                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-8">
              <div className="flex-1 bg-gradient-to-br from-neutral-900 to-black border border-emerald-500/10 rounded-[2.5rem] p-10 flex flex-col justify-center text-center">
                <Trophy className="mx-auto text-[#D4AF37] mb-6" size={48} strokeWidth={1} />
                <p className="text-[10px] text-neutral-500 uppercase tracking-[0.4em] font-black mb-4">Lifetime Fidelity</p>
                <p className="text-6xl font-montserrat font-black text-white mb-6">
                  {(( stats.totalPrayersCompleted / stats.totalPrayersOwed) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-[#D4AF37] italic font-amiri tracking-wider leading-relaxed px-4">
                  "The most beloved of deeds to Allah are those that are most consistent, even if they are small."
                </p>
              </div>
              
              <div className="bg-neutral-900/60 border border-neutral-800 rounded-[2.5rem] p-10">
                 <div className="flex items-center justify-between mb-8">
                   <h4 className="font-bold text-white text-sm uppercase tracking-widest">My Journey Origin</h4>
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                 </div>
                 <div className="space-y-4 mb-10">
                   <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                     <span className="text-neutral-500">Born</span>
                     <span className="text-neutral-200">{profile.birthDate}</span>
                   </div>
                   <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                     <span className="text-neutral-500">Owed Days</span>
                     <span className="text-[#D4AF37]">{totalOwedInDays}</span>
                   </div>
                 </div>
                 <button onClick={resetProfile} className="w-full flex items-center justify-center gap-2 bg-red-500/5 hover:bg-red-500/10 text-red-500/70 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-red-500/10">
                   <Trash2 size={14} /> Adjust Birth Date
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackerSection;