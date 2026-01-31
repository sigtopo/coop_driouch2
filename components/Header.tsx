
import React from 'react';
import { Menu, Layers, Map as MapIcon, Globe } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  mapLayer: 'standard' | 'satellite';
  setMapLayer: (layer: 'standard' | 'satellite') => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, mapLayer, setMapLayer }) => {
  return (
    <header className="h-20 md:h-16 flex items-center justify-between px-4 md:px-6 bg-gradient-to-r from-white via-white to-green-100 border-b border-green-200 z-[2000] shrink-0 shadow-md">
      <div className="flex items-center gap-3 md:gap-5">
        {/* زر القائمة للموبايل */}
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 hover:bg-white/50 rounded-lg text-gray-700 transition-colors border border-transparent active:border-green-300"
        >
          <Menu size={24} />
        </button>

        {/* الشعار */}
        <div className="flex items-center gap-3 md:gap-4">
          <img 
            src="https://aid-maroc.com/wp-content/uploads/2021/04/Logo-222.png" 
            alt="AID Maroc" 
            className="h-10 md:h-11 w-auto object-contain drop-shadow-sm"
          />
          
          <div className="border-l-2 border-green-600/20 pl-3 md:pl-4">
            <h1 className="text-sm md:text-xl font-black text-gray-900 tracking-tight leading-tight">
              Localisation des Coopératives <span className="text-green-700 block md:inline font-black">Driouch</span>
            </h1>
            <p className="text-[9px] md:text-[11px] font-bold text-green-800/60 uppercase tracking-[0.2em] -mt-0.5">
              Observatoire des Coopératives
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3 md:gap-6">
        {/* Map Switcher for Desktop */}
        <div className="hidden md:flex bg-white/80 p-1 rounded-xl border border-green-200 shadow-sm gap-1">
          <button 
            onClick={() => setMapLayer('standard')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all ${mapLayer === 'standard' ? 'bg-green-700 text-white shadow-sm' : 'text-gray-500 hover:bg-green-50'}`}
          >
            <MapIcon size={12} />
            Plan
          </button>
          <button 
            onClick={() => setMapLayer('satellite')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all ${mapLayer === 'satellite' ? 'bg-green-700 text-white shadow-sm' : 'text-gray-500 hover:bg-green-50'}`}
          >
            <Globe size={12} />
            Satellite
          </button>
        </div>

        {/* Mobile Toggle Button */}
        <button 
          onClick={() => setMapLayer(mapLayer === 'standard' ? 'satellite' : 'standard')}
          className="md:hidden p-2.5 text-green-700 hover:bg-white/80 rounded-full transition-all border border-green-100 shadow-sm"
          title="Changer le fond de carte"
        >
          <Layers size={20} />
        </button>

        <div className="hidden sm:flex flex-col items-end">
          <span className="text-[10px] font-black text-white bg-green-700 px-3 py-1 rounded-full tracking-widest shadow-sm">PROVINCE</span>
          <span className="text-[11px] font-bold text-green-900/70 mt-1">Driouch, Maroc</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
