
import React from 'react';
import { 
  X, 
  MapPin, 
  Phone, 
  Briefcase, 
  Users, 
  User, 
  GraduationCap, 
  Calendar,
  Building2,
  ChevronRight
} from 'lucide-react';
import { CooperativeFeature } from '../types';

interface DetailPanelProps {
  coop: CooperativeFeature;
  onClose: () => void;
}

const DetailPanel: React.FC<DetailPanelProps> = ({ coop, onClose }) => {
  const p = coop.properties;

  // تحويل الجنس
  const formatGenre = (g: string) => {
    if (g === 'M') return 'Homme (ذكر)';
    if (g === 'F') return 'Femme (أنثى)';
    return g || 'Non spécifié';
  };

  return (
    <div className="absolute bottom-0 md:inset-y-0 right-0 md:right-4 md:top-4 md:bottom-4 w-full md:w-96 z-[3000] p-2 md:p-0 flex pointer-events-none">
      <div className="bg-white w-full h-[70vh] md:h-full rounded-t-3xl md:rounded-2xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto border border-gray-100 animate-in slide-in-from-bottom md:slide-in-from-right duration-500">
        
        {/* مقبض السحب للهاتف */}
        <div className="md:hidden flex justify-center p-3 shrink-0">
          <div className="w-16 h-1.5 bg-gray-200 rounded-full"></div>
        </div>

        {/* الهيدر */}
        <div className="px-6 py-4 bg-gradient-to-r from-green-800 to-green-700 text-white flex justify-between items-center shrink-0 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Building2 size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-sm uppercase tracking-widest opacity-80">Détails de la Coopérative</h2>
              <p className="text-[10px] font-medium text-green-100">ID: {p.id || p.FID || '---'}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6 bg-gray-50/30">
          
          {/* القسم العلوي: الاسم والنشاط */}
          <div className="text-center space-y-2">
            <h3 className="text-xl font-black text-gray-900 leading-tight">
              {p['Nom de coopérative'] || p.Nom_Coop || "Coopérative"}
            </h3>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold uppercase tracking-wide">
              <Briefcase size={12} />
              {p["Filière d'activité"] || "Secteur non défini"}
            </div>
          </div>

          {/* شبكة الإحصائيات (الأعضاء / النساء / الشباب) */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 text-center space-y-1 transition hover:shadow-md">
              <div className="flex justify-center text-blue-500 mb-1"><Users size={18} /></div>
              <div className="text-lg font-black text-gray-800">{p["Nombre des adhérents"] || 0}</div>
              <div className="text-[9px] font-bold text-gray-400 uppercase">Adhérents</div>
            </div>
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 text-center space-y-1 transition hover:shadow-md">
              <div className="flex justify-center text-pink-500 mb-1"><User size={18} /></div>
              <div className="text-lg font-black text-gray-800">{p["Nombre des femmes"] || 0}</div>
              <div className="text-[9px] font-bold text-gray-400 uppercase">Femmes</div>
            </div>
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 text-center space-y-1 transition hover:shadow-md">
              <div className="flex justify-center text-orange-500 mb-1"><Calendar size={18} /></div>
              <div className="text-lg font-black text-gray-800">{p["Nombre des jeunes"] || 0}</div>
              <div className="text-[9px] font-bold text-gray-400 uppercase">Jeunes</div>
            </div>
          </div>

          {/* قسم الموقع */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-tighter">
              <MapPin size={14} className="text-green-600" />
              <span>Localisation</span>
              <div className="flex-1 h-px bg-gray-100 ml-2"></div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Commune</span>
                <span className="font-bold text-gray-900">{p.Commune || "---"}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Cercle / Province</span>
                <span className="font-bold text-gray-900">{p.Cercle || '---'} / {p.Province || 'Driouch'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Douar / Quartier</span>
                <span className="font-bold text-gray-900">{p["Douar/Quartier"] || "Non renseigné"}</span>
              </div>
            </div>
          </section>

          {/* قسم المسؤول والملف الشخصي */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-tighter">
              <User size={14} className="text-green-600" />
              <span>Profil & Responsable</span>
              <div className="flex-1 h-px bg-gray-100 ml-2"></div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-green-50 p-2 rounded-xl text-green-700"><User size={20} /></div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Président / Gestionnaire</p>
                  <p className="text-sm font-bold text-gray-900">{p["Nom et prénom président/gestionnaire"] || "Non mentionné"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-50">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                    <User size={12} className="text-green-500" /> Genre
                  </div>
                  <div className="text-sm font-bold text-gray-900">{formatGenre(p.Genre)}</div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                    <Calendar size={12} className="text-green-500" /> Date Naiss.
                  </div>
                  <div className="text-sm font-bold text-gray-900">{p["Date de naissance"] || "---"}</div>
                </div>
                <div className="col-span-2 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                    <GraduationCap size={12} className="text-green-500" /> Niveau Scolaire
                  </div>
                  <div className="text-sm font-bold text-gray-900">{p["Niveau scolaire"] || "---"}</div>
                </div>
              </div>
            </div>
          </section>

          {/* قسم التواصل */}
          {p.Tel && (
            <div className="pt-2">
              <a 
                href={`tel:${p.Tel}`}
                className="w-full flex items-center justify-between p-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl shadow-lg shadow-green-200 transition-all transform active:scale-95 group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-xl group-hover:rotate-12 transition-transform">
                    <Phone size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold uppercase opacity-80 tracking-widest">Contacter maintenant</p>
                    <p className="text-lg font-black tracking-tight">{p.Tel}</p>
                  </div>
                </div>
                <ChevronRight size={24} className="opacity-50" />
              </a>
            </div>
          )}

          {/* معلومات إضافية */}
          <div className="bg-gray-100 rounded-xl p-3 text-center">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Date de création</p>
            <p className="text-xs font-bold text-gray-600">{p["Date de création"] || "Non définie"}</p>
          </div>

        </div>

        {/* زر الإغلاق السفلي للديسكتوب */}
        <div className="p-4 bg-white border-t border-gray-100 hidden md:block">
           <button 
            onClick={onClose}
            className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg"
          >
            Fermer le Profil
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailPanel;
