import React, { useState, useEffect, useCallback, useRef } from 'react';
import SectionHeader from './SectionHeader';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Compass, 
  Navigation2, 
  MapPin, 
  RefreshCw, 
  AlertCircle, 
  Info, 
  Star, 
  ChevronUp, 
  Globe, 
  Search,
  CheckCircle2,
  Map as MapIcon,
  Zap,
  MousePointer2
} from 'lucide-react';

interface QiblaSectionProps {
  onBack?: () => void;
}

const MECCA_LAT = 21.4225;
const MECCA_LNG = 39.8262;

const QUICK_CITIES = [
  { name: "Mecca", lat: 21.4225, lng: 39.8262 },
  { name: "Medina", lat: 24.4672, lng: 39.6068 },
  { name: "Jerusalem", lat: 31.7683, lng: 35.2137 },
  { name: "London", lat: 51.5074, lng: -0.1278 },
  { name: "Mumbai", lat: 19.0760, lng: 72.8777 },
  { name: "Dubai", lat: 25.2048, lng: 55.2708 },
  { name: "New York", lat: 40.7128, lng: -74.0060 },
  { name: "Jakarta", lat: -6.2088, lng: 106.8456 }
];

const QiblaSection: React.FC<QiblaSectionProps> = ({ onBack }) => {
  const [qiblaAngle, setQiblaAngle] = useState<number | null>(null);
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
  const [isAligned, setIsAligned] = useState(false);
  const [locationSource, setLocationSource] = useState<'GPS' | 'Search' | 'Quick' | null>(null);
  const [detectedCity, setDetectedCity] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const calculateQibla = (lat: number, lng: number) => {
    const phi1 = lat * Math.PI / 180;
    const phiK = MECCA_LAT * Math.PI / 180;
    const lambda1 = lng * Math.PI / 180;
    const lambdaK = MECCA_LNG * Math.PI / 180;

    const q = Math.atan2(
      Math.sin(lambdaK - lambda1),
      Math.cos(phi1) * Math.tan(phiK) - Math.sin(phi1) * Math.cos(lambdaK - lambda1)
    );

    let angle = q * 180 / Math.PI;
    if (angle < 0) angle += 360;
    return angle;
  };

  const updateLocationData = (lat: number, lng: number, source: 'GPS' | 'Search' | 'Quick', cityName?: string) => {
    setCoords({ lat, lng });
    setQiblaAngle(calculateQibla(lat, lng));
    setDistance(calculateDistance(lat, lng, MECCA_LAT, MECCA_LNG));
    setLocationSource(source);
    if (cityName) setDetectedCity(cityName);
    setError(null);
    if ('vibrate' in navigator) navigator.vibrate(50);
  };

  const getPosition = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateLocationData(latitude, longitude, 'GPS', 'Detected via GPS');
        setLoading(false);
      },
      (err) => {
        setError("GPS Access Denied. Please give your location by typing it below.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleCitySearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Find the latitude and longitude for: "${searchQuery}". Format strictly as JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              latitude: { type: Type.NUMBER },
              longitude: { type: Type.NUMBER },
              city: { type: Type.STRING },
              country: { type: Type.STRING },
            },
            required: ["latitude", "longitude", "city"],
          },
        },
      });

      const result = JSON.parse(response.text);
      updateLocationData(result.latitude, result.longitude, 'Search', `${result.city}${result.country ? `, ${result.country}` : ''}`);
      setSearchQuery('');
    } catch (err) {
      console.error("Search error:", err);
      setError("Location not found. Try a bigger city or check your spelling.");
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    getPosition();

    const handleOrientation = (e: DeviceOrientationEvent) => {
      let heading = null;
      if ((e as any).webkitCompassHeading !== undefined) {
        heading = (e as any).webkitCompassHeading;
      } else if (e.alpha !== null) {
        heading = 360 - e.alpha; 
      }
      
      if (heading !== null) {
        setDeviceHeading(heading);
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  useEffect(() => {
    if (qiblaAngle !== null && deviceHeading !== null) {
      const diff = Math.abs(qiblaAngle - deviceHeading);
      const normalizedDiff = diff > 180 ? 360 - diff : diff;
      const currentlyAligned = normalizedDiff < 3; // 3 degree threshold
      if (currentlyAligned && !isAligned && 'vibrate' in navigator) {
        navigator.vibrate(100);
      }
      setIsAligned(currentlyAligned);
    }
  }, [qiblaAngle, deviceHeading, isAligned]);

  const rotation = qiblaAngle !== null && deviceHeading !== null 
    ? (qiblaAngle - deviceHeading) 
    : (qiblaAngle || 0);

  return (
    <div className="animate-fade-in max-w-5xl mx-auto pb-40">
      <SectionHeader 
        title="Qibla Finder" 
        subtitle="Give your location to align your heart toward the Holy Kaaba." 
        onBack={onBack}
      />

      {/* Modern Search & Location Input */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
        <form 
          onSubmit={handleCitySearch} 
          className="lg:col-span-8 group relative flex items-center bg-neutral-900/40 border border-emerald-900/20 rounded-3xl p-1.5 backdrop-blur-2xl transition-all focus-within:border-emerald-500/50 shadow-2xl"
        >
          <div className="flex-1 flex items-center px-4 gap-3">
            <Search className="text-neutral-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search city (e.g. Dubai, New York, Karachi)..."
              className="w-full bg-transparent text-white py-3 outline-none font-medium placeholder:text-neutral-600 text-lg"
            />
          </div>
          <button 
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-20 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2"
          >
            {isSearching ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} />}
            Find
          </button>
        </form>

        <button 
          onClick={getPosition}
          disabled={loading}
          className="lg:col-span-4 bg-neutral-900 hover:bg-neutral-800 text-emerald-500 border border-emerald-900/20 rounded-3xl px-6 py-4 flex items-center justify-center gap-3 transition-all active:scale-95 group font-bold"
        >
          {loading ? <RefreshCw size={20} className="animate-spin" /> : <Navigation2 size={20} className="group-hover:rotate-45 transition-transform" />}
          Live GPS
        </button>
      </div>

      {/* Quick Picks for Location */}
      <div className="mb-12 overflow-x-auto no-scrollbar pb-2">
        <div className="flex gap-3">
          {QUICK_CITIES.map(city => (
            <button
              key={city.name}
              onClick={() => updateLocationData(city.lat, city.lng, 'Quick', city.name)}
              className={`whitespace-nowrap px-6 py-3 rounded-2xl border font-bold text-xs uppercase tracking-widest transition-all active:scale-95 ${
                detectedCity === city.name 
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                  : 'bg-neutral-900/50 border-neutral-800 text-neutral-500 hover:border-emerald-500/30 hover:text-neutral-300'
              }`}
            >
              {city.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Visual Compass Component */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="relative w-72 h-72 md:w-[480px] md:h-[480px]">
            {/* Ambient Glows */}
            <div className={`absolute inset-0 rounded-full blur-[100px] transition-all duration-1000 ${isAligned ? 'bg-emerald-500/20 scale-110' : 'bg-[#D4AF37]/5'}`} />
            
            {/* The Compass Body */}
            <div className={`absolute inset-0 border-4 rounded-full bg-black/40 backdrop-blur-3xl shadow-2xl flex items-center justify-center transition-all duration-700 ${isAligned ? 'border-emerald-500/60 shadow-emerald-500/20 scale-105' : 'border-emerald-900/10'}`}>
               
               {/* Degree Ring Labels */}
               {[0, 90, 180, 270].map(deg => {
                 const card = deg === 0 ? 'N' : deg === 90 ? 'E' : deg === 180 ? 'S' : 'W';
                 return (
                   <div key={deg} className="absolute inset-10 flex flex-col items-center justify-start pointer-events-none" style={{ transform: `rotate(${deg}deg)` }}>
                     <span className={`text-xs font-black font-montserrat ${deg === 0 ? 'text-[#D4AF37] gold-glow' : 'text-neutral-800'}`}>{card}</span>
                   </div>
                 );
               })}

               {/* Geometric Inner Pattern */}
               <div className="absolute inset-16 border border-emerald-900/5 rounded-full pointer-events-none" />
               <div className="absolute inset-24 border border-emerald-900/5 rounded-full pointer-events-none" />

               {/* Qibla Static Marker (Points to actual Qibla relative to North) */}
               {qiblaAngle !== null && (
                 <div 
                   className="absolute inset-2 flex flex-col items-center justify-start transition-transform duration-1000 ease-out"
                   style={{ transform: `rotate(${qiblaAngle}deg)` }}
                 >
                   {/* Enhanced Pulsing & Glowing Star Container */}
                   <div className={`w-8 h-8 rounded-full bg-[#D4AF37] mt-1 flex items-center justify-center border-4 border-black z-20 transition-all duration-500 ${qiblaAngle !== null ? 'animate-pulse-gold' : ''} ${isAligned ? 'shadow-[0_0_40px_#D4AF37] scale-125 border-emerald-400' : 'shadow-[0_0_25px_#D4AF37]'}`}>
                      <Star size={12} className={`text-black fill-current transition-transform duration-700 ${isAligned ? 'scale-110' : ''}`} />
                   </div>
                   <div className={`mt-3 font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full border transition-all duration-700 ${isAligned ? 'bg-emerald-500 text-white border-emerald-300' : 'bg-black/80 text-[#D4AF37] border-[#D4AF37]/30'}`}>
                     Holy Kaaba
                   </div>
                 </div>
               )}

               {/* Dynamic Tracking Needle */}
               <div 
                 className="absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-out"
                 style={{ transform: `rotate(${rotation}deg)` }}
               >
                 <div className="relative flex flex-col items-center">
                   {/* Needle Top with extra alignment glow */}
                   <div className={`w-2 md:w-3 h-40 md:h-56 rounded-t-full transition-all duration-500 ${isAligned ? 'bg-emerald-400 shadow-[0_0_50px_#10b981] animate-qibla-glow' : 'bg-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.4)]'}`} />
                   {/* Needle Bottom */}
                   <div className="w-2 md:w-3 h-40 md:h-56 bg-neutral-900 rounded-b-full opacity-40" />
                   
                   {/* Mecca Cap Visual */}
                   <div className="absolute -top-24 flex flex-col items-center">
                      <div className={`p-6 rounded-[2rem] border-2 transition-all duration-700 shadow-2xl ${isAligned ? 'bg-emerald-500 border-emerald-200 text-white scale-150 rotate-0' : 'bg-black border-[#D4AF37]/50 text-[#D4AF37] rotate-45'}`}>
                        <div className={isAligned ? '' : '-rotate-45'}>
                          <Navigation2 size={32} fill="currentColor" />
                        </div>
                      </div>
                      <div className={`mt-8 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${isAligned ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse' : 'bg-black/40 text-neutral-600 border-transparent opacity-0'}`}>
                        Facing Qibla
                      </div>
                   </div>
                 </div>
               </div>

               {/* Hub */}
               <div className="w-24 h-24 bg-neutral-900 border-4 border-neutral-800 rounded-full z-10 flex items-center justify-center shadow-2xl">
                 <div className={`w-6 h-6 rounded-full transition-all duration-500 ${isAligned ? 'bg-emerald-500 shadow-[0_0_20px_#10b981] scale-125' : 'bg-neutral-800'}`} />
               </div>
            </div>
          </div>

          <div className="mt-20 w-full max-w-sm">
             <div className={`text-center p-10 rounded-[3rem] border transition-all duration-500 backdrop-blur-3xl ${isAligned ? 'bg-emerald-950/20 border-emerald-500/40 shadow-xl' : 'bg-neutral-900/40 border-emerald-900/10'}`}>
               <p className="text-[11px] font-black text-neutral-500 uppercase tracking-[0.5em] mb-4">Magnetic Bearing</p>
               <h3 className={`text-7xl font-montserrat font-black transition-colors tracking-tighter ${isAligned ? 'text-emerald-400' : 'text-white'}`}>
                 {qiblaAngle ? Math.round(qiblaAngle) : '--'}<span className="text-neutral-800 text-3xl font-light ml-1">°</span>
               </h3>
               <div className="h-[1px] w-24 bg-neutral-800 mx-auto my-6" />
               <div className="flex items-center justify-center gap-3 text-sm font-amiri text-neutral-400 italic">
                 <MapIcon size={18} className="text-[#D4AF37]" />
                 {distance ? `~${Math.round(distance).toLocaleString()} km to Mecca` : 'Determining position...'}
               </div>
             </div>
          </div>
        </div>

        {/* Right Info & Status HUD */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-neutral-900/40 border border-emerald-900/10 rounded-[3rem] p-10 backdrop-blur-xl group hover:border-emerald-500/30 transition-all duration-700">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border ${locationSource === 'GPS' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-[#D4AF37]/10 border-[#D4AF37]/20 text-[#D4AF37]'}`}>
                  {locationSource === 'GPS' ? <Zap size={28} /> : <MapPin size={28} />}
                </div>
                <div>
                  <h4 className="text-2xl font-playfair font-bold text-white leading-none mb-2">Positioning</h4>
                  <p className="text-[10px] text-neutral-600 uppercase tracking-widest font-black">
                    {locationSource ? `Verified via ${locationSource}` : 'Awaiting Selection'}
                  </p>
                </div>
              </div>
              <CheckCircle2 size={32} className={coords ? "text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "text-neutral-900"} />
            </div>
            
            <div className="space-y-6">
              <div className="p-8 bg-black/40 rounded-[2rem] border border-neutral-800 group-hover:border-neutral-700 transition-all">
                 <div className="flex items-center justify-between mb-6">
                   <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Active Location</span>
                   <span className="text-[9px] px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full font-black uppercase tracking-[0.2em] border border-emerald-500/10">Active</span>
                 </div>
                 <p className="text-2xl font-playfair font-bold text-white mb-3 tracking-wide">{detectedCity || 'Where are you?'}</p>
                 <div className="flex gap-6 pt-4 border-t border-neutral-800/50">
                   <div className="flex flex-col">
                     <span className="text-[9px] text-neutral-600 uppercase font-black tracking-widest mb-1">Latitude</span>
                     <span className="text-xs text-neutral-400 font-mono font-bold">{coords?.lat.toFixed(5) || '---'}</span>
                   </div>
                   <div className="flex flex-col">
                     <span className="text-[9px] text-neutral-600 uppercase font-black tracking-widest mb-1">Longitude</span>
                     <span className="text-xs text-neutral-400 font-mono font-bold">{coords?.lng.toFixed(5) || '---'}</span>
                   </div>
                 </div>
              </div>

              {error && (
                <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-[2rem] flex gap-5 items-start">
                   <AlertCircle className="text-red-500 shrink-0" size={24} />
                   <div className="flex-1">
                     <p className="text-sm text-red-400 font-bold mb-1">Input Required</p>
                     <p className="text-xs text-neutral-500 font-amiri leading-relaxed italic">{error}</p>
                   </div>
                </div>
              )}
            </div>
          </div>

          {/* Compass Sensor Status Card */}
          <div className="bg-neutral-900/40 border border-emerald-900/10 rounded-[3rem] p-10 backdrop-blur-xl">
             <div className="flex items-center gap-4 mb-8">
               <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 border border-amber-500/10">
                 <MousePointer2 size={20} />
               </div>
               <h4 className="text-lg font-playfair font-bold text-white">Orientation Sensor</h4>
             </div>
             
             {deviceHeading === null ? (
               <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                 <p className="text-xs text-neutral-400 leading-relaxed font-amiri italic">
                   Sensors are inactive. Point the top of your device toward True North manually to align the compass.
                 </p>
               </div>
             ) : (
               <div className="flex items-center justify-between p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                 <div className="flex items-center gap-3">
                   <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Heading Locked</span>
                 </div>
                 <span className="font-mono text-sm text-emerald-500 font-bold">{Math.round(deviceHeading)}° N</span>
               </div>
             )}
          </div>

          {/* Instructions Card */}
          <div className="bg-gradient-to-br from-neutral-900 to-black border border-emerald-500/10 rounded-[3rem] p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-1000">
              <Compass size={140} className="text-[#D4AF37]" />
            </div>
            <h4 className="font-playfair font-bold text-white text-lg mb-8 flex items-center gap-4">
              <Info size={22} className="text-[#D4AF37]" /> Sacred Guidance
            </h4>
            <div className="space-y-8">
              <div className="flex gap-5">
                <div className="w-1.5 h-auto bg-emerald-500/30 rounded-full" />
                <p className="text-sm text-neutral-400 leading-relaxed font-amiri italic">
                  Search for your city using the bar above to calculate the exact angle if GPS is unavailable.
                </p>
              </div>
              <div className="flex gap-5">
                <div className="w-1.5 h-auto bg-[#D4AF37]/30 rounded-full" />
                <p className="text-sm text-neutral-400 leading-relaxed font-amiri italic">
                  When the indicator turns <strong>Emerald</strong> and vibrates, you are precisely aligned with the Kaaba.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-24 flex flex-col items-center">
        <div className="h-[1px] w-56 bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent mb-10" />
        <div className="flex items-center gap-3 text-[#D4AF37] mb-6">
          <ChevronUp size={24} className="animate-bounce" />
          <span className="text-[11px] font-black uppercase tracking-[0.6em]">Sacred Path</span>
        </div>
        <p className="text-neutral-700 text-[11px] font-amiri tracking-[0.3em] uppercase text-center max-w-xl leading-loose italic">
          "Turn then your face towards the Sacred Mosque; and wherever you are, turn your faces towards it."
        </p>
      </div>
    </div>
  );
};

export default QiblaSection;