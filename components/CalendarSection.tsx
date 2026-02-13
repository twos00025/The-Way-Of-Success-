import React, { useState, useMemo, useEffect } from 'react';
import SectionHeader from './SectionHeader';
import { 
  ChevronLeft, 
  ChevronRight, 
  Moon, 
  Settings2, 
  Globe, 
  Star,
  Zap,
  Calendar as CalendarIcon,
  ArrowRightLeft
} from 'lucide-react';
import { NotificationSettings } from '../types';

// Fixed Hijri Month Names
const HIJRI_MONTHS = [
  "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
  "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Shabaan",
  "Ramadan", "Shawwal", "Dhu al-Qidah", "Dhu al-Hijjah"
];

const CalendarSection: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [referenceDate, setReferenceDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'hijri' | 'gregorian'>('hijri');
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    prayerReminders: true,
    dailyVerse: true,
    lastDailyPrompt: '',
    hijriOffset: -1, 
    hijriCalendarType: 'islamic-civil'
  });

  useEffect(() => {
    const stored = localStorage.getItem('app_notification_settings');
    if (stored) {
      try {
        setSettings(prev => ({ ...prev, ...JSON.parse(stored) }));
      } catch (e) { console.error(e); }
    }
  }, []);

  const formatHijriPart = (date: Date, part: 'day' | 'month' | 'year' | 'full' | 'monthIndex') => {
    try {
      const adjusted = new Date(date.getTime());
      adjusted.setDate(adjusted.getDate() + (settings.hijriOffset || 0));
      const calType = settings.hijriCalendarType === 'islamic-uma-qura' ? 'islamic-umalqura' : 'islamic-civil';

      if (part === 'monthIndex') {
        const monthStr = new Intl.DateTimeFormat(`en-u-ca-${calType}-nu-latn`, { month: 'numeric' }).format(adjusted);
        return (parseInt(monthStr) - 1).toString();
      }
      if (part === 'month') {
        const idx = parseInt(formatHijriPart(date, 'monthIndex'));
        return HIJRI_MONTHS[idx] || "Unknown";
      }
      const options: Intl.DateTimeFormatOptions = 
        part === 'day' ? { day: 'numeric' } :
        part === 'year' ? { year: 'numeric' } :
        { day: 'numeric', year: 'numeric' };
      const formatted = new Intl.DateTimeFormat(`en-u-ca-${calType}-nu-latn`, options).format(adjusted);
      if (part === 'day') return formatted.replace(/[^0-9]/g, '');
      if (part === 'full') {
        return `${formatHijriPart(date, 'day')} ${formatHijriPart(date, 'month')} ${formatHijriPart(date, 'year')}`;
      }
      return formatted;
    } catch (e) { return ""; }
  };

  const getHijriMonthStart = (date: Date) => {
    let current = new Date(date.getTime());
    current.setHours(12, 0, 0, 0);
    let safety = 0;
    while (formatHijriPart(current, 'day') !== "1" && safety < 35) {
      current.setDate(current.getDate() - 1);
      safety++;
    }
    return current;
  };

  const nextMonth = () => {
    const newDate = new Date(referenceDate.getTime());
    if (viewMode === 'gregorian') {
      newDate.setMonth(newDate.getMonth() + 1, 1);
    } else {
      newDate.setDate(newDate.getDate() + 31);
      const start = getHijriMonthStart(newDate);
      newDate.setTime(start.getTime());
    }
    setReferenceDate(newDate);
  };

  const prevMonth = () => {
    const newDate = new Date(referenceDate.getTime());
    if (viewMode === 'gregorian') {
      newDate.setMonth(newDate.getMonth() - 1, 1);
    } else {
      newDate.setTime(getHijriMonthStart(newDate).getTime());
      newDate.setDate(newDate.getDate() - 5);
      newDate.setTime(getHijriMonthStart(newDate).getTime());
    }
    setReferenceDate(newDate);
  };

  const calendarDays = useMemo(() => {
    const days = [];
    if (viewMode === 'gregorian') {
      const year = referenceDate.getFullYear();
      const month = referenceDate.getMonth();
      const firstDay = new Date(year, month, 1).getDay();
      const totalDays = new Date(year, month + 1, 0).getDate();
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      for (let i = firstDay - 1; i >= 0; i--) days.push({ date: new Date(year, month - 1, prevMonthLastDay - i, 12), isCurrentMonth: false });
      for (let i = 1; i <= totalDays; i++) days.push({ date: new Date(year, month, i, 12), isCurrentMonth: true });
    } else {
      const startOfHijri = getHijriMonthStart(referenceDate);
      const firstWeekday = startOfHijri.getDay();
      let monthDaysCount = 29;
      let checkDate = new Date(startOfHijri.getTime());
      checkDate.setDate(checkDate.getDate() + 29);
      if (formatHijriPart(checkDate, 'day') !== "1") monthDaysCount = 30;
      for (let i = firstWeekday - 1; i >= 0; i--) {
        const d = new Date(startOfHijri.getTime());
        d.setDate(d.getDate() - (i + 1));
        days.push({ date: d, isCurrentMonth: false });
      }
      for (let i = 0; i < monthDaysCount; i++) {
        const d = new Date(startOfHijri.getTime());
        d.setDate(d.getDate() + i);
        days.push({ date: d, isCurrentMonth: true });
      }
    }
    const remaining = 42 - days.length;
    const lastDate = days[days.length - 1]?.date || new Date();
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(lastDate.getTime());
      d.setDate(d.getDate() + i);
      days.push({ date: d, isCurrentMonth: false });
    }
    return days;
  }, [referenceDate, viewMode, settings]);

  return (
    <div className="animate-fade-in max-w-5xl mx-auto pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <SectionHeader 
          title={viewMode === 'hijri' ? "Hijri Calendar" : "Gregorian View"} 
          subtitle={viewMode === 'hijri' ? "Navigating the lunar sacred months." : "Standard dates with Hijri synchronization."} 
          onBack={onBack}
        />
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setViewMode(viewMode === 'hijri' ? 'gregorian' : 'hijri')}
            className="glass px-6 py-3 rounded-2xl flex items-center gap-3 border border-emerald-500/20 hover:border-emerald-500/50 transition-all group"
          >
            <ArrowRightLeft size={16} className="text-[#D4AF37]" />
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Toggle View</span>
          </button>
          <button onClick={() => setReferenceDate(new Date())} className="bg-[#D4AF37] text-black px-6 py-3 rounded-2xl font-black text-sm">Today</button>
        </div>
      </div>

      <div className="bg-neutral-900/40 border border-emerald-900/20 rounded-[3rem] overflow-hidden backdrop-blur-3xl shadow-2xl">
        <div className="p-8 flex items-center justify-between border-b border-white/5">
          <div>
            <h3 className="text-3xl font-playfair font-black text-white">
              {viewMode === 'hijri' ? formatHijriPart(referenceDate, 'month') : referenceDate.toLocaleString('default', { month: 'long' })}
              <span className="text-[#D4AF37] ml-3 text-xl">{viewMode === 'hijri' ? formatHijriPart(referenceDate, 'year') : referenceDate.getFullYear()}</span>
            </h3>
            <p className="text-[10px] text-emerald-500/60 uppercase font-black tracking-widest mt-1">
              {viewMode === 'hijri' ? `${referenceDate.toLocaleString('default', { month: 'long' })} ${referenceDate.getFullYear()}` : formatHijriPart(referenceDate, 'full')}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-3 bg-black/40 hover:bg-emerald-500/10 rounded-xl border border-neutral-800"><ChevronLeft /></button>
            <button onClick={nextMonth} className="p-3 bg-black/40 hover:bg-emerald-500/10 rounded-xl border border-neutral-800"><ChevronRight /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-emerald-900/10 bg-black/20">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
            <div key={d} className={`py-4 text-center text-[10px] font-black uppercase tracking-widest ${i === 5 ? 'text-emerald-500' : 'text-neutral-500'}`}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {calendarDays.map((item, idx) => {
            const hDay = formatHijriPart(item.date, 'day');
            const gDay = item.date.getDate().toString();
            const isToday = item.date.toDateString() === new Date().toDateString();
            const isJummah = item.date.getDay() === 5;

            return (
              <div key={idx} className={`relative aspect-square p-4 border-r border-b border-emerald-900/10 group transition-all duration-300 ${!item.isCurrentMonth ? 'opacity-20 grayscale blur-[1px]' : 'hover:bg-emerald-500/[0.03]'} ${isToday ? 'bg-emerald-900/10' : ''}`}>
                
                {/* Highlight English (Gregorian) Date - Made much larger and more visible */}
                <div className="absolute top-4 left-4 flex flex-col items-start leading-none z-10">
                  <span className={`text-[20px] font-black tracking-tighter ${isToday ? 'text-emerald-400' : 'text-neutral-50'}`}>
                    {viewMode === 'hijri' ? gDay : hDay}
                  </span>
                  <span className={`text-[9px] font-black uppercase tracking-widest mt-1.5 ${isToday ? 'text-emerald-500' : 'text-neutral-600'}`}>
                    {viewMode === 'hijri' ? 'Greg' : 'Hijri'}
                  </span>
                </div>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className={`text-5xl md:text-6xl font-montserrat font-black opacity-[0.05] transition-opacity group-hover:opacity-[0.12] ${isToday ? 'text-emerald-500' : 'text-white'}`}>
                    {viewMode === 'hijri' ? hDay : gDay}
                  </span>
                </div>

                {isToday && <div className="absolute bottom-4 right-4 w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_15px_#10b981]" />}
                {isJummah && item.isCurrentMonth && <div className="absolute top-4 right-4 text-[#D4AF37]"><Star size={12} fill="currentColor" /></div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarSection;