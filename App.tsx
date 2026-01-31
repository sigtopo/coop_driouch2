
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
const COMMUNES_BOUNDS_URL = "https://raw.githubusercontent.com/sigtopo/coop_driouch/refs/heads/main/Communes_Driouch.geojson";
const PROVINCE_BOUNDS_URL = "https://raw.githubusercontent.com/sigtopo/coop_driouch/refs/heads/main/PROVINCE_DRIOUCH.geojson";

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
  const [communesBounds, setCommunesBounds] = useState<any>(null);
  const [provinceBounds, setProvinceBounds] = useState<any>(null);
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
        const [resCoops, resCommunes, resProvince] = await Promise.all([
          fetch(GEOJSON_URL),
          fetch(COMMUNES_BOUNDS_URL).catch(() => null),
          fetch(PROVINCE_BOUNDS_URL).catch(() => null)
        ]);

        if (resCoops.ok) {
          const json = await resCoops.json();
          setData(json);
        }

        if (resCommunes?.ok) setCommunesBounds(await resCommunes.json());
        if (resProvince?.ok) setProvinceBounds(await resProvince.json());

      } catch (err: any) {
        console.error("Erreur de chargement:", err);
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
    const searchStr = searchTerm.toLowerCase().trim();
    
    const filtered = data.features.filter(f => {
      const p = f.properties;
      const coopName = (p['Nom de coopérative'] || p.Nom_Coop || "").toLowerCase();
      const presidentName = (p['Nom et prénom président/gestionnaire'] || "").toLowerCase();
      
      const matchesSearch = !searchStr || 
        coopName.includes(searchStr) || 
        presidentName.includes(searchStr);

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

  // Enhanced Icon Creation: Distinguishes selected from non-selected
  const createCustomIcon = (isSelected: boolean) => {
    if (isSelected) {
      return L.divIcon({
        className: 'custom-div-icon-selected',
        html: `
          <div class="flex items-center justify-center">
            <div class="relative">
              <!-- Animated Pulse Effect -->
              <div class="absolute inset-0 w-8 h-8 -mt-1.5 -ml-1.5 bg-orange-500/40 rounded-full animate-ping"></div>
              <!-- Professional Pin Container -->
              <div class="relative flex flex-col items-center">
                <!-- Main Circle -->
                <div class="w-6 h-6 rounded-full bg-orange-600 border-2 border-white shadow-lg flex items-center justify-center z-20">
                  <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
                </div>
                <!-- Triangle Pointer -->
                <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-orange-600 -mt-1.5 z-10"></div>
              </div>
            </div>
          </div>
        `,
        iconSize: [32, 40],
        iconAnchor: [16, 32]
      });
    }

    // Standard Non-selected Icon (Professional Blue Dot)
    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div class="flex items-center justify-center">
          <div class="w-3.5 h-3.5 rounded-full bg-white border-2 border-blue-500 shadow-sm flex items-center justify-center hover:scale-110 transition-transform">
            <div class="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
          </div>
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };

  const onEachFeature = (feature: CooperativeFeature, layer: L.Layer) => {
    const name = feature.properties['Nom de coopérative'] || feature.properties.Nom_Coop || "Coop";
    const [lng, lat] = feature.geometry.coordinates;
    const gMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    
    layer.bindTooltip(name, {
      permanent: false,
      direction: 'top',
      offset: [0, -15],
      className: 'coop-label-tooltip',
      opacity: 0.9,
      sticky: true
    });

    layer.bindPopup(`
      <div class="flex items-center justify-between gap-4 py-1 min-w-[140px]">
        <div class="text-xs font-bold text-gray-900 leading-tight">${name}</div>
        <a href="${gMapsUrl}" target="_blank" rel="noopener noreferrer" 
           class="flex items-center justify-center p-1.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-lg transition-all" 
           onclick="event.stopPropagation()">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </a>
      </div>
    `, {
      closeButton: false,
      offset: [0, -25]
    });

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
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-white text-blue-800">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <h2 className="text-xl font-bold font-sans tracking-tight">Chargement des données...</h2>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden font-sans bg-white">
      <Header 
        onMenuClick={() => setSidebarOpen(true)} 
        mapLayer={mapLayer}
        setMapLayer={setMapLayer}
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

            {provinceBounds && (
              <GeoJSON 
                data={provinceBounds} 
                interactive={false}
                style={{
                  color: "#ff0000",
                  weight: 6,
                  fillOpacity: 0,
                  dashArray: ""
                }}
              />
            )}

            {communesBounds && (
              <GeoJSON 
                data={communesBounds} 
                interactive={false}
                style={{
                  color: "#94a3b8",
                  weight: 1,
                  fillOpacity: 0.02,
                  fillColor: "#94a3b8"
                }}
              />
            )}

            {filteredFeatures.length > 0 && (
              <GeoJSON 
                key={JSON.stringify(filteredFeatures.length + (selectedCoop?.properties?.id || '') + mapLayer)}
                data={{ type: "FeatureCollection", features: filteredFeatures } as any} 
                onEachFeature={onEachFeature}
                pointToLayer={(feature, latlng) => {
                  const isSelected = selectedCoop?.properties.id === feature.properties.id;
                  return L.marker(latlng, { icon: createCustomIcon(isSelected) });
                }}
              />
            )}
            <MapFlyTo feature={selectedCoop} />
          </MapContainer>

          {selectedCoop && (
            <DetailPanel 
              coop={selectedCoop} 
              onClose={() => setSelectedCoop(null)} 
            />
          )}

          {!isSidebarOpen && (
            <button 
              onClick={() => setSidebarOpen(true)}
              className="hidden md:flex absolute top-4 left-4 z-[1000] p-3 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 text-blue-700 transition-transform hover:scale-110"
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
