
export interface Wallpaper {
  id: string;
  url: string;
  title: string;
}

export interface Book {
  id: string;
  title: string;
  fileName: string;
  data: string; // Base64 or ObjectURL
}

export interface Verse {
  id: string;
  text: string;
  reference: string;
  addedAt: number;
}

export interface Hadith {
  id: string;
  text: string;
  narrator: string;
  addedAt: number;
}

export interface PrayerState {
  fajr: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
  lastUpdated?: string;
}

export interface QadaState {
  fajr: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
}

export interface UserProfile {
  birthDate: string;
  hasSetup: boolean;
}

export interface Reel {
  id: string;
  url: string;
  title: string;
}

export interface Nasheed {
  id: string;
  title: string;
  fileName: string;
  data: string; // Base64 or ObjectURL
  addedAt: number;
}

export interface TasbihLog {
  id: string;
  label: string;
  count: number;
  goal: number;
  timestamp: number;
}

export interface NotificationSettings {
  enabled: boolean;
  prayerReminders: boolean;
  dailyVerse: boolean;
  lastDailyPrompt: string; // Date string
  prayerTimes?: Record<string, string>; // e.g., { fajr: "05:30", ... }
  lastNotifiedPrayer?: string; // e.g., "fajr_2024-03-20"
  hijriOffset: number; // -2 to +2
  hijriCalendarType: 'islamic-uma-qura' | 'islamic-civil';
}

export type Section = 'home' | 'wallpapers' | 'books' | 'quran' | 'hadith' | 'tracker' | 'reels' | 'settings' | 'nasheed' | 'tasbih' | 'calendar';
