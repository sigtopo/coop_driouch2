
import React from 'react';
import { Menu, Layers, Map as MapIcon, Globe, Clock, Loader2 } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  mapLayer: 'standard' | 'satellite';
  setMapLayer: (layer: 'standard' | 'satellite') => void;
  lastUpdated?: Date;
  refreshing?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  onMenuClick, 
  mapLayer, 
  setMapLayer, 
  lastUpdated,
  refreshing 
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <header className="h-20 md:h-16 flex items-center justify-between px-4 md:px-6 bg-white border-b border-slate-200 z-[2000] shrink-0 shadow-sm">
      <div className="flex items-center gap-3 md:gap-5">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 hover:bg-slate-50 rounded-lg text-slate-700 transition-colors border border-transparent active:border-slate-300"
        >
          <Menu size={24} />
        </button>

        <div className="flex items-center gap-3 md:gap-4">
          <img 
            src="https://aid-maroc.com/wp-content/uploads/2021/04/Logo-222.png" 
            alt="AID Maroc" 
            className="h-10 md:h-11 w-auto object-contain opacity-100" 
          />
          
          <div className="border-l-2 border-slate-200 pl-3 md:pl-4">
            <h1 className="text-sm md:text-lg font-bold text-slate-900 tracking-tight leading-tight">
              Observatoire des Coopératives <span className="text-slate-500 block md:inline">Driouch</span>
            </h1>
            <div className="flex items-center gap-3">
              <p className="text-[9px] md:text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] -mt-0.5 whitespace-nowrap">
                Plateforme Institutionnelle
              </p>
              {lastUpdated && (
                <div className="hidden sm:flex items-center gap-1.5 text-[8px] font-bold text-slate-400 uppercase tracking-widest border-l border-slate-200 pl-3">
                  {refreshing ? (
                    <Loader2 size={10} className="animate-spin text-blue-600" />
                  ) : (
                    <Clock size={10} />
                  )}
                  <span>Mise à jour: {formatTime(lastUpdated)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3 md:gap-6">
        <div className="hidden md:flex bg-slate-50 p-1 rounded-xl border border-slate-200 shadow-sm gap-1">
          <button 
            onClick={() => setMapLayer('standard')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-tight transition-all ${mapLayer === 'standard' ? 'bg-[#1e293b] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <MapIcon size={12} />
            Plan
          </button>
          <button 
            onClick={() => setMapLayer('satellite')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-tight transition-all ${mapLayer === 'satellite' ? 'bg-[#1e293b] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <Globe size={12} />
            Satellite
          </button>
        </div>

        <button 
          onClick={() => setMapLayer(mapLayer === 'standard' ? 'satellite' : 'standard')}
          className="md:hidden p-2.5 text-slate-700 hover:bg-slate-100 rounded-full transition-all border border-slate-200"
        >
          <Layers size={20} />
        </button>

        <div className="hidden sm:flex flex-col items-end">
          <span className="text-[10px] font-bold text-white bg-slate-800 px-3 py-1 rounded-full tracking-widest shadow-sm">PROVINCE</span>
          <span className="text-[11px] font-semibold text-slate-400 mt-1 uppercase">Driouch, Maroc</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
