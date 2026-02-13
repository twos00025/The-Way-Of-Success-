
import React from 'react';
import { 
  Home, 
  Image as ImageIcon, 
  Book as BookIcon, 
  BookOpen, 
  ScrollText, 
  CheckCircle, 
  PlaySquare,
  Music,
  Fingerprint,
  CalendarDays
} from 'lucide-react';
import { Section } from './types';

export const NAVIGATION_ITEMS = [
  { id: 'home' as Section, label: 'Home', icon: <Home size={20} /> },
  { id: 'calendar' as Section, label: 'Calendar', icon: <CalendarDays size={20} /> },
  { id: 'tasbih' as Section, label: 'Tasbih', icon: <Fingerprint size={20} /> },
  { id: 'wallpapers' as Section, label: 'Wallpapers', icon: <ImageIcon size={20} /> },
  { id: 'books' as Section, label: 'Books', icon: <BookIcon size={20} /> },
  { id: 'nasheed' as Section, label: 'Nasheed', icon: <Music size={20} /> },
  { id: 'quran' as Section, label: 'Quran', icon: <BookOpen size={20} /> },
  { id: 'hadith' as Section, label: 'Hadith', icon: <ScrollText size={20} /> },
  { id: 'tracker' as Section, label: 'Qaza e Umri', icon: <CheckCircle size={20} /> },
  { id: 'reels' as Section, label: 'Reels', icon: <PlaySquare size={20} /> },
];

export const INITIAL_WALLPAPERS = [];

export const INITIAL_VERSES = [
  { id: 'v1', text: 'Indeed, with hardship [will be] ease.', reference: 'Quran 94:6', addedAt: Date.now() },
  { id: 'v2', text: 'So remember Me; I will remember you.', reference: 'Quran 2:152', addedAt: Date.now() },
];

export const INITIAL_HADITHS = [
  { id: 'h1', text: 'The best among you are those who have the best manners and character.', narrator: 'Sahih Bukhari', addedAt: Date.now() },
  { id: 'h2', text: 'Purity is half of faith.', narrator: 'Sahih Muslim', addedAt: Date.now() },
];

export const DEFAULT_PRAYER_TIMES = {
  fajr: "05:15",
  dhuhr: "12:30",
  asr: "15:45",
  maghrib: "18:20",
  isha: "19:45"
};
