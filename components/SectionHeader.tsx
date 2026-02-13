import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, onBack }) => {
  return (
    <div className="mb-12 relative">
      {onBack && (
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-emerald-500 hover:text-gold transition-all group mb-6"
        >
          <div className="bg-emerald-500/10 p-2 rounded-full group-hover:bg-emerald-500/20 transition-all border border-emerald-500/20">
            <ChevronLeft size={16} />
          </div>
          <span className="font-bold text-xs uppercase tracking-widest">Return to Path</span>
        </button>
      )}
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl md:text-5xl font-playfair font-bold text-white relative inline-block">
          {title}
          <span className="text-[#D4AF37] opacity-50 absolute -top-2 -left-3 text-3xl font-amiri pointer-events-none select-none">
            ﷽
          </span>
        </h2>
        <div className="flex items-center gap-4 mt-2">
          <div className="h-[1px] w-24 bg-gradient-to-r from-[#D4AF37] to-transparent" />
          <div className="w-2 h-2 rotate-45 border border-[#D4AF37]" />
          <div className="h-[1px] flex-grow bg-gradient-to-l from-[#D4AF37] to-transparent opacity-20" />
        </div>
      </div>
      {subtitle && <p className="text-neutral-400 mt-4 max-w-2xl text-lg font-amiri italic tracking-wide">{subtitle}</p>}
    </div>
  );
};

export default SectionHeader;