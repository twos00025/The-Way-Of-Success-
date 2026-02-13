import React, { useState, useEffect, useRef } from 'react';
import SectionHeader from './SectionHeader';
import { Reel } from '../types';
import { PlayCircle, Plus, Video, Download, Trash2, Pause, Play } from 'lucide-react';

interface ReelsSectionProps {
  onBack?: () => void;
}

const ReelsSection: React.FC<ReelsSectionProps> = ({ onBack }) => {
  const [reels, setReels] = useState<Reel[]>([]);
  const [activeReelId, setActiveReelId] = useState<string | null>(null);
  const [pausedReels, setPausedReels] = useState<Record<string, boolean>>({});
  
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  useEffect(() => {
    const stored = localStorage.getItem('app_reels');
    if (stored) {
      try {
        setReels(JSON.parse(stored));
      } catch (e) { setReels([]); }
    }
  }, []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newReel: Reel = {
          id: Date.now().toString(),
          url: reader.result as string,
          title: file.name.split('.')[0]
        };
        const updated = [newReel, ...reels];
        setReels(updated);
        localStorage.setItem('app_reels', JSON.stringify(updated));
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteReel = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = reels.filter(r => r.id !== id);
    setReels(updated);
    localStorage.setItem('app_reels', JSON.stringify(updated));
  };

  const downloadReel = (url: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title || 'islamic-reel'}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const togglePlayback = (id: string) => {
    const video = videoRefs.current[id];
    if (!video) return;

    if (video.paused) {
      video.play();
      setPausedReels(prev => ({ ...prev, [id]: false }));
      setActiveReelId(id);
    } else {
      video.pause();
      setPausedReels(prev => ({ ...prev, [id]: true }));
    }
  };

  return (
    <div className="animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <SectionHeader 
          title="Islamic Reels" 
          subtitle="Short spiritual fragments to uplift your day. Tap any video to play or pause." 
          onBack={onBack}
        />
        <label className="bg-gradient-to-r from-[#D4AF37] to-amber-600 hover:from-amber-500 hover:to-[#D4AF37] text-black px-8 py-4 rounded-2xl cursor-pointer transition-all shadow-xl font-black flex items-center gap-3 group active:scale-95">
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          <span className="text-xs uppercase tracking-widest">Post Reel</span>
          <input type="file" className="hidden" accept="video/*" onChange={handleUpload} />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {reels.map((reel) => {
          const isPaused = pausedReels[reel.id] ?? true;
          const isActive = activeReelId === reel.id;

          return (
            <div 
              key={reel.id} 
              onClick={() => togglePlayback(reel.id)}
              className={`
                group relative aspect-[9/16] rounded-[2.5rem] overflow-hidden border transition-all duration-500 cursor-pointer bg-neutral-900
                ${isActive ? 'border-emerald-500/50 shadow-2xl scale-[1.02]' : 'border-emerald-900/10 hover:border-emerald-500/30'}
              `}
            >
              <video 
                ref={el => videoRefs.current[reel.id] = el}
                src={reel.url} 
                className={`w-full h-full object-cover transition-all duration-700 ${isPaused && !isActive ? 'opacity-60 grayscale-[0.2]' : 'opacity-100 grayscale-0'}`}
                loop
                muted
                playsInline
              />
              
              {/* Central Control Overlay */}
              <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${isPaused ? 'opacity-100 scale-100' : 'opacity-0 scale-150 pointer-events-none'}`}>
                <div className="bg-black/60 backdrop-blur-2xl p-8 rounded-full border border-white/10 text-white shadow-2xl">
                  {isPaused ? <Play size={40} fill="currentColor" /> : <Pause size={40} fill="currentColor" />}
                </div>
              </div>

              {/* Top Playing Status */}
              {!isPaused && (
                <div className="absolute top-6 left-6 animate-fade-in">
                  <div className="bg-emerald-500/90 text-white text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg shadow-emerald-950/20">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" /> Playing
                  </div>
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-8">
                <h3 className="text-white font-bold truncate text-sm mb-5 tracking-wide">{reel.title}</h3>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-300">
                  <button 
                    onClick={(e) => downloadReel(reel.url, reel.title, e)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 active:scale-95"
                  >
                    <Download size={14} /> Save
                  </button>
                  <button 
                    onClick={(e) => deleteReel(reel.id, e)}
                    className="bg-red-500/20 hover:bg-red-500/40 text-red-400 p-3 rounded-xl transition-all active:scale-95 border border-red-500/20"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {reels.length === 0 && (
          <div className="aspect-[9/16] rounded-[2.5rem] border-2 border-dashed border-emerald-900/20 flex flex-col items-center justify-center text-neutral-600 col-span-full py-24 bg-black/20 group">
            <Video size={56} className="mb-6 opacity-10 group-hover:opacity-30 transition-opacity" />
            <p className="font-playfair text-2xl text-neutral-400">Empty Reminders</p>
            <p className="text-[10px] uppercase font-black tracking-[0.3em] mt-2 opacity-50">Upload a short spiritual video</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReelsSection;