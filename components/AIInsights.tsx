
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { X, Sparkles, Loader2, BrainCircuit, Copy, Check, RefreshCw, AlertTriangle } from 'lucide-react';
import { CooperativeFeature } from '../types.ts';

interface AIInsightsProps {
  isOpen: boolean;
  onClose: () => void;
  data: CooperativeFeature[];
}

const AIInsights: React.FC<AIInsightsProps> = ({ isOpen, onClose, data }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateInsights = async () => {
    if (data.length === 0) {
      setError("Aucune donnée disponible pour l'analyse.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setInsight(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const stats = data.map(f => ({
        n: f.properties['Nom de coopérative'] || f.properties.Nom_Coop,
        c: f.properties.Commune,
        s: f.properties["Filière d'activité"],
        a: f.properties["Nombre des adherents"] || f.properties["Nombre des adhérents"] || 0,
        f: f.properties["Nombre des femmes"] || 0
      })).slice(0, 60);

      const prompt = `Agis en tant qu'expert en développement socio-économique pour la province de Driouch, Maroc. 
      Analyse ces ${data.length} coopératives.
      Données clés: ${JSON.stringify(stats)}
      
      Structure ta réponse en Markdown:
      - **Diagnostic Global**: Analyse de la répartition et des secteurs.
      - **Inclusion & Social**: Focus sur les adhérents et l'aspect genre.
      - **Opportunités Stratégiques**: 3 recommandations concrètes pour Agri Invest Development.
      
      Ton: Professionnel, analytique et visionnaire. Langue: Français.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setInsight(response.text || "Erreur de génération.");
    } catch (err: any) {
      console.error("AI Error:", err);
      setError("Le service d'analyse est temporairement indisponible. Vérifiez votre configuration API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !insight && !loading) {
      generateInsights();
    }
  }, [isOpen]);

  const copyToClipboard = () => {
    if (insight) {
      navigator.clipboard.writeText(insight);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/20">
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-800 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl shadow-inner border border-white/10">
              <BrainCircuit size={28} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">Intelligence Provinciale</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                <p className="text-[10px] text-blue-100 font-bold uppercase tracking-widest opacity-80">Powered by Gemini AI Flash</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all hover:rotate-90">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-indigo-600 gap-6">
              <div className="relative">
                <Loader2 className="w-16 h-16 animate-spin opacity-20" />
                <BrainCircuit className="absolute inset-0 m-auto w-8 h-8 animate-bounce" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-black tracking-tight text-slate-800">Génération du rapport stratégique...</p>
                <p className="text-sm text-slate-500 max-w-xs mx-auto">L'IA analyse les filières et la dynamique sociale des coopératives de Driouch.</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="p-4 bg-red-50 rounded-full mb-4">
                <AlertTriangle size={48} className="text-red-500 opacity-80" />
              </div>
              <p className="text-slate-800 font-bold text-lg mb-2">Analyse interrompue</p>
              <p className="text-slate-500 text-sm mb-6 max-w-sm">{error}</p>
              <button 
                onClick={generateInsights}
                className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-full text-sm font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
              >
                <RefreshCw size={18} /> Réessayer l'analyse
              </button>
            </div>
          ) : (
            <div className="prose prose-slate prose-sm md:prose-base max-w-none prose-headings:text-indigo-900 prose-headings:font-black prose-strong:text-indigo-700">
              <div className="whitespace-pre-wrap leading-relaxed text-slate-700">
                {insight}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 bg-white border-t border-slate-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-indigo-600">D</div>
              <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-blue-600">R</div>
              <div className="w-6 h-6 rounded-full bg-green-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-green-600">I</div>
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Driouch Data Insights v3.0</span>
          </div>
          
          <div className="flex items-center gap-3">
            {insight && (
              <button 
                onClick={copyToClipboard}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black transition-all border ${copied ? 'bg-green-50 text-green-600 border-green-200' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copié !' : 'Copier le rapport'}
              </button>
            )}
            <button 
              onClick={generateInsights}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-full text-xs font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Actualiser
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
