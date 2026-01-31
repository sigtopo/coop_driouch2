
import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Phone, 
  Briefcase, 
  Users, 
  User, 
  Calendar,
  Building2,
  Map,
  GraduationCap,
  ChevronUp,
  ChevronDown,
  Coins,
  Globe,
  Info
} from 'lucide-react';
import { CooperativeFeature } from '../types';

interface DetailPanelProps {
  coop: CooperativeFeature;
  onClose: () => void;
}

const DetailPanel: React.FC<DetailPanelProps> = ({ coop, onClose }) => {
  const p = coop.properties;
  const [isExpanded, setIsExpanded] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);

  // Reset expansion when coop changes
  useEffect(() => {
    setIsExpanded(false);
  }, [coop]);

  const [lng, lat] = coop.geometry.coordinates || [0, 0];
  const gMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY.current;
    setDragY(deltaY);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (dragY < -50) setIsExpanded(true);
    if (dragY > 50 && isExpanded) setIsExpanded(false);
    if (dragY > 150 && !isExpanded) onClose();
    setDragY(0);
  };

  const formatGenre = (g: string) => {
    if (g === 'M') return 'Homme (ذكر)';
    if (g === 'F') return 'Femme (أنثى)';
    return g || 'N/A';
  };

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-[4000] flex justify-center p-0 md:p-4 pointer-events-none transition-all duration-500 ease-in-out ${isExpanded ? 'h-[90vh]' : 'h-auto'}`}
    >
      <div 
        className={`bg-white w-full max-w-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.2)] pointer-events-auto transition-all duration-500 flex flex-col border-x border-t border-gray-100
          ${isExpanded ? 'rounded-t-3xl h-full' : 'rounded-t-[2.5rem] h-auto mb-0 md:mb-4 md:rounded-3xl'}`}
        style={{
          transform: isDragging ? `translateY(${dragY}px)` : 'none',
        }}
      >
        {/* Handle / Header Bar */}
        <div 
          className="flex flex-col items-center py-3 cursor-grab active:cursor-grabbing shrink-0"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="w-12 h-1.5 bg-gray-200 rounded-full mb-2"></div>
          {!isExpanded && (
            <div className="flex items-center gap-1 text-[9px] font-black text-gray-300 uppercase tracking-widest animate-pulse">
              <ChevronUp size={10} /> Tirer pour plus de détails
            </div>
          )}
        </div>

        {/* Compact Summary View (Always Visible) */}
        <div className="px-6 pb-4 flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
               <div className="p-1.5 bg-green-50 rounded-lg text-green-700">
                <Building2 size={16} />
              </div>
              <h3 className="text-lg md:text-xl font-black text-gray-900 truncate">
                {p['Nom de coopérative'] || p.Nom_Coop}
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <a 
                href={gMapsUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md"
                onClick={(e) => e.stopPropagation()}
              >
                <Map size={12} /> Localiser
              </a>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter truncate">
                {p["Filière d'activité"]}
              </span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
              className="p-2.5 bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-100"
            >
              {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Detailed Content */}
        <div className={`overflow-y-auto custom-scrollbar px-6 pb-8 space-y-8 transition-opacity duration-300 ${isExpanded ? 'opacity-100 flex-1' : 'h-0 opacity-0'}`}>
          
          {/* Section 1: Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-blue-50/50 p-3 rounded-2xl border border-blue-100/50">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <Users size={14} />
                <span className="text-[8px] font-black uppercase">Adhérents</span>
              </div>
              <div className="text-lg font-black text-blue-900">{p["Nombre des adherents"] || p["Nombre des adhérents"] || 0}</div>
            </div>
            <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100/50">
              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                <Coins size={14} />
                <span className="text-[8px] font-black uppercase">Capital</span>
              </div>
              <div className="text-sm font-black text-emerald-900">{p["Capital social"] || "---"} <span className="text-[10px]">DH</span></div>
            </div>
            <div className="bg-pink-50/50 p-3 rounded-2xl border border-pink-100/50">
              <div className="flex items-center gap-2 text-pink-600 mb-1">
                <User size={14} />
                <span className="text-[8px] font-black uppercase">Femmes</span>
              </div>
              <div className="text-lg font-black text-pink-900">{p["Nombre des femmes"] || 0}</div>
            </div>
            <div className="bg-orange-50/50 p-3 rounded-2xl border border-orange-100/50">
              <div className="flex items-center gap-2 text-orange-600 mb-1">
                <Calendar size={14} />
                <span className="text-[8px] font-black uppercase">Jeunes</span>
              </div>
              <div className="text-lg font-black text-orange-900">{p["Nombre des jeunes"] || 0}</div>
            </div>
          </div>

          {/* Section 2: Administrative Info */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <Globe size={14} className="text-green-600" />
              <span>Détails Administratifs</span>
              <div className="flex-1 h-px bg-gray-100 ml-2"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
              <div>
                <p className="text-[8px] font-bold text-gray-400 uppercase">Province</p>
                <p className="text-[11px] font-black text-gray-800">{p.Province || "Driouch"}</p>
              </div>
              <div>
                <p className="text-[8px] font-bold text-gray-400 uppercase">Cercle</p>
                <p className="text-[11px] font-black text-gray-800">{p.Cercle || "---"}</p>
              </div>
              <div>
                <p className="text-[8px] font-bold text-gray-400 uppercase">Commune</p>
                <p className="text-[11px] font-black text-gray-800">{p.Commune || "---"}</p>
              </div>
              <div>
                <p className="text-[8px] font-bold text-gray-400 uppercase">Douar</p>
                <p className="text-[11px] font-black text-gray-800">{p["Douar/Quartier"] || "---"}</p>
              </div>
            </div>
          </section>

          {/* Section 3: Manager & Personal Profile */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <User size={14} className="text-green-600" />
              <span>Profil du Responsable</span>
              <div className="flex-1 h-px bg-gray-100 ml-2"></div>
            </div>
            <div className="bg-gray-900 text-white rounded-2xl p-5 shadow-lg">
              <div className="mb-4">
                <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Président / Gestionnaire</p>
                <p className="text-lg font-black tracking-tight">{p["Nom et prénom président/gestionnaire"] || "Non mentionné"}</p>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                <div>
                  <p className="text-[8px] font-bold text-gray-400 uppercase">Genre</p>
                  <p className="text-[11px] font-bold">{formatGenre(p.Genre)}</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold text-gray-400 uppercase">Naissance</p>
                  <p className="text-[11px] font-bold">{p["Date de naissance"] || "---"}</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold text-gray-400 uppercase">Scolarité</p>
                  <div className="flex items-center gap-1">
                    <GraduationCap size={10} className="text-green-400" />
                    <p className="text-[11px] font-bold truncate">{p["Niveau scolaire"] || "---"}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Creation & Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
               <div className="p-3 bg-white rounded-xl shadow-sm text-gray-400">
                <Info size={20} />
              </div>
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase">Date de création</p>
                <p className="text-sm font-black text-gray-700">{p["Date de création"] || "Non définie"}</p>
              </div>
            </div>
            
            {p.Tel && (
              <a 
                href={`tel:${p.Tel}`}
                className="flex items-center gap-4 p-4 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-all shadow-md group"
              >
                <div className="p-3 bg-white/10 rounded-xl group-hover:scale-110 transition-transform">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-green-100 uppercase">Contact Direct</p>
                  <p className="text-lg font-black tracking-tighter">{p.Tel}</p>
                </div>
              </a>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default DetailPanel;
