
import React, { useMemo } from 'react';
import { CooperativeGeoJSON } from '../types.ts';
import { Database, TrendingUp, Users } from 'lucide-react';

interface StatsOverviewProps {
  data: CooperativeGeoJSON;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ data }) => {
  const stats = useMemo(() => {
    const total = data.features.length;
    const sectors = new Set();
    const communes = new Set();
    
    data.features.forEach(f => {
      const sector = f.properties["Filière d'activité"] || f.properties.Secteur;
      if (sector) sectors.add(sector);
      if (f.properties.Commune) communes.add(f.properties.Commune);
    });

    return {
      total,
      sectorsCount: sectors.size,
      communesCount: communes.size
    };
  }, [data]);

  return (
    <div className="flex flex-col gap-2 pointer-events-auto animate-in slide-in-from-right duration-500">
      <div className="group bg-white/80 backdrop-blur-xl p-3 rounded-2xl shadow-xl border border-white/50 flex items-center gap-4 transition-all hover:scale-105 hover:bg-white">
        <div className="bg-green-100 p-2.5 rounded-xl text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
          <Database size={20} />
        </div>
        <div>
          <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Coopératives</div>
          <div className="text-xl font-black text-gray-900 leading-none mt-1">{stats.total}</div>
        </div>
      </div>

      <div className="group bg-white/80 backdrop-blur-xl p-3 rounded-2xl shadow-xl border border-white/50 flex items-center gap-4 transition-all hover:scale-105 hover:bg-white">
        <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
          <TrendingUp size={20} />
        </div>
        <div>
          <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Secteurs</div>
          <div className="text-xl font-black text-gray-900 leading-none mt-1">{stats.sectorsCount}</div>
        </div>
      </div>

      <div className="group bg-white/80 backdrop-blur-xl p-3 rounded-2xl shadow-xl border border-white/50 flex items-center gap-4 transition-all hover:scale-105 hover:bg-white">
        <div className="bg-orange-100 p-2.5 rounded-xl text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
          <Users size={20} />
        </div>
        <div>
          <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Communes</div>
          <div className="text-xl font-black text-gray-900 leading-none mt-1">{stats.communesCount}</div>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;
