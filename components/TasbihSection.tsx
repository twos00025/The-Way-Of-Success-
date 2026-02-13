
import React, { useState, useEffect, useCallback } from 'react';
import SectionHeader from './SectionHeader';
import { TasbihLog } from '../types';
import { 
  RotateCcw, 
  Plus, 
  Fingerprint, 
  Settings2, 
  History as HistoryIcon, 
  Check, 
  Trash2, 
  AlertTriangle, 
  X, 
  Save, 
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface TasbihSectionProps {
  onBack?: () => void;
}

interface DhikrHistory {
  label: string;
  goal: number;
}

const PRESETS = [
  { label: 'SubhanAllah', goal: 33 },
  { label: 'Alhamdulillah', goal: 33 },
  { label: 'Allahu Akbar', goal: 34 },
  { label: 'La ilaha illa Allah', goal: 100 },
  { label: 'Astaghfirullah', goal: 100 },
];

const TasbihSection: React.FC<TasbihSectionProps> = ({ onBack }) => {
  const [count, setCount] = useState(0);
  const [goal, setGoal] = useState(33);
  const [label, setLabel] = useState('SubhanAllah');
  const [showSettings, setShowSettings] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [history, setHistory] = useState<DhikrHistory[]>([]);
  const [sessionLogs, setSessionLogs] = useState<TasbihLog[]>([]);
  const [customGoal, setCustomGoal] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [viewLogs, setViewLogs] = useState(false);

  // Load initial state
  useEffect(() => {
    const savedData = localStorage.getItem('app_tasbih_data');
    const savedHistory = localStorage.getItem('app_tasbih_history');
    const savedLogs = localStorage.getItem('app_tasbih_session_logs');

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setCount(parsed.count || 0);
        setGoal(parsed.goal || 33);
        setLabel(parsed.label || 'SubhanAllah');
      } catch (e) {
        console.error("Failed to parse tasbih data", e);
      }
    }

    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        setHistory([]);
      }
    }

    if (savedLogs) {
      try {
        setSessionLogs(JSON.parse(savedLogs));
      } catch (e) {
        setSessionLogs([]);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save state on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('app_tasbih_data', JSON.stringify({ count, goal, label }));
    }
  }, [count, goal, label, isLoaded]);

  const updateHistory = useCallback((newL: string, newG: number) => {
    setHistory(prev => {
      const filtered = prev.filter(h => h.label !== newL || h.goal !== newG);
      const updated = [{ label: newL, goal: newG }, ...filtered].slice(0, 6);
      localStorage.setItem('app_tasbih_history', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleIncrement = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(40);
    }
    setCount(prev => prev + 1);
  };

  const saveSession = () => {
    if (count === 0) return;
    
    const newLog: TasbihLog = {
      id: Date.now().toString(),
      label: label,
      count: count,
      goal: goal,
      timestamp: Date.now()
    };

    const updatedLogs = [newLog, ...sessionLogs].slice(0, 50); // Keep last 50
    setSessionLogs(updatedLogs);
    localStorage.setItem('app_tasbih_session_logs', JSON.stringify(updatedLogs));
    
    // Auto-reset after saving
    setCount(0);
    if ('vibrate' in navigator) navigator.vibrate([50, 30, 50]);
    
    // Update "recently used" history too
    updateHistory(label, goal);
  };

  const deleteLog = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sessionLogs.filter(log => log.id !== id);
    setSessionLogs(updated);
    localStorage.setItem('app_tasbih_session_logs', JSON.stringify(updated));
  };

  const handleResetClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (count === 0) return;
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    setCount(0);
    setShowResetConfirm(false);
    if ('vibrate' in navigator) navigator.vibrate([30, 30]);
  };

  const cancelReset = () => {
    setShowResetConfirm(false);
  };

  const selectDhikr = (p: { label: string; goal: number }) => {
    if (count > 0 && (label !== p.label || goal !== p.goal)) {
      updateHistory(label, goal);
    }
    
    setLabel(p.label);
    setGoal(p.goal);
    setCount(0);
    setShowSettings(false);
  };

  const applyCustomGoal = () => {
    const val = parseInt(customGoal);
    if (val > 0) {
      selectDhikr({ label: 'Custom Dhikr', goal: val });
      setCustomGoal('');
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('app_tasbih_history');
  };

  // Circular progress calculation
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, (count / goal) * 100);
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in h-full flex flex-col relative">
      <SectionHeader 
        title="Digital Tasbih" 
        subtitle="Keep your heart connected through continuous remembrance." 
        onBack={onBack}
      />

      <div className="flex-grow flex flex-col items-center justify-center space-y-10 py-6">
        
        {/* Active Dhikr Display */}
        <div className="text-center space-y-2">
          <h3 className="text-[#D4AF37] font-amiri text-4xl font-bold tracking-wide gold-glow">{label}</h3>
          <div className="flex items-center justify-center gap-2">
            <span className="h-px w-8 bg-emerald-500/30"></span>
            <p className="text-neutral-500 font-black text-[10px] uppercase tracking-[0.4em]">{count} / {goal}</p>
            <span className="h-px w-8 bg-emerald-500/30"></span>
          </div>
        </div>

        {/* Interactive Counter Ring */}
        <div 
          className="relative group cursor-pointer select-none active:scale-95 transition-transform duration-75" 
          onClick={handleIncrement}
        >
          <svg className="w-72 h-72 md:w-80 md:h-80 transform -rotate-90 drop-shadow-[0_0_30px_rgba(16,185,129,0.15)]">
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              className="text-neutral-900/40"
            />
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={circumference}
              style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 0.4s cubic-bezier(0.17, 0.67, 0.83, 0.67)' }}
              className="text-emerald-500"
              strokeLinecap="round"
            />
          </svg>

          {/* Central Button */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 m-12 rounded-full border border-emerald-500/10 backdrop-blur-3xl shadow-inner">
             <span className="text-8xl font-montserrat font-black text-white tracking-tighter">{count}</span>
             <Fingerprint className="text-emerald-500/10 mt-4 animate-pulse" size={40} />
          </div>

          {/* Goal Completion Indicator */}
          {count >= goal && (
            <div className="absolute inset-0 rounded-full animate-ping bg-emerald-500/5 pointer-events-none" />
          )}
        </div>

        {/* Primary Controls */}
        <div className="flex items-center gap-4">
          <button 
            onClick={handleResetClick}
            className={`p-5 rounded-2xl transition-all border ${count > 0 ? 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-red-400 hover:border-red-500/30' : 'bg-neutral-900/20 border-neutral-900 text-neutral-800 cursor-not-allowed'}`}
            title="Reset Counter"
          >
            <RotateCcw size={22} />
          </button>
          
          <button 
            onClick={saveSession}
            disabled={count === 0}
            className={`p-5 rounded-2xl transition-all border flex items-center gap-3 ${count > 0 ? 'bg-emerald-600/10 border-emerald-500/40 text-emerald-400 hover:bg-emerald-600 hover:text-white shadow-lg shadow-emerald-900/10' : 'bg-neutral-900/20 border-neutral-900 text-neutral-800 cursor-not-allowed'}`}
            title="Save Session Log"
          >
            <Save size={22} />
            {count > 0 && <span className="font-bold text-xs uppercase tracking-widest hidden sm:inline">Save</span>}
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); setViewLogs(false); }}
            className={`p-5 rounded-2xl transition-all border ${showSettings ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-900/40' : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-emerald-500/30'}`}
            title="Dhikr Selection"
          >
            <Settings2 size={22} />
          </button>
        </div>

        {/* Settings & Logs Overlay */}
        {showSettings && (
          <div className="w-full bg-neutral-900/95 border border-emerald-500/10 rounded-[2.5rem] p-8 animate-fade-in shadow-2xl backdrop-blur-2xl z-20 max-h-[70vh] flex flex-col">
             
             {/* Tab Toggle */}
             <div className="flex p-1 bg-black/40 rounded-2xl mb-8">
               <button 
                onClick={() => setViewLogs(false)}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!viewLogs ? 'bg-[#D4AF37] text-black shadow-lg' : 'text-neutral-500 hover:text-neutral-300'}`}
               >
                 Selection
               </button>
               <button 
                onClick={() => setViewLogs(true)}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${viewLogs ? 'bg-[#D4AF37] text-black shadow-lg' : 'text-neutral-500 hover:text-neutral-300'}`}
               >
                 History {sessionLogs.length > 0 && <span className="bg-black/20 text-[10px] px-1.5 py-0.5 rounded-full">{sessionLogs.length}</span>}
               </button>
             </div>

             <div className="flex-grow overflow-y-auto no-scrollbar pr-1">
               {!viewLogs ? (
                 <>
                   {/* Standard List */}
                   <div className="mb-8">
                     <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                       <Check size={12} /> Standard Dhikr
                     </h4>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                       {PRESETS.map((p) => (
                         <button
                           key={p.label}
                           onClick={() => selectDhikr(p)}
                           className={`
                             p-4 rounded-xl border text-left transition-all text-sm font-bold
                             ${label === p.label && goal === p.goal ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400' : 'bg-black/40 border-neutral-800/50 text-neutral-400 hover:border-emerald-500/30'}
                           `}
                         >
                           <div className="flex justify-between items-center">
                             <span>{p.label}</span>
                             <span className="text-[10px] opacity-40">{p.goal}</span>
                           </div>
                         </button>
                       ))}
                     </div>
                   </div>

                   {/* Recently Configured Section */}
                   {history.length > 0 && (
                     <div className="mb-8">
                       <div className="flex justify-between items-center mb-4">
                         <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] flex items-center gap-2">
                           <HistoryIcon size={12} /> Recent Sets
                         </h4>
                         <button onClick={clearHistory} className="text-[9px] font-bold text-red-500/50 hover:text-red-500 uppercase tracking-widest transition-colors flex items-center gap-1">
                           <Trash2 size={10} /> Clear
                         </button>
                       </div>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                         {history.map((h, i) => (
                           <button
                             key={`history-${h.label}-${i}`}
                             onClick={() => selectDhikr(h)}
                             className="p-4 rounded-xl border border-neutral-800 bg-black/20 text-neutral-400 hover:border-amber-500/30 text-sm font-bold transition-all flex justify-between items-center group"
                           >
                             <span className="truncate mr-2 group-hover:text-white transition-colors">{h.label}</span>
                             <span className="text-[10px] opacity-30 shrink-0">{h.goal}</span>
                           </button>
                         ))}
                       </div>
                     </div>
                   )}

                   {/* Custom Goal Config */}
                   <div className="pt-4 border-t border-neutral-800/50">
                     <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em] mb-4">Custom Target</h4>
                     <div className="flex gap-2 p-1.5 bg-black/40 border border-neutral-800 rounded-xl">
                       <input 
                          type="number" 
                          placeholder="Enter goal (e.g. 500)" 
                          value={customGoal}
                          onChange={(e) => setCustomGoal(e.target.value)}
                          className="bg-transparent text-white w-full text-sm outline-none font-bold px-3 py-1"
                          onKeyDown={(e) => e.key === 'Enter' && applyCustomGoal()}
                       />
                       <button 
                        onClick={applyCustomGoal}
                        disabled={!customGoal}
                        className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-white p-2 rounded-lg transition-all"
                       >
                         <Plus size={18} />
                       </button>
                     </div>
                   </div>
                 </>
               ) : (
                 <div className="space-y-3 pb-4">
                    {sessionLogs.length > 0 ? (
                      sessionLogs.map((log) => (
                        <div 
                          key={log.id}
                          className="p-5 rounded-2xl border border-neutral-800 bg-black/40 group hover:border-emerald-500/20 transition-all"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-white font-bold text-sm mb-1">{log.label}</p>
                              <div className="flex items-center gap-2 text-[10px] text-neutral-500 uppercase tracking-widest font-black">
                                <Calendar size={10} />
                                {new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                            <button 
                              onClick={(e) => deleteLog(log.id, e)}
                              className="text-neutral-800 hover:text-red-500 p-2 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-4 mt-4">
                            <div className="flex-grow h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-emerald-500" 
                                style={{ width: `${Math.min(100, (log.count / log.goal) * 100)}%` }}
                              />
                            </div>
                            <span className="text-xs font-montserrat font-black text-emerald-500">{log.count}<span className="text-neutral-800 mx-1">/</span>{log.goal}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-20 opacity-20">
                        <HistoryIcon size={48} className="mx-auto mb-4" />
                        <p className="text-sm font-bold uppercase tracking-widest">No sessions saved yet</p>
                      </div>
                    )}
                 </div>
               )}
             </div>

             <button 
               onClick={() => setShowSettings(false)}
               className="mt-6 w-full py-4 border border-neutral-800 rounded-2xl text-neutral-500 hover:text-white hover:bg-white/5 transition-all text-[10px] font-black uppercase tracking-[0.3em]"
             >
               Close Panel
             </button>
          </div>
        )}
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-neutral-900 border border-red-500/30 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <RotateCcw size={120} className="text-red-500" />
            </div>
            
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6">
                <AlertTriangle size={32} />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">Reset Counter?</h3>
              <p className="text-neutral-500 text-sm mb-8">
                Are you sure you want to reset the counter? This action cannot be undone. Consider saving your progress first.
              </p>
              
              <div className="flex gap-4">
                <button 
                  onClick={cancelReset}
                  className="flex-1 px-6 py-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 rounded-2xl font-bold transition-all text-sm border border-neutral-700"
                >
                  No
                </button>
                <button 
                  onClick={confirmReset}
                  className="flex-1 px-6 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-bold transition-all text-sm shadow-lg shadow-red-900/20"
                >
                  Yes, Reset
                </button>
              </div>
            </div>

            <button 
              onClick={cancelReset}
              className="absolute top-4 right-4 text-neutral-600 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <div className="mt-auto text-center py-8 opacity-20">
        <p className="text-[10px] font-amiri tracking-[0.4em] text-neutral-500 uppercase">
          Ya Allah, accept this small remembrance
        </p>
      </div>
    </div>
  );
};

export default TasbihSection;
