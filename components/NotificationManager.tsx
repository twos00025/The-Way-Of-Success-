
import React, { useEffect, useState, useCallback } from 'react';
import { INITIAL_VERSES, INITIAL_HADITHS, DEFAULT_PRAYER_TIMES } from '../constants';
import { NotificationSettings } from '../types';
import { Bell, Info, Clock, Save, Edit3, CheckCircle2, Calendar as CalendarIcon, Globe } from 'lucide-react';

interface NotificationManagerProps {
  hideUI?: boolean;
}

const NotificationManager: React.FC<NotificationManagerProps> = ({ hideUI = false }) => {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    prayerReminders: true,
    dailyVerse: true,
    lastDailyPrompt: '',
    prayerTimes: DEFAULT_PRAYER_TIMES,
    lastNotifiedPrayer: '',
    hijriOffset: -1, // Default for India
    hijriCalendarType: 'islamic-civil' // Civil calendar is more consistent for Indian sightings
  });

  const [isSupported, setIsSupported] = useState(true);
  const [editingPrayer, setEditingPrayer] = useState<string | null>(null);
  const [tempTime, setTempTime] = useState("");

  useEffect(() => {
    setIsSupported('Notification' in window);
    
    const stored = localStorage.getItem('app_notification_settings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings(prev => ({
          ...prev,
          ...parsed,
          prayerTimes: parsed.prayerTimes || DEFAULT_PRAYER_TIMES,
          hijriOffset: parsed.hijriOffset ?? -1,
          hijriCalendarType: parsed.hijriCalendarType || 'islamic-civil'
        }));
      } catch (e) {
        console.error("Failed to parse notification settings", e);
      }
    } else {
      // First time initialization for Indian users
      localStorage.setItem('app_notification_settings', JSON.stringify(settings));
    }
  }, []);

  const saveSettings = (updated: NotificationSettings) => {
    setSettings(updated);
    localStorage.setItem('app_notification_settings', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('app_settings_updated', { detail: updated }));
  };

  const checkReminders = useCallback(() => {
    if (!settings.enabled) return;

    const now = new Date();
    const today = now.toDateString();
    const currentTimeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    if (settings.dailyVerse && settings.lastDailyPrompt !== today) {
      if (now.getHours() >= 8) {
        showDailyNotification();
        saveSettings({ ...settings, lastDailyPrompt: today });
      }
    }

    if (settings.prayerReminders && settings.prayerTimes) {
      (Object.entries(settings.prayerTimes) as [string, string][]).forEach(([prayerName, prayerTime]) => {
        const uniqueId = `${prayerName}_${today}`;
        if (currentTimeStr === prayerTime && settings.lastNotifiedPrayer !== uniqueId) {
          showPrayerNotification(prayerName);
          saveSettings({ ...settings, lastNotifiedPrayer: uniqueId });
        }
      });
    }
  }, [settings]);

  useEffect(() => {
    const interval = setInterval(checkReminders, 30000);
    return () => clearInterval(interval);
  }, [checkReminders]);

  const requestPermission = async () => {
    if (!('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const updated = { ...settings, enabled: true };
      saveSettings(updated);
    }
  };

  const showDailyNotification = () => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const day = new Date().getDate();
    const isVerseDay = day % 2 === 0;
    if (isVerseDay && INITIAL_VERSES.length > 0) {
      const verse = INITIAL_VERSES[day % INITIAL_VERSES.length];
      new Notification("Divine Guidance", { body: `"${verse.text}" - ${verse.reference}` });
    } else if (INITIAL_HADITHS.length > 0) {
      const hadith = INITIAL_HADITHS[day % INITIAL_HADITHS.length];
      new Notification("Prophetic Wisdom", { body: `"${hadith.text}" - ${hadith.narrator}` });
    }
  };

  const showPrayerNotification = (prayerName: string) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    new Notification(`Time for ${prayerName}`, { body: `It is now time for ${prayerName}.` });
  };

  const toggleSetting = (key: keyof NotificationSettings) => {
    saveSettings({ ...settings, [key]: !settings[key] } as NotificationSettings);
  };

  const setHijriOffset = (offset: number) => {
    saveSettings({ ...settings, hijriOffset: offset });
  };

  const setCalendarType = (type: 'islamic-uma-qura' | 'islamic-civil') => {
    saveSettings({ ...settings, hijriCalendarType: type });
  };

  const startEditing = (prayer: string, time: string) => {
    setEditingPrayer(prayer);
    setTempTime(time);
  };

  const saveTimeChange = () => {
    if (editingPrayer && settings.prayerTimes) {
      const updatedTimes = { ...settings.prayerTimes, [editingPrayer]: tempTime };
      saveSettings({ ...settings, prayerTimes: updatedTimes });
      setEditingPrayer(null);
    }
  };

  if (hideUI) return null;

  return (
    <div className="space-y-6 mt-8 animate-fade-in">
      <div className="bg-neutral-900/50 border border-emerald-900/20 rounded-[2.5rem] p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
            <CalendarIcon size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Hijri Correction (India)</h3>
            <p className="text-xs text-neutral-500 uppercase tracking-widest font-black">Adjust for Indian Moon Sighting</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-5 bg-black/40 rounded-2xl border border-emerald-900/10">
            <div className="flex items-center justify-between mb-4">
              <label className="text-xs font-black text-neutral-500 uppercase tracking-[0.2em]">Day Offset</label>
              <div className="flex items-center gap-2 text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-1 rounded">
                <Globe size={10} /> CURRENT: INDIA
              </div>
            </div>
            <div className="flex items-center justify-between gap-2">
              {[-2, -1, 0, 1, 2].map((off) => (
                <button
                  key={off}
                  onClick={() => setHijriOffset(off)}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all text-xs ${
                    settings.hijriOffset === off ? 'bg-emerald-600 text-white' : 'bg-neutral-800 text-neutral-500 hover:text-white'
                  }`}
                >
                  {off > 0 ? `+${off}` : off}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 bg-black/40 rounded-2xl border border-emerald-900/10">
            <label className="text-xs font-black text-neutral-500 uppercase tracking-[0.2em] mb-4 block">Calculation Base</label>
            <div className="flex gap-2">
              <button
                onClick={() => setCalendarType('islamic-uma-qura')}
                className={`flex-1 py-4 rounded-xl font-bold transition-all text-xs ${
                  settings.hijriCalendarType === 'islamic-uma-qura' ? 'bg-[#D4AF37] text-black' : 'bg-neutral-800 text-neutral-500'
                }`}
              >
                Umm al-Qura
              </button>
              <button
                onClick={() => setCalendarType('islamic-civil')}
                className={`flex-1 py-4 rounded-xl font-bold transition-all text-xs ${
                  settings.hijriCalendarType === 'islamic-civil' ? 'bg-[#D4AF37] text-black' : 'bg-neutral-800 text-neutral-500'
                }`}
              >
                Civil (India Default)
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-neutral-900/50 border border-amber-900/20 rounded-[2.5rem] p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
              <Bell size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">Notifications</h3>
          </div>
          {!settings.enabled && (
            <button onClick={requestPermission} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all">Enable</button>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-5 bg-black/40 rounded-2xl border border-neutral-800">
            <span className="font-bold text-sm">Daily Reminders</span>
            <button onClick={() => toggleSetting('dailyVerse')} className={`w-12 h-6 rounded-full relative transition-all ${settings.dailyVerse ? 'bg-emerald-600' : 'bg-neutral-700'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.dailyVerse ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationManager;
