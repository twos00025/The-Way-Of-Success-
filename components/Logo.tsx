import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', onClick }) => {
  const scale = {
    sm: 'scale-[0.6]',
    md: 'scale-[0.8]',
    lg: 'scale-100',
    xl: 'scale-[1.2]'
  }[size];

  return (
    <div 
      onClick={onClick}
      className={`flex flex-col items-center justify-center bg-black p-4 select-none transform transition-all active:scale-95 ${onClick ? 'cursor-pointer hover:opacity-80' : ''} ${className} ${scale} origin-left`}
    >
      <div className="relative">
        {/* Top Text */}
        <div className="flex justify-end w-full mb-1">
          <span className="text-[9px] font-bold text-[#34d399] tracking-tighter leading-none uppercase">
            I AM NOTHING BUT
          </span>
        </div>

        {/* Main TWOS Text */}
        <div className="flex items-center leading-none">
          <span className="text-5xl font-[1000] text-white tracking-tighter italic">TW</span>
          <span className="text-5xl font-[1000] text-white tracking-tighter italic">OS</span>
        </div>

        {/* Bottom Text Row */}
        <div className="flex justify-between w-full mt-1">
          <span className="text-[9px] font-bold text-[#34d399] tracking-tighter leading-none uppercase">
            AN ISLAMIC SERVANT
          </span>
          <span className="text-[9px] font-bold text-[#34d399] tracking-tighter leading-none ml-2 uppercase">
            THE WAY OF SUCCESS
          </span>
        </div>
      </div>
    </div>
  );
};

export default Logo;