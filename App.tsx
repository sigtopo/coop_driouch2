
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
// افترضنا وجود ملفات الحدود في نفس المستودع، إذا لم تكن موجودة ستفشل الطلبات بصمت
const COMMUNES_BOUNDS_URL = "https://raw.githubusercontent.com/sigtopo/coop_driouch/refs/heads/main/Communes_Driouch.geojson";
const PROVINCE_BOUNDS_URL = "https://raw.githubusercontent.com/sigtopo/coop_driouch/refs/heads/main/Province_Driouch.geojson";

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

  // إنشاء أيقونة زرقاء دائرية
  const createCustomIcon = (isSelected: boolean) => {
    const mainColor = isSelected ? '#ef4444' : '#2563eb';
    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div class="flex items-center justify-center">
          <div class="w-3 h-3 rounded-full bg-white border-2 shadow-sm ${isSelected ? 'border-red-500 scale-150' : 'border-blue-600'} flex items-center justify-center transition-all">
            <div class="w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-red-500' : 'bg-blue-600'}"></div>
          </div>
        </div>
      `,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });
  };

  const onEachFeature = (feature: CooperativeFeature, layer: L.Layer) => {
    const name = feature.properties['Nom de coopérative'] || feature.properties.Nom_Coop || "Coop";
    
    // ربط تسمية دائمة فوق النقطة
    layer.bindTooltip(name, {
      permanent: true,
      direction: 'top',
      offset: [0, -10],
      className: 'coop-label-tooltip'
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

            {/* حدود الإقليم - غير قابلة للتحديد */}
            {provinceBounds && (
              <GeoJSON 
                data={provinceBounds} 
                interactive={false}
                style={{
                  color: "#1e3a8a",
                  weight: 3,
                  fillOpacity: 0,
                  dashArray: "5, 10"
                }}
              />
            )}

            {/* حدود الجماعات - غير قابلة للتحديد */}
            {communesBounds && (
              <GeoJSON 
                data={communesBounds} 
                interactive={false}
                style={{
                  color: "#64748b",
                  weight: 1,
                  fillOpacity: 0.02,
                  fillColor: "#f1f5f9"
                }}
              />
            )}

            {filteredFeatures.length > 0 && (
              <GeoJSON 
                key={JSON.stringify(filteredFeatures.length + (selectedCoop?.properties?.id || '') + mapLayer)}
                data={{ type: "FeatureCollection", features: filteredFeatures } as any} 
                onEachFeature={onEachFeature}
                pointToLayer={(feature, latlng) => {
                  const isSelected = selectedCoop?.properties.id === feature.properties.id || 
                                     selectedCoop?.properties['Nom de coopérative'] === feature.properties['Nom de coopérative'];
                  return L.marker(latlng, { icon: createCustomIcon(isSelected) });
                }}
              />
            )}
            <MapFlyTo feature={selectedCoop} />
          </MapContainer>

          <div className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 p-1.5 gap-1">
            <button 
              onClick={() => setMapLayer('standard')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${mapLayer === 'standard' ? 'bg-blue-700 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Vue Plan
            </button>
            <button 
              onClick={() => setMapLayer('satellite')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${mapLayer === 'satellite' ? 'bg-blue-700 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
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
