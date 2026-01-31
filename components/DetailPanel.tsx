
import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Phone, 
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
        className={`bg-white w-full max-w-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] pointer-events-auto transition-all duration-500 flex flex-col border border-gray-100
          ${isExpanded ? 'rounded-t-3xl h-full' : 'rounded-t-[2.5rem] h-auto mb-0 md:mb-4 md:rounded-3xl'}`}
        style={{
          transform: isDragging ? `translateY(${dragY}px)` : 'none',
        }}
      >
        {/* Drag Handle */}
        <div 
          className="flex flex-col items-center py-2 cursor-grab active:cursor-grabbing shrink-0"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="w-10 h-1 bg-gray-200 rounded-full mb-1"></div>
        </div>

        {/* Professional Header */}
        <div className="px-6 pb-4 flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
               <div className="p-1.5 bg-green-50 rounded-md text-green-700">
                <Building2 size={18} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 truncate tracking-tight">
                {p['Nom de coopérative'] || p.Nom_Coop}
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <a 
                href={gMapsUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50/80 px-2 py-1 rounded transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Map size={14} /> Localiser
              </a>
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate">
                {p["Filière d'activité"]}
              </span>
            </div>
          </div>
          <div className="flex gap-1.5 shrink-0">
            {/* Expansion Toggle Button - Styled ORANGE as requested */}
            <button 
              onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
              className={`p-2 rounded-full transition-all duration-300 shadow-sm border ${isExpanded ? 'bg-orange-600 text-white border-orange-700' : 'bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100'}`}
              title={isExpanded ? "Réduire" : "Agrandir"}
            >
              {isExpanded ? <ChevronDown size={20} strokeWidth={2.5} /> : <ChevronUp size={20} strokeWidth={2.5} />}
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className={`overflow-y-auto custom-scrollbar px-6 pb-6 space-y-5 transition-opacity duration-300 ${isExpanded ? 'opacity-100 flex-1' : 'h-0 opacity-0 overflow-hidden'}`}>
          
          {/* Section: Administrative Details */}
          <section className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
              <Globe size={13} className="text-green-600" />
              <span>Détails Administratifs</span>
              <div className="flex-1 h-px bg-slate-100 ml-1"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Province</p>
                <p className="text-xs font-semibold text-slate-700">{p.Province || "Driouch"}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Cercle</p>
                <p className="text-xs font-semibold text-slate-700">{p.Cercle || "---"}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Commune</p>
                <p className="text-xs font-semibold text-slate-700">{p.Commune || "---"}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Douar/ Quartier</p>
                <p className="text-xs font-semibold text-slate-700">{p["Douar/Quartier"] || "---"}</p>
              </div>
            </div>
          </section>

          {/* Section: Responsable Profile */}
          <section className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
              <User size={13} className="text-green-600" />
              <span>Profil du Responsable</span>
              <div className="flex-1 h-px bg-slate-100 ml-1"></div>
            </div>
            
            <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
              <div className="mb-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Président / Gestionnaire</p>
                <p className="text-base font-bold text-slate-800 tracking-tight">
                  {p["Nom et prénom président/gestionnaire"] || "Non mentionné"}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-50">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Genre</p>
                  <p className="text-[11px] font-semibold text-slate-600">{formatGenre(p.Genre)}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Naissance</p>
                  <p className="text-[11px] font-semibold text-slate-600">{p["Date de naissance"] || "---"}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Scolarité</p>
                  <div className="flex items-center gap-1">
                    <GraduationCap size={12} className="text-green-600 shrink-0" />
                    <p className="text-[11px] font-semibold text-slate-600 truncate">{p["Niveau scolaire"] || "---"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Call to Action */}
            {p.Tel && (
              <a 
                href={`tel:${p.Tel}`}
                className="flex items-center gap-4 p-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-md group"
              >
                <div className="p-2 bg-white/10 rounded-lg group-hover:scale-110 transition-transform">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-green-100 uppercase leading-none mb-0.5">Contact Direct</p>
                  <p className="text-lg font-bold tracking-tight">{p.Tel}</p>
                </div>
              </a>
            )}
          </section>

          {/* Section: Performance Indicators */}
          <section className="space-y-2">
             <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
              <Info size={13} className="text-green-600" />
              <span>Indicateurs de Performance</span>
              <div className="flex-1 h-px bg-slate-100 ml-1"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-blue-50/40 p-3 rounded-lg border border-blue-100/50">
                <div className="flex items-center gap-1.5 text-blue-600 mb-1.5">
                  <Users size={12} />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Adhérents</span>
                </div>
                <div className="text-lg font-bold text-slate-800 leading-none">{p["Nombre des adherents"] || p["Nombre des adhérents"] || 0}</div>
              </div>
              <div className="bg-emerald-50/40 p-3 rounded-lg border border-emerald-100/50">
                <div className="flex items-center gap-1.5 text-emerald-600 mb-1.5">
                  <Coins size={12} />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Capital</span>
                </div>
                <div className="text-base font-bold text-slate-800 truncate">
                  {p["Capital social"] || "---"} <span className="text-[9px] font-medium text-slate-500">DH</span>
                </div>
              </div>
              <div className="bg-pink-50/40 p-3 rounded-lg border border-pink-100/50">
                <div className="flex items-center gap-1.5 text-pink-600 mb-1.5">
                  <User size={12} />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Femmes</span>
                </div>
                <div className="text-lg font-bold text-slate-800 leading-none">{p["Nombre des femmes"] || 0}</div>
              </div>
              <div className="bg-orange-50/40 p-3 rounded-lg border border-orange-100/50">
                <div className="flex items-center gap-1.5 text-orange-600 mb-1.5">
                  <Calendar size={12} />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Jeunes</span>
                </div>
                <div className="text-lg font-bold text-slate-800 leading-none">{p["Nombre des jeunes"] || 0}</div>
              </div>
            </div>
          </section>

          {/* Section: Creation Info Footer */}
          <div className="flex items-center gap-3 p-4 bg-slate-50/80 rounded-xl border border-slate-100 mt-2">
             <div className="p-2.5 bg-white rounded-lg shadow-sm text-slate-400">
              <Calendar size={18} />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1">Date de création</p>
              <p className="text-[13px] font-bold text-slate-700">{p["Date de création"] || "Non définie"}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DetailPanel;
