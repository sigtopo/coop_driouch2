
import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Loader2,
  Menu
} from 'lucide-react';
import { CooperativeGeoJSON, CooperativeFeature } from './types';
import Sidebar from './components/Sidebar';
import DetailPanel from './components/DetailPanel';
import Header from './components/Header';

const GEOJSON_URL = "https://raw.githubusercontent.com/sigtopo/coop_driouch/refs/heads/main/CooperativesDriouch.geojson";

const LAYERS = {
  standard: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  satellite: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
};

const MapFlyTo: React.FC<{ feature: CooperativeFeature | null }> = ({ feature }) => {
  const map = useMap();
  useEffect(() => {
    if (feature && feature.geometry.type === 'Point') {
      const [lng, lat] = feature.geometry.coordinates;
      map.flyTo([lat, lng], 16, { duration: 1.2, easeLinearity: 0.25 });
    }
  }, [feature, map]);
  return null;
};

const App: React.FC = () => {
  const [data, setData] = useState<CooperativeGeoJSON | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCoop, setSelectedCoop] = useState<CooperativeFeature | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [mapLayer, setMapLayer] = useState<'standard' | 'satellite'>('standard');
  
  const [filterCommune, setFilterCommune] = useState("");
  const [filterGenre, setFilterGenre] = useState("");
  const [filterSecteur, setFilterSecteur] = useState("");
  const [filterNiveau, setFilterNiveau] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(GEOJSON_URL);
        if (!response.ok) throw new Error("Échec du chargement");
        const json: CooperativeGeoJSON = await response.json();
        setData(json);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filterOptions = useMemo(() => {
    if (!data) return { communes: [], genres: [], secteurs: [], niveaux: [] };
    const communes = new Set<string>();
    const genres = new Set<string>();
    const secteurs = new Set<string>();
    const niveaux = new Set<string>();
    data.features.forEach(f => {
      const p = f.properties;
      if (p.Commune) communes.add(p.Commune);
      if (p.Genre) genres.add(p.Genre);
      if (p["Filière d'activité"]) secteurs.add(p["Filière d'activité"]);
      if (p["Niveau scolaire"]) niveaux.add(p["Niveau scolaire"]);
    });
    return {
      communes: Array.from(communes).sort(),
      genres: Array.from(genres).sort(),
      secteurs: Array.from(secteurs).sort(),
      niveaux: Array.from(niveaux).sort()
    };
  }, [data]);

  const filteredFeatures = useMemo(() => {
    if (!data) return [];
    const filtered = data.features.filter(f => {
      const p = f.properties;
      const searchStr = searchTerm.toLowerCase();
      const matchesSearch = Object.values(p).some(val => String(val).toLowerCase().includes(searchStr));
      const matchesCommune = !filterCommune || p.Commune === filterCommune;
      const matchesGenre = !filterGenre || p.Genre === filterGenre;
      const matchesSecteur = !filterSecteur || p["Filière d'activité"] === filterSecteur;
      const matchesNiveau = !filterNiveau || p["Niveau scolaire"] === filterNiveau;
      return matchesSearch && matchesCommune && matchesGenre && matchesSecteur && matchesNiveau;
    });
    return filtered.sort((a, b) => {
      const nameA = (a.properties['Nom de coopérative'] || a.properties.Nom_Coop || "").toLowerCase();
      const nameB = (b.properties['Nom de coopérative'] || b.properties.Nom_Coop || "").toLowerCase();
      return nameA.localeCompare(nameB, 'fr');
    });
  }, [data, searchTerm, filterCommune, filterGenre, filterSecteur, filterNiveau]);

  const createCustomIcon = (name: string, isSelected: boolean) => {
    const color = isSelected ? '#f97316' : (mapLayer === 'satellite' ? '#4ade80' : '#16a34a');
    const borderColor = isSelected ? 'border-orange-500' : (mapLayer === 'satellite' ? 'border-green-400' : 'border-green-600');
    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div class="flex items-center gap-1 group">
          <div class="flex items-center justify-center w-6 h-6 bg-white border-2 ${borderColor} ${isSelected ? 'scale-125' : ''} rounded-full shadow-md transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m12 10 2 4v3a1 1 0 0 0 1 1h2a1 1 0 0 1 1 1v2H6v-2a1 1 0 0 1 1-1h2a1 1 0 0 0 1-1v-3l2-4Z"/><path d="M7 2h10"/><path d="M12 2v5"/><path d="M9 4v2"/><path d="M15 4v2"/></svg>
          </div>
          <div class="bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded border border-gray-200 shadow-sm text-[10px] font-bold text-gray-800 whitespace-nowrap hidden group-hover:block ${isSelected ? 'block !bg-orange-50 !border-orange-200' : ''}">
            ${name}
          </div>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [12, 12]
    });
  };

  const onEachFeature = (feature: CooperativeFeature, layer: L.Layer) => {
    layer.on({
      click: (e) => {
        L.DomEvent.stopPropagation(e);
        setSelectedCoop(feature);
        if (window.innerWidth < 768) setSidebarOpen(false);
      }
    });
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-white text-green-800">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <h2 className="text-xl font-bold font-sans tracking-tight">Chargement des données...</h2>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden font-sans bg-white">
      <Header 
        onMenuClick={() => setSidebarOpen(true)} 
        onLayerToggle={() => setMapLayer(prev => prev === 'standard' ? 'satellite' : 'standard')}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar 
          isOpen={isSidebarOpen} 
          setOpen={setSidebarOpen}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          features={filteredFeatures}
          selectedId={selectedCoop?.properties.id}
          onSelect={(f) => {
            setSelectedCoop(f);
            if (window.innerWidth < 768) setSidebarOpen(false);
          }}
          filterCommune={filterCommune}
          setFilterCommune={setFilterCommune}
          filterGenre={filterGenre}
          setFilterGenre={setFilterGenre}
          filterSecteur={filterSecteur}
          setFilterSecteur={setFilterSecteur}
          filterNiveau={filterNiveau}
          setFilterNiveau={setFilterNiveau}
          options={filterOptions}
        />

        <main className="flex-1 relative h-full">
          <MapContainer 
            center={[34.98, -3.38]} 
            zoom={10} 
            className="h-full w-full"
            zoomControl={false}
          >
            <TileLayer
              key={mapLayer}
              attribution={mapLayer === 'standard' ? '&copy; OpenStreetMap' : '&copy; Google Maps'}
              url={LAYERS[mapLayer]}
            />
            {filteredFeatures.length > 0 && (
              <GeoJSON 
                key={JSON.stringify(filteredFeatures.length + filterCommune + filterGenre + filterSecteur + filterNiveau + (selectedCoop?.properties?.id || '') + mapLayer)}
                data={{ type: "FeatureCollection", features: filteredFeatures } as any} 
                onEachFeature={onEachFeature}
                pointToLayer={(feature, latlng) => {
                  const name = feature.properties['Nom de coopérative'] || feature.properties.Nom_Coop || "Coop";
                  const isSelected = selectedCoop?.properties.id === feature.properties.id || 
                                     selectedCoop?.properties['Nom de coopérative'] === feature.properties['Nom de coopérative'];
                  return L.marker(latlng, { icon: createCustomIcon(name, isSelected) });
                }}
              />
            )}
            <MapFlyTo feature={selectedCoop} />
          </MapContainer>

          <div className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 p-1.5 gap-1">
            <button 
              onClick={() => setMapLayer('standard')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${mapLayer === 'standard' ? 'bg-green-700 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Vue Plan
            </button>
            <button 
              onClick={() => setMapLayer('satellite')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${mapLayer === 'satellite' ? 'bg-green-700 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Vue Satellite
            </button>
          </div>

          {selectedCoop && (
            <DetailPanel 
              coop={selectedCoop} 
              onClose={() => setSelectedCoop(null)} 
            />
          )}

          {!isSidebarOpen && (
            <button 
              onClick={() => setSidebarOpen(true)}
              className="hidden md:flex absolute top-4 left-4 z-[1000] p-3 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 text-green-700 transition-transform hover:scale-110"
            >
              <Menu size={24} />
            </button>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
