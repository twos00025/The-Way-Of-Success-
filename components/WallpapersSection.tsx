import React, { useState, useEffect } from 'react';
import SectionHeader from './SectionHeader';
import { Wallpaper } from '../types';
import { Upload, Download, Trash2, Image as ImageIcon } from 'lucide-react';

interface WallpapersSectionProps {
  onBack?: () => void;
}

const WallpapersSection: React.FC<WallpapersSectionProps> = ({ onBack }) => {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('app_wallpapers');
    if (stored) {
      setWallpapers(JSON.parse(stored));
    } else {
      setWallpapers([]);
      localStorage.setItem('app_wallpapers', JSON.stringify([]));
    }
  }, []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newWallpaper: Wallpaper = {
          id: Date.now().toString(),
          url: reader.result as string,
          title: file.name.split('.')[0]
        };
        const updated = [newWallpaper, ...wallpapers];
        setWallpapers(updated);
        localStorage.setItem('app_wallpapers', JSON.stringify(updated));
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteWallpaper = (id: string) => {
    const updated = wallpapers.filter(wp => wp.id !== id);
    setWallpapers(updated);
    localStorage.setItem('app_wallpapers', JSON.stringify(updated));
  };

  const downloadWallpaper = (url: string, title: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title || 'wallpaper'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <SectionHeader 
          title="Wallpapers" 
          subtitle="Inspirational visuals for your daily life." 
          onBack={onBack}
        />
        <label className="bg-[#D4AF37] hover:bg-[#c19b2e] text-black px-6 py-3 rounded-2xl cursor-pointer transition-all shadow-lg font-bold flex items-center gap-2 group">
          <Upload size={20} className="group-hover:-translate-y-1 transition-transform" />
          <span>Upload Image</span>
          <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wallpapers.map((wp) => (
          <div key={wp.id} className="group relative aspect-video sm:aspect-square rounded-3xl overflow-hidden border border-emerald-900/20 bg-neutral-900 transition-all hover:border-emerald-500/50">
            <img 
              src={wp.url} 
              alt={wp.title} 
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
              <h3 className="text-white font-bold mb-3 truncate">{wp.title}</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => downloadWallpaper(wp.url, wp.title)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Download size={16} /> Save
                </button>
                <button 
                  onClick={() => deleteWallpaper(wp.id)}
                  className="bg-red-500/20 hover:bg-red-500/40 text-red-400 p-2 rounded-xl transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {wallpapers.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-neutral-600 border-2 border-dashed border-neutral-800 rounded-[2.5rem]">
            <ImageIcon size={48} className="mb-4 opacity-20" />
            <p className="font-medium">Your gallery is empty</p>
            <p className="text-xs mt-1">Upload some inspirational Islamic wallpapers</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WallpapersSection;