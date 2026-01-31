
import React from 'react';
import { Menu, Layers } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  onLayerToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, onLayerToggle }) => {
  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 bg-white border-b border-gray-100 z-[2000] shrink-0 shadow-sm">
      <div className="flex items-center gap-3 md:gap-4">
        {/* زر القائمة للموبايل */}
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
        >
          <Menu size={24} />
        </button>

        <div className="p-1.5 bg-green-50 rounded-lg hidden xs:block">
          <img 
            src="https://aid-maroc.com/wp-content/uploads/2021/04/Logo-222.png" 
            alt="AID Maroc" 
            className="h-8 md:h-9 object-contain"
          />
        </div>
        
        <div className="border-l border-gray-200 pl-3 md:pl-4">
          <h1 className="text-xs md:text-lg font-black text-gray-900 tracking-tight leading-tight">
            Localisation des Coopératives <span className="text-green-600 block md:inline">Driouch</span>
          </h1>
          <p className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest -mt-0.5">
            Observatoire des Coopératives
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4">
        {/* زر تبديل الخريطة للموبايل */}
        <button 
          onClick={onLayerToggle}
          className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          title="Changer le fond de carte"
        >
          <Layers size={20} />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <span className="text-[9px] font-black text-white bg-green-600 px-2 py-1 rounded tracking-widest">PROVINCE</span>
          <span className="text-[10px] font-bold text-gray-500">Driouch, Maroc</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
