
import React from 'react';
import { Search, ChevronLeft, MapPin, Filter, RotateCcw, X } from 'lucide-react';
import { CooperativeFeature } from '../types';

interface SidebarProps {
  isOpen: boolean;
  setOpen: (v: boolean) => void;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  features: CooperativeFeature[];
  selectedId: any;
  onSelect: (f: CooperativeFeature) => void;
  filterCommune: string;
  setFilterCommune: (v: string) => void;
  filterGenre: string;
  setFilterGenre: (v: string) => void;
  filterSecteur: string;
  setFilterSecteur: (v: string) => void;
  filterNiveau: string;
  setFilterNiveau: (v: string) => void;
  options: {
    communes: string[];
    genres: string[];
    secteurs: string[];
    niveaux: string[];
  };
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  setOpen, 
  searchTerm, 
  setSearchTerm, 
  features, 
  selectedId, 
  onSelect,
  filterCommune,
  setFilterCommune,
  filterGenre,
  setFilterGenre,
  filterSecteur,
  setFilterSecteur,
  filterNiveau,
  setFilterNiveau,
  options
}) => {

  const resetFilters = () => {
    setSearchTerm("");
    setFilterCommune("");
    setFilterGenre("");
    setFilterSecteur("");
    setFilterNiveau("");
  };

  if (!isOpen) return null;

  return (
    <aside 
      className={`fixed inset-0 md:relative bg-white border-r border-gray-200 flex flex-col z-[3000] md:z-[2000] shadow-2xl md:shadow-none w-full md:w-80 transition-all`}
    >
      {/* زر إغلاق القائمة للديسكتوب (السهم الجانبي) */}
      <button 
        onClick={() => setOpen(false)}
        className="hidden md:flex absolute -right-8 top-6 p-2 bg-white border border-gray-200 rounded-r-lg shadow-md hover:bg-gray-50 text-gray-500 z-[2001]"
      >
        <ChevronLeft size={20} />
      </button>

      {/* منطقة البحث والفلترة */}
      <div className="p-4 bg-gray-50 border-b border-gray-200 space-y-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Rechercher une coopérative..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 bg-white shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          </div>
          
          {/* زر إغلاق للموبايل فقط */}
          <button 
            onClick={() => setOpen(false)}
            className="md:hidden p-2.5 bg-white border border-gray-300 rounded-xl text-gray-500 hover:bg-gray-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Commune</label>
            <select 
              className="w-full p-2 text-xs border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-green-500"
              value={filterCommune}
              onChange={(e) => setFilterCommune(e.target.value)}
            >
              <option value="">Toutes</option>
              {options.communes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Genre</label>
            <select 
              className="w-full p-2 text-xs border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-green-500"
              value={filterGenre}
              onChange={(e) => setFilterGenre(e.target.value)}
            >
              <option value="">Tous</option>
              {options.genres.map(g => <option key={g} value={g}>{g === 'M' ? 'Homme' : g === 'F' ? 'Femme' : g}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Secteur</label>
            <select 
              className="w-full p-2 text-xs border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-green-500"
              value={filterSecteur}
              onChange={(e) => setFilterSecteur(e.target.value)}
            >
              <option value="">Tous</option>
              {options.secteurs.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Niveau</label>
            <select 
              className="w-full p-2 text-xs border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-green-500"
              value={filterNiveau}
              onChange={(e) => setFilterNiveau(e.target.value)}
            >
              <option value="">Tous</option>
              {options.niveaux.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        <button 
          onClick={resetFilters}
          className="w-full py-2 flex items-center justify-center gap-2 text-[10px] font-bold text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition border border-green-100"
        >
          <RotateCcw size={12} />
          RÉINITIALISER LES FILTRES
        </button>
      </div>

      {/* منطقة القائمة */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
        {features.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 text-sm">
            <Filter size={40} className="mb-3 opacity-10" />
            <p className="font-medium">Aucun résultat trouvé</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {features.map((f, idx) => (
              <button
                key={idx}
                onClick={() => onSelect(f)}
                className={`w-full text-left p-5 hover:bg-green-50 transition border-l-4 group
                  ${selectedId === f.properties.id ? 'bg-green-50 border-green-700' : 'border-transparent'}`}
              >
                <div className="font-extrabold text-gray-900 group-hover:text-green-800 transition-colors mb-1 text-sm leading-snug">
                  {f.properties['Nom de coopérative'] || "Coopérative Sans Nom"}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold tracking-tight">
                  <MapPin size={10} className="text-green-600 shrink-0" />
                  <span className="truncate uppercase">{f.properties.Commune || "Driouch"}</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-green-700 whitespace-nowrap">{f.properties["Filière d'activité"] || "Activités"}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-200 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest shrink-0">
        {features.length} Coopératives affichées
      </div>
    </aside>
  );
};

export default Sidebar;
