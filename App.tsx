
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Loader2,
  Menu,
  Home,
  RefreshCcw
} from 'lucide-react';
import { CooperativeGeoJSON, CooperativeFeature } from './types.ts';
import Sidebar from './components/Sidebar.tsx';
import DetailPanel from './components/DetailPanel.tsx';
import Header from './components/Header.tsx';
import AIInsights from './components/AIInsights.tsx';


// روابط البيانات الأساسية من GitHub
const GEOJSON_URL = "https://raw.githubusercontent.com/sigtopo/SIGAID/refs/heads/main/CooperativesDriouch.geojson";
const COMMUNES_BOUNDS_URL = "https://raw.githubusercontent.com/sigtopo/SIGAID/refs/heads/main/COMMUNES_DRIOUCH.geojson";
const PROVINCE_BOUNDS_URL = "https://raw.githubusercontent.com/geotoposig/AIDSIG/refs/heads/main/PROVINCE_DRIOUCH.geojson";


const LAYERS = {
  standard: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  satellite: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
};

// مركز تقريبي لإقليم الدريوش كبداية سريعة قبل تحميل الحدود
const DRIOUCH_CENTER: [number, number] = [35.0, -3.4];

const MapController: React.FC<{ 
  selectedCoop: CooperativeFeature | null; 
  provinceBounds: any;
  data: CooperativeGeoJSON | null;
  isSidebarOpen: boolean;
  resetTrigger: number;
}> = ({ selectedCoop, provinceBounds, data, isSidebarOpen, resetTrigger }) => {
  const map = useMap();
  const hasInitiallyFit = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize({ animate: true });
    }, 450);
    return () => clearTimeout(timer);
  }, [isSidebarOpen, map]);

  const fitToHome = useCallback(() => {
    let targetBounds: L.LatLngBounds | null = null;

    if (provinceBounds) {
      const geoJsonLayer = L.geoJSON(provinceBounds);
      targetBounds = geoJsonLayer.getBounds();
    } else if (data && data.features.length > 0) {
      const geoJsonLayer = L.geoJSON(data as any);
      targetBounds = geoJsonLayer.getBounds();
    }

    if (targetBounds && targetBounds.isValid()) {
      // إذا كانت المرة الأولى، نقوم بالقفز مباشرة بدون أنيميشن ليظهر الإقليم فوراً
      const isFirstTime = !hasInitiallyFit.current;
      
      map.fitBounds(targetBounds, { 
        padding: window.innerWidth < 768 ? [30, 30] : [70, 70], 
        animate: !isFirstTime,
        duration: isFirstTime ? 0 : 1.5
      });
      hasInitiallyFit.current = true;
    }
  }, [provinceBounds, data, map]);

  // VUE HOME: تفعيل المنظور الشامل للإقليم عند البداية أو عند إعادة التعيين
  useEffect(() => {
    if (!selectedCoop) {
      fitToHome();
    }
  }, [fitToHome, resetTrigger, selectedCoop]);

  useEffect(() => {
    if (selectedCoop && selectedCoop.geometry.type === 'Point') {
      const [lng, lat] = selectedCoop.geometry.coordinates;
      const offset = window.innerWidth < 768 ? 0.007 : 0.0025;
      map.flyTo([lat - offset, lng], 16, {
        duration: 1.8,
        easeLinearity: 0.25
      });
    }
  }, [selectedCoop, map]);

  return null;
};

const App: React.FC = () => {
  const [data, setData] = useState<CooperativeGeoJSON | null>(null);
  const [communesBounds, setCommunesBounds] = useState<any>(null);
  const [provinceBounds, setProvinceBounds] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedCoop, setSelectedCoop] = useState<CooperativeFeature | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [mapLayer, setMapLayer] = useState<'standard' | 'satellite'>('satellite');
  const [isAIModalOpen, setAIModalOpen] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);
  
  const [filterCommune, setFilterCommune] = useState("");
  const [filterGenre, setFilterGenre] = useState("");
  const [filterSecteur, setFilterSecteur] = useState("");
  const [filterNiveau, setFilterNiveau] = useState("");

  const fetchData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    else setRefreshing(true);
    
    try {
      const timestamp = new Date().getTime();
      const [resCoops, resCommunes, resProvince] = await Promise.all([
        fetch(`${GEOJSON_URL}?t=${timestamp}`),
        fetch(`${COMMUNES_BOUNDS_URL}?t=${timestamp}`).catch(() => null),
        fetch(`${PROVINCE_BOUNDS_URL}?t=${timestamp}`).catch(() => null)
      ]);

      if (resCoops.ok) {
        const json = await resCoops.json();
        json.features = json.features.map((f: any, i: number) => ({
          ...f,
          properties: { ...f.properties, id: f.properties.id || `coop-${i}` }
        }));
        setData(json);
        setLastUpdated(new Date());
      }

      if (isInitial) {
        if (resCommunes?.ok) setCommunesBounds(await resCommunes.json());
        if (resProvince?.ok) setProvinceBounds(await resProvince.json());
      }
    } catch (err: any) {
      console.error("Erreur de chargement:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => {
      fetchData(false);
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleHomeClick = () => {
    setSelectedCoop(null);
    setResetTrigger(prev => prev + 1);
  };

  const handleManualRefresh = () => {
    fetchData(false);
  };

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
    
    return data.features.filter(f => {
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
    }).sort((a, b) => {
      const nameA = (a.properties['Nom de coopérative'] || a.properties.Nom_Coop || "").toLowerCase();
      const nameB = (b.properties['Nom de coopérative'] || b.properties.Nom_Coop || "").toLowerCase();
      return nameA.localeCompare(nameB, 'fr');
    });
  }, [data, searchTerm, filterCommune, filterGenre, filterSecteur, filterNiveau]);

  const createCustomIcon = useCallback((isSelected: boolean) => {
    if (isSelected) {
      return L.divIcon({
        className: 'custom-div-icon-selected',
        html: `
          <div class="flex items-center justify-center">
            <div class="relative">
              <div class="absolute inset-0 w-10 h-10 -mt-3 -ml-3 bg-blue-600/20 rounded-full animate-ping"></div>
              <div class="relative flex flex-col items-center">
                <div class="w-9 h-9 rounded-full bg-[#2563eb] border-2 border-white shadow-2xl flex items-center justify-center z-20">
                  <div class="w-2.5 h-2.5 rounded-full bg-white"></div>
                </div>
                <div class="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[12px] border-t-[#2563eb] -mt-2.5 z-10"></div>
              </div>
            </div>
          </div>
        `,
        iconSize: [40, 50],
        iconAnchor: [20, 48]
      });
    }

    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div class="flex items-center justify-center">
          <div class="w-4 h-4 md:w-5 md:h-5 rounded-full bg-white border-[2px] md:border-[2.5px] border-[#2563eb] shadow-md flex items-center justify-center hover:scale-150 transition-all duration-300">
            <div class="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#2563eb]"></div>
          </div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  }, []);

  const onEachFeature = useCallback((feature: CooperativeFeature, layer: L.Layer) => {
    const name = feature.properties['Nom de coopérative'] || feature.properties.Nom_Coop || "Coop";
    layer.bindTooltip(name, {
      permanent: false,
      direction: 'top',
      offset: [0, -10],
      className: 'coop-label-tooltip',
      opacity: 0.9,
      sticky: true
    });
    layer.on({
      click: (e) => {
        L.DomEvent.stopPropagation(e);
        setSelectedCoop(feature);
        if (window.innerWidth < 768) setSidebarOpen(false);
      }
    });
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-white text-slate-800">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <h2 className="text-xl font-bold tracking-tight text-center px-4">Préparation de l'Observatoire...</h2>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden font-sans bg-white text-slate-900">
      <Header 
        onMenuClick={() => setSidebarOpen(true)} 
        mapLayer={mapLayer}
        setMapLayer={setMapLayer}
        lastUpdated={lastUpdated}
        refreshing={refreshing}
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
            center={DRIOUCH_CENTER} 
            zoom={10} 
            className="h-full w-full bg-slate-100"
            zoomControl={false}
            preferCanvas={true}
            scrollWheelZoom={true}
            dragging={true}
            closePopupOnClick={false}
            attributionControl={false}
          >
            <TileLayer
              key={mapLayer}
              url={LAYERS[mapLayer]}
              updateWhenIdle={true}
              keepBuffer={4}
            />

            {provinceBounds && (
              <GeoJSON 
                data={provinceBounds} 
                interactive={false}
                style={{ color: "#dc2626", weight: 3, fillOpacity: 0, dashArray: '6, 6' }}
              />
            )}

            {communesBounds && (
              <GeoJSON 
                data={communesBounds} 
                interactive={false}
                style={{ color: "#475569", weight: 1, fillOpacity: 0.02, dashArray: '2, 4' }}
              />
            )}

            {filteredFeatures.length > 0 && (
              <GeoJSON 
                key={`data-${filteredFeatures.length}-${mapLayer}`}
                data={{ type: "FeatureCollection", features: filteredFeatures } as any} 
                onEachFeature={onEachFeature}
                pointToLayer={(feature, latlng) => {
                  const isSelected = selectedCoop?.properties.id === feature.properties.id;
                  const marker = L.marker(latlng, { 
                    icon: createCustomIcon(isSelected),
                    riseOnHover: true,
                    zIndexOffset: isSelected ? 1000 : 0
                  });
                  
                  if (isSelected) {
                    marker.on('add', () => {
                      marker.bindTooltip(feature.properties['Nom de coopérative'] || feature.properties.Nom_Coop, {
                        permanent: true,
                        direction: 'top',
                        offset: [0, -45],
                        className: 'coop-label-tooltip-persistent'
                      }).openTooltip();
                    });
                  }
                  return marker;
                }}
              />
            )}
            
            <MapController 
              selectedCoop={selectedCoop} 
              provinceBounds={provinceBounds} 
              data={data}
              isSidebarOpen={isSidebarOpen}
              resetTrigger={resetTrigger}
            />
          </MapContainer>

          <DetailPanel 
            selectedCoop={selectedCoop} 
            allCoops={data?.features || []}
            onSelect={(f) => setSelectedCoop(f)}
            onClose={() => setSelectedCoop(null)} 
          />

          <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-3">
            {!isSidebarOpen && (
              <button 
                onClick={() => setSidebarOpen(true)}
                className="hidden md:flex p-3 bg-white rounded-xl shadow-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all active:scale-95 group"
                title="Ouvrir le menu"
              >
                <Menu size={22} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>
            )}

            <button 
              onClick={handleHomeClick}
              className="p-3 bg-white rounded-xl shadow-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all active:scale-95 group"
              title="VUE HOME (Vue Provinciale)"
            >
              <Home size={22} className="group-hover:scale-110 transition-transform" />
            </button>

            <button 
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="p-3 bg-white rounded-xl shadow-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all active:scale-95 group disabled:opacity-50"
              title="Rafraîchir les données"
            >
              <RefreshCcw size={22} className={`${refreshing ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-700`} />
            </button>
          </div>
        </main>
      </div>

      {data && (
        <button 
          onClick={() => setAIModalOpen(true)}
          className="fixed bottom-6 right-6 z-[5000] flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all group"
        >
          <div className="bg-white/20 p-2 rounded-xl group-hover:rotate-12 transition-transform">
             <Loader2 size={20} className={refreshing ? 'animate-spin' : ''} />
          </div>
          <span className="font-bold tracking-tight">Intelligence AI</span>
        </button>
      )}

      <AIInsights 
        isOpen={isAIModalOpen} 
        onClose={() => setAIModalOpen(false)} 
        data={filteredFeatures}
      />
    </div>
  );
};

export default App;
