
import React, { useState, useEffect, useRef } from 'react';
import SectionHeader from './SectionHeader';
import { Nasheed } from '../types';
import { 
  Music, 
  Upload, 
  Download, 
  Trash2, 
  Play, 
  Pause, 
  Volume2, 
  X, 
  ChevronRight, 
  ChevronLeft,
  SkipForward,
  SkipBack,
  Disc,
  Clock
} from 'lucide-react';

interface NasheedSectionProps {
  onBack?: () => void;
}

const NasheedSection: React.FC<NasheedSectionProps> = ({ onBack }) => {
  const [nasheeds, setNasheeds] = useState<Nasheed[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('app_nasheeds');
    if (stored) {
      try {
        setNasheeds(JSON.parse(stored));
      } catch (e) {
        setNasheeds([]);
      }
    }
  }, []);

  const currentNasheed = nasheeds.find(n => n.id === playingId);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newNasheed: Nasheed = {
          id: Date.now().toString(),
          title: file.name.split('.')[0],
          fileName: file.name,
          data: reader.result as string,
          addedAt: Date.now()
        };
        const updated = [newNasheed, ...nasheeds];
        setNasheeds(updated);
        localStorage.setItem('app_nasheeds', JSON.stringify(updated));
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteNasheed = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (playingId === id) {
      audioRef.current?.pause();
      setPlayingId(null);
    }
    const updated = nasheeds.filter(n => n.id !== id);
    setNasheeds(updated);
    localStorage.setItem('app_nasheeds', JSON.stringify(updated));
  };

  const togglePlay = (nasheed: Nasheed) => {
    if (playingId === nasheed.id) {
      if (audioRef.current?.paused) {
        audioRef.current.play();
      } else {
        audioRef.current?.pause();
      }
    } else {
      if (audioRef.current) {
        audioRef.current.src = nasheed.data;
        audioRef.current.play();
        setPlayingId(nasheed.id);
      }
    }
  };

  const skipTrack = (direction: 'next' | 'prev') => {
    if (!playingId || nasheeds.length === 0) return;
    const currentIndex = nasheeds.findIndex(n => n.id === playingId);
    let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    
    if (nextIndex >= nasheeds.length) nextIndex = 0;
    if (nextIndex < 0) nextIndex = nasheeds.length - 1;
    
    togglePlay(nasheeds[nextIndex]);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="animate-fade-in relative pb-40">
      <audio 
        ref={audioRef} 
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={() => skipTrack('next')}
        className="hidden"
      />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <SectionHeader 
          title="Hamud & Nasheed" 
          subtitle="Soul-stirring praises to keep your heart connected to the Divine." 
          onBack={onBack}
        />
        <label className="flex items-center space-x-3 bg-[#D4AF37] hover:bg-[#c19b2e] text-black px-8 py-4 rounded-2xl cursor-pointer transition-all font-black shadow-xl shadow-amber-900/20 active:scale-95 group">
          <Upload size={20} className="group-hover:-translate-y-1 transition-transform duration-300" />
          <span className="text-xs uppercase tracking-widest">Upload Audio</span>
          <input type="file" className="hidden" accept="audio/*" onChange={handleUpload} />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {nasheeds.map((n) => (
          <div 
            key={n.id} 
            onClick={() => togglePlay(n)}
            className={`
              flex items-center justify-between p-6 rounded-[1.5rem] border transition-all cursor-pointer group relative overflow-hidden
              ${playingId === n.id 
                ? 'bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
                : 'bg-neutral-900/40 border-emerald-900/10 hover:border-emerald-500/20 hover:bg-neutral-900/60'}
            `}
          >
            {/* Play/Pause indicator for active item */}
            <div className="flex items-center gap-6 flex-1 min-w-0">
              <div className={`
                w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500
                ${playingId === n.id 
                  ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]' 
                  : 'bg-emerald-950/40 text-emerald-500 border border-emerald-500/10 group-hover:bg-emerald-500 group-hover:text-black'}
              `}>
                {playingId === n.id && !audioRef.current?.paused ? (
                  <div className="flex items-center gap-1">
                    <span className="w-1 h-3 bg-white rounded-full animate-[pulse_1s_infinite]" />
                    <span className="w-1 h-5 bg-white rounded-full animate-[pulse_0.8s_infinite]" />
                    <span className="w-1 h-4 bg-white rounded-full animate-[pulse_1.2s_infinite]" />
                  </div>
                ) : (
                  <Play size={24} className={playingId === n.id ? '' : 'ml-1'} />
                )}
              </div>

              <div className="min-w-0">
                <h3 className="text-lg font-bold text-neutral-100 truncate group-hover:text-white transition-colors">
                  {n.title}
                </h3>
                <div className="flex items-center gap-3 mt-1 text-neutral-500 text-[10px] font-black uppercase tracking-widest">
                   <Volume2 size={12} className="text-emerald-500/40" />
                   <span className="truncate">{n.fileName}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <a 
                href={n.data} 
                download={n.fileName}
                onClick={(e) => e.stopPropagation()}
                className="p-3 bg-neutral-800 hover:bg-neutral-700 text-[#D4AF37] rounded-xl transition-all border border-[#D4AF37]/20"
                title="Download"
              >
                <Download size={18} />
              </a>
              <button 
                onClick={(e) => deleteNasheed(n.id, e)}
                className="p-3 bg-neutral-800 hover:bg-red-500/10 text-neutral-600 hover:text-red-500 rounded-xl transition-all"
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {nasheeds.length === 0 && (
          <div className="py-32 flex flex-col items-center justify-center text-neutral-600 border-2 border-dashed border-neutral-800 rounded-[3rem] bg-black/20">
            <div className="w-20 h-20 bg-neutral-900 rounded-3xl flex items-center justify-center mb-6 opacity-20">
              <Music size={40} />
            </div>
            <p className="font-playfair text-2xl text-neutral-400 mb-2">Empty Playlist</p>
            <p className="text-sm opacity-50 tracking-widest font-amiri italic">"Hearts find rest in the remembrance of Allah."</p>
          </div>
        )}
      </div>

      {/* Persistent Global Player */}
      {playingId && currentNasheed && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl z-50 animate-fade-in">
          <div className="bg-black/90 backdrop-blur-3xl border border-emerald-500/30 rounded-[2rem] p-4 md:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col gap-4 overflow-hidden relative">
            
            {/* Animated Background Pulse */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-20" />

            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-emerald-900 rounded-2xl flex items-center justify-center shadow-lg shrink-0 relative group">
                  <Disc className={`text-white/40 ${!audioRef.current?.paused ? 'animate-[spin_4s_linear_infinite]' : ''}`} size={32} />
                  <div className="absolute inset-0 bg-black/20 rounded-2xl" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-white font-bold truncate text-base leading-tight">{currentNasheed.title}</h4>
                  <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mt-1 opacity-60">Now Reciting</p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4 md:gap-8">
                <button 
                  onClick={() => skipTrack('prev')}
                  className="text-neutral-500 hover:text-white transition-colors"
                >
                  <SkipBack size={24} fill="currentColor" />
                </button>
                
                <button 
                  onClick={() => togglePlay(currentNasheed)}
                  className="w-14 h-14 bg-[#D4AF37] hover:bg-[#F4DF4E] text-black rounded-full flex items-center justify-center transition-all shadow-lg shadow-amber-900/20 active:scale-90"
                >
                  {audioRef.current?.paused ? (
                    <Play size={24} fill="currentColor" className="ml-1" />
                  ) : (
                    <Pause size={24} fill="currentColor" />
                  )}
                </button>

                <button 
                  onClick={() => skipTrack('next')}
                  className="text-neutral-500 hover:text-white transition-colors"
                >
                  <SkipForward size={24} fill="currentColor" />
                </button>
              </div>

              <button 
                onClick={() => { audioRef.current?.pause(); setPlayingId(null); }}
                className="p-2 text-neutral-600 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Progress Bar & Timing */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-mono text-neutral-500 font-bold min-w-[35px]">{formatTime(currentTime)}</span>
                <div className="flex-grow relative h-6 flex items-center group/seek">
                  <input 
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1.5 bg-neutral-800 rounded-full appearance-none cursor-pointer accent-[#D4AF37] focus:outline-none"
                  />
                  <div 
                    className="absolute h-1.5 bg-emerald-500 rounded-full pointer-events-none transition-all duration-300"
                    style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-neutral-500 font-bold min-w-[35px]">{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NasheedSection;
