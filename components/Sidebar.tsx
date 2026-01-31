
import React from 'react';
import { Search, ChevronLeft, MapPin, Filter, RotateCcw, X, User } from 'lucide-react';
import { CooperativeFeature } from '../types.ts';

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
      <button 
        onClick={() => setOpen(false)}
        className="hidden md:flex absolute -right-8 top-6 p-2 bg-white border border-gray-200 rounded-r-lg shadow-md hover:bg-gray-50 text-gray-500 z-[2001]"
      >
        <ChevronLeft size={20} />
      </button>

      <div className="p-4 bg-gray-50 border-b border-gray-200 space-y-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Nom ou Président..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          </div>
          
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
              className="w-full p-2 text-xs border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-blue-500"
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
              className="w-full p-2 text-xs border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-blue-500"
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
              className="w-full p-2 text-xs border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-blue-500"
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
              className="w-full p-2 text-xs border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-blue-500"
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
          className="w-full py-2 flex items-center justify-center gap-2 text-[10px] font-bold text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition border border-gray-300"
        >
          <RotateCcw size={12} />
          RÉINITIALISER LES FILTRES
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
        {features.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 text-sm">
            <Filter size={40} className="mb-3 opacity-10" />
            <p className="font-medium">Aucun résultat trouvé</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 shadow-inner">
            {features.map((f, idx) => (
              <button
                key={idx}
                onClick={() => onSelect(f)}
                className={`w-full text-left p-4 hover:bg-gray-50 transition border-l-4 group
                  ${selectedId === f.properties.id ? 'bg-blue-50/50 border-blue-600' : 'border-transparent'}`}
              >
                <div className="font-extrabold text-gray-900 group-hover:text-blue-900 transition-colors mb-2 text-[13px] leading-tight uppercase">
                  {f.properties['Nom de coopérative'] || f.properties.Nom_Coop || "Coopérative Sans Nom"}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-red-900 font-medium">
                    <MapPin size={11} className="text-red-900 shrink-0" />
                    <span className="truncate uppercase tracking-tight">{f.properties.Commune || "Driouch"}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-blue-700 font-medium">
                    <User size={11} className="text-blue-700 shrink-0" />
                    <span className="truncate italic">
                      {f.properties["Nom et prénom président/gestionnaire"] || "N/A"}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 bg-gray-50 border-t border-gray-200 text-center text-[10px] text-gray-500 font-bold uppercase tracking-widest shrink-0">
        Jilit©2026 Agri Invest Development
      </div>
    </aside>
  );
};

export default Sidebar;
