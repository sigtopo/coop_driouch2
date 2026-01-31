
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  X, 
  Search,
  Phone, 
  User, 
  Building2,
  Map,
  ChevronUp,
  ChevronDown,
  Globe,
  CheckCircle2
} from 'lucide-react';
import { CooperativeFeature } from '../types';

interface DetailPanelProps {
  selectedCoop: CooperativeFeature | null;
  allCoops: CooperativeFeature[];
  onSelect: (f: CooperativeFeature) => void;
  onClose: () => void;
}

const DetailPanel: React.FC<DetailPanelProps> = ({ selectedCoop, allCoops, onSelect, onClose }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Dragging State
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const initialPos = useRef({ x: 0, y: 0 });

  const p = selectedCoop?.properties;

  // Autocomplete Logic
  const suggestions = useMemo(() => {
    if (!localSearch || localSearch.length < 2) return [];
    const term = localSearch.toLowerCase();
    return allCoops.filter(f => {
      const name = (f.properties['Nom de coopérative'] || f.properties.Nom_Coop || "").toLowerCase();
      const president = (f.properties['Nom et prénom président/gestionnaire'] || "").toLowerCase();
      return name.includes(term) || president.includes(term);
    }).slice(0, 6);
  }, [localSearch, allCoops]);

  // Handle outside click
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Dragging Logic handlers
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (window.innerWidth < 768) return; // Disable dragging on mobile
    
    // Only allow drag from the top handle area or the header background
    // but not from buttons or inputs
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input')) return;

    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    initialPos.current = { x: position.x, y: position.y };
    
    // Prevent text selection while dragging
    e.preventDefault();
  }, [position]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const dx = e.clientX - dragStartPos.current.x;
      const dy = e.clientY - dragStartPos.current.y;
      
      setPosition({
        x: initialPos.current.x + dx,
        y: initialPos.current.y + dy
      });
    };

    const onMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging]);

  // When a coop is selected via map, automatically close search and show panel
  useEffect(() => {
    if (selectedCoop) {
      setIsSearchOpen(false);
      setShowSuggestions(false);
    }
  }, [selectedCoop]);

  const [lng, lat] = selectedCoop?.geometry.coordinates || [0, 0];
  const gMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  const formatGenre = (g: string) => {
    if (g === 'M') return 'Homme (ذكر)';
    if (g === 'F') return 'Femme (أنثى)';
    return g || 'N/A';
  };

  const closeEverything = () => {
    setIsSearchOpen(false);
    onClose();
    setIsExpanded(false);
    setLocalSearch("");
    // Optionally reset position on close
    // setPosition({ x: 0, y: 0 });
  };

  // IF NOTHING IS SELECTED AND SEARCH IS CLOSED: SHOW ONLY FLOATING ICON
  if (!selectedCoop && !isSearchOpen) {
    return (
      <div 
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[4000] pointer-events-auto"
        style={{ transform: `translate(calc(-50% + ${position.x}px), ${position.y}px)` }}
        onMouseDown={onMouseDown}
      >
        <button 
          onClick={() => setIsSearchOpen(true)}
          className="w-14 h-14 bg-green-600 text-white rounded-full shadow-[0_8px_25px_rgba(22,163,74,0.4)] hover:bg-green-700 hover:scale-110 transition-all flex items-center justify-center border-4 border-white"
          title="Rechercher"
        >
          <Search size={24} strokeWidth={2.5} />
        </button>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`fixed bottom-0 left-0 right-0 z-[4000] flex justify-center p-0 md:p-4 pointer-events-none transition-all duration-500 ease-in-out ${isExpanded ? 'h-[85vh]' : 'h-auto'} ${isDragging ? 'duration-0' : ''}`}
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
    >
      <div 
        className={`bg-white w-full max-w-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.15)] pointer-events-auto transition-all duration-500 flex flex-col border border-slate-200/60
          ${isExpanded ? 'rounded-t-3xl h-full' : 'rounded-t-[2rem] h-auto mb-0 md:mb-2 md:rounded-2xl'} ${isDragging ? 'duration-0 scale-[1.01] shadow-2xl ring-2 ring-green-500/20' : ''}`}
      >
        {/* Drag Handle Area */}
        <div 
          className={`flex flex-col items-center py-2 cursor-grab active:cursor-grabbing shrink-0 transition-colors ${isDragging ? 'bg-slate-50 rounded-t-[2rem] md:rounded-t-2xl' : ''}`}
          onMouseDown={onMouseDown}
        >
          <div className="w-12 h-1 bg-slate-300 rounded-full"></div>
          <div className="md:hidden w-full text-center mt-1">
             <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">DÉPLACER</span>
          </div>
        </div>

        {/* --- Header Area --- */}
        <div className="px-5 pb-4" onMouseDown={onMouseDown}>
          <div className="flex justify-between items-center gap-3">
            
            <div className="flex-1 min-w-0">
              {isSearchOpen ? (
                <div className="relative animate-in slide-in-from-bottom-2 duration-200">
                  <div className="relative group">
                    <input
                      autoFocus
                      type="text"
                      placeholder="Rechercher une coopérative..."
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/50 transition-all font-medium text-slate-700 placeholder:text-slate-400 shadow-sm"
                      value={localSearch}
                      onFocus={() => setShowSuggestions(true)}
                      onChange={(e) => {
                        setLocalSearch(e.target.value);
                        setShowSuggestions(true);
                      }}
                    />
                    <Search className="absolute left-3.5 top-3 text-green-600" size={18} />
                  </div>
                </div>
              ) : selectedCoop ? (
                <div className="animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Building2 size={16} className="text-green-600 shrink-0" />
                    <h3 className="text-[15px] font-bold text-slate-800 truncate leading-tight">
                      {p?.['Nom de coopérative'] || p?.Nom_Coop}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold">
                    <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded uppercase tracking-wide border border-blue-100/50">
                      {p?.Commune}
                    </span>
                    <span className="truncate opacity-70 italic font-medium">{p?.["Filière d'activité"]}</span>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Right Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {selectedCoop && !isSearchOpen && (
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={`p-2 rounded-full transition-all duration-300 border ${isExpanded ? 'bg-orange-600 text-white border-orange-700 shadow-orange-200 shadow-md' : 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100'}`}
                >
                  {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                </button>
              )}
              
              <button 
                onClick={closeEverything}
                className="p-2 bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 rounded-full transition-all border border-slate-200 hover:border-red-100"
                title="Fermer"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && showSuggestions && suggestions.length > 0 && (
            <div className="absolute bottom-full mb-3 left-5 right-5 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 z-[5000] pointer-events-auto">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => {
                    onSelect(s);
                    setLocalSearch("");
                    setShowSuggestions(false);
                    setIsSearchOpen(false);
                    setIsExpanded(false);
                  }}
                  className="w-full text-left p-4 hover:bg-green-50/50 flex flex-col border-b border-slate-50 last:border-0 transition-colors group"
                >
                  <span className="text-sm font-bold text-slate-800 group-hover:text-green-800 truncate">
                    {s.properties['Nom de coopérative'] || s.properties.Nom_Coop}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-green-700 font-black uppercase tracking-tighter bg-green-50 px-1.5 rounded-md border border-green-100">
                      {s.properties.Commune}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate italic font-medium">
                      Pres: {s.properties["Nom et prénom président/gestionnaire"] || "---"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* --- Content Area --- */}
        {selectedCoop && (
          <div className={`overflow-y-auto custom-scrollbar px-5 pb-6 space-y-5 transition-all duration-500 ${isExpanded ? 'opacity-100 flex-1' : 'h-0 opacity-0 pointer-events-none'}`}>
            
            <div className="flex justify-center pt-2">
              <a href={gMapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100 hover:bg-blue-100 transition-all shadow-sm active:scale-95">
                <Map size={14} /> Localiser sur Google Maps
              </a>
            </div>

            <section className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                <Globe size={12} className="text-green-600" />
                <span>Identification Administrative</span>
                <div className="flex-1 h-px bg-slate-100"></div>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Commune</label>
                  <p className="text-[13px] font-bold text-slate-700">{p?.Commune || "---"}</p>
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Douar / Quartier</label>
                  <p className="text-[13px] font-bold text-slate-700 truncate">{p?.["Douar/Quartier"] || "---"}</p>
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Filière</label>
                  <p className="text-[13px] font-bold text-slate-700">{p?.["Filière d'activité"] || "---"}</p>
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Date Création</label>
                  <p className="text-[13px] font-bold text-slate-700">{p?.["Date de création"] || "---"}</p>
                </div>
              </div>
            </section>

            <section className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                <User size={12} className="text-green-600" />
                <span>Profil du Dirigeant</span>
                <div className="flex-1 h-px bg-slate-100"></div>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <div className="mb-4 border-b border-slate-100 pb-3">
                   <p className="text-base font-black text-slate-800">
                    {p?.["Nom et prénom président/gestionnaire"] || "Non spécifié"}
                  </p>
                  {p?.Tel && (
                    <a href={`tel:${p.Tel}`} className="text-sm text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1.5 mt-1.5 transition-colors">
                      <Phone size={14} className="shrink-0" /> {p.Tel}
                    </a>
                  )}
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100/50">
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-0.5 text-center">Genre</span>
                    <span className="block text-[10px] text-slate-700 font-bold text-center">{formatGenre(p?.Genre || "")}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100/50">
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-0.5 text-center">Naissance</span>
                    <span className="block text-[10px] text-slate-700 font-bold text-center">{p?.["Date de naissance"] || "---"}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100/50">
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-0.5 text-center">Scolarité</span>
                    <span className="block text-[10px] text-slate-700 font-bold text-center truncate">{p?.["Niveau scolaire"] || "---"}</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-2 pb-2">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                <CheckCircle2 size={12} className="text-green-600" />
                <span>Indicateurs de Performance</span>
                <div className="flex-1 h-px bg-slate-100"></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50/30 p-4 rounded-2xl border border-green-100/50 flex flex-col">
                  <span className="text-[9px] font-black text-green-600/70 uppercase mb-1">Total Adhérents</span>
                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-black text-slate-800 leading-none">{p?.["Nombre des adherents"] || p?.["Nombre des adhérents"] || 0}</span>
                  </div>
                </div>
                <div className="bg-blue-50/30 p-4 rounded-2xl border border-blue-100/50 flex flex-col">
                  <span className="text-[9px] font-black text-blue-600/70 uppercase mb-1">Capital Social</span>
                  <div className="flex items-end gap-1">
                    <span className="text-xl font-black text-slate-800 leading-none truncate">{p?.["Capital social"] || "0"}</span>
                    <span className="text-[10px] font-black text-blue-600/50">DH</span>
                  </div>
                </div>
                <div className="bg-pink-50/40 p-4 rounded-2xl border border-pink-100/50 flex flex-col">
                  <span className="text-[9px] font-black text-pink-500/70 uppercase mb-1">Femmes</span>
                  <span className="text-2xl font-black text-pink-700 leading-none">{p?.["Nombre des femmes"] || 0}</span>
                </div>
                <div className="bg-orange-50/40 p-4 rounded-2xl border border-orange-100/50 flex flex-col">
                  <span className="text-[9px] font-black text-orange-500/70 uppercase mb-1">Jeunes (-35 ans)</span>
                  <span className="text-2xl font-black text-orange-700 leading-none">{p?.["Nombre des jeunes"] || 0}</span>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailPanel;
