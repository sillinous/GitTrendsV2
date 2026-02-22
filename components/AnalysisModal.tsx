import React from 'react';
import { AnalysisResult, Repository } from '../types';
import { X, Sparkles, AlertTriangle, Code2, Lightbulb, Rocket, DollarSign, ArrowUpRight, ShieldCheck, Activity, Users, Target, FileText, Share2, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { exportToExternalBlog, createRepoExportPayload } from '../services/exportService';

interface AnalysisModalProps {
  repo: Repository | null;
  analysis: AnalysisResult | null;
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  onGenerateBlog?: () => void;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({ repo, analysis, isOpen, onClose, isLoading, onGenerateBlog }) => {
  const [isExporting, setIsExporting] = React.useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    if (!repo || !analysis) return;
    setIsExporting(true);
    try {
      const payload = createRepoExportPayload(repo, analysis);
      await exportToExternalBlog(payload);
      alert('Analysis exported successfully!');
    } catch (error) {
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const hypeData = analysis ? [
    { name: 'Hype', value: analysis.hypeScore },
    { name: 'Remaining', value: 100 - analysis.hypeScore }
  ] : [];

  const getProviderName = (p?: string) => {
    switch(p) {
      case 'anthropic': return 'Anthropic';
      case 'openrouter': return 'OpenRouter';
      case 'gemini': return 'Gemini Flash';
      default: return 'Core AI';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" onClick={onClose}></div>
      
      <div className="relative bg-surface border border-white/5 rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col scale-in-center">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-blue/5 blur-[100px] pointer-events-none"></div>

        {/* Header */}
        <div className="p-8 flex justify-between items-start border-b border-white/5">
          <div className="flex items-center space-x-6">
             <div className="w-16 h-16 flex items-center justify-center bg-white rounded-3xl shadow-2xl shadow-white/5">
                <Sparkles className="text-black" size={32} />
             </div>
             <div>
               <div className="flex items-center space-x-3 mb-1">
                 <h2 className="text-3xl font-black text-white tracking-tight italic">Project DNA</h2>
                 <span className="px-3 py-1 bg-zinc-800/50 rounded-xl text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] border border-white/5">
                   v3.0 Deep Scan
                 </span>
               </div>
               <div className="flex items-center space-x-3">
                 <p className="text-zinc-400 font-medium">{repo?.full_name}</p>
                 {analysis && (
                   <div className="flex items-center space-x-1 px-2 py-0.5 bg-accent-blue/10 rounded-lg">
                      <div className="w-1 h-1 rounded-full bg-accent-blue animate-pulse"></div>
                      <span className="text-[10px] font-bold text-accent-blue uppercase tracking-widest">
                        {getProviderName(analysis.provider)}
                      </span>
                   </div>
                 )}
               </div>
             </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-zinc-900/50 hover:bg-zinc-800 rounded-2xl text-zinc-500 hover:text-white transition-all border border-white/5">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
          {isLoading ? (
             <div className="flex flex-col items-center justify-center py-20 space-y-8">
                <div className="relative">
                   <div className="w-20 h-20 border-4 border-zinc-800 rounded-full animate-spin border-t-accent-blue"></div>
                   <div className="absolute inset-0 flex items-center justify-center">
                     <Activity className="text-accent-blue animate-pulse" size={24} />
                   </div>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-white mb-2">Generating Technical Assessment</p>
                  <p className="text-zinc-500 text-sm max-w-xs mx-auto">Evaluating competitors, scanning risk factors, and projecting growth...</p>
                </div>
             </div>
          ) : analysis ? (
            <div className="grid grid-cols-12 gap-8">
              
              {/* Left Column: Health & Summary */}
              <div className="col-span-12 lg:col-span-5 space-y-8">
                {/* Hype Score / Health Gauge */}
                <div className="bg-accent-blue rounded-[2.5rem] p-8 relative overflow-hidden group">
                  <ArrowUpRight className="absolute top-6 right-6 text-white/40 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" size={24} />
                  <span className="text-xs font-black text-white/60 uppercase tracking-widest mb-2 block">Market Health</span>
                  <div className="flex items-center justify-between">
                    <span className="text-7xl font-black text-white tracking-tighter">{analysis.hypeScore}</span>
                    <div className="w-32 h-32 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={hypeData}
                            cx="50%"
                            cy="50%"
                            innerRadius={30}
                            outerRadius={50}
                            startAngle={90}
                            endAngle={450}
                            paddingAngle={0}
                            dataKey="value"
                            stroke="none"
                          >
                            <Cell fill="#ffffff" />
                            <Cell fill="rgba(255,255,255,0.15)" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold text-white/70 uppercase tracking-widest border-t border-white/20 pt-4">
                      <span>Sentiment Level</span>
                      <span className="text-white">Optimal</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold text-white/70 uppercase tracking-widest">
                      <span>Viral Probability</span>
                      <span className="text-white">High</span>
                    </div>
                  </div>
                </div>

                {/* Summary Section */}
                <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8">
                  <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center">
                    <Lightbulb className="mr-2 text-accent-yellow" size={14} />
                    Abstract
                  </h3>
                  <p className="text-zinc-300 text-lg leading-relaxed font-medium italic">
                    "{analysis.summary}"
                  </p>
                </div>

                {/* Risk Assessment */}
                {analysis.riskAssessment && (
                   <div className="bg-accent-red/10 border border-accent-red/20 rounded-[2.5rem] p-8">
                      <h3 className="text-xs font-black text-accent-red uppercase tracking-[0.2em] mb-4 flex items-center">
                        <AlertTriangle className="mr-2" size={14} />
                        Risk Factors
                      </h3>
                      <p className="text-zinc-300 text-sm leading-relaxed font-medium">
                        {analysis.riskAssessment}
                      </p>
                   </div>
                )}
              </div>

              {/* Right Column: Deep Analysis */}
              <div className="col-span-12 lg:col-span-7 space-y-8">
                {/* Tech Stack Bar */}
                <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8">
                  <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-6 flex items-center">
                    <Code2 className="mr-2 text-accent-blue" size={14} />
                    Architecture Analysis
                  </h3>
                  <p className="text-zinc-400 leading-relaxed text-sm">
                    {analysis.techStackAnalysis}
                  </p>
                </div>

                {/* Competitors & Revenue */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                     <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] pl-4">Market Landscape</h3>
                     <div className="space-y-3">
                       {analysis.competitors && analysis.competitors.length > 0 ? (
                           analysis.competitors.map((item, idx) => (
                             <div key={idx} className="bg-zinc-800/30 border border-white/5 p-4 rounded-2xl flex items-center space-x-3 group hover:border-purple-500/30 transition-colors">
                               <div className="w-8 h-8 flex items-center justify-center bg-purple-500/10 rounded-xl text-purple-400 shrink-0">
                                 <Target size={14} />
                               </div>
                               <span className="text-xs font-bold text-zinc-300 leading-tight">{item}</span>
                             </div>
                           ))
                       ) : (
                           <div className="text-zinc-600 text-xs pl-4">No direct competitors identified.</div>
                       )}
                     </div>
                   </div>

                   <div className="space-y-4">
                     <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] pl-4">Revenue Engine</h3>
                     <div className="space-y-3">
                       {analysis.revenueModels.map((item, idx) => (
                         <div key={idx} className="bg-zinc-800/30 border border-white/5 p-4 rounded-2xl flex items-center space-x-3 group hover:border-accent-green/30 transition-colors">
                           <div className="w-8 h-8 flex items-center justify-center bg-accent-green/10 rounded-xl text-accent-green shrink-0">
                             <DollarSign size={14} />
                           </div>
                           <span className="text-xs font-bold text-zinc-300 leading-tight">{item}</span>
                         </div>
                       ))}
                     </div>
                   </div>
                </div>

                {/* Roadmaps */}
                 <div className="space-y-4">
                     <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] pl-4">Future Horizons</h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       {analysis.nextDirections.map((item, idx) => (
                         <div key={idx} className="bg-zinc-800/30 border border-white/5 p-4 rounded-2xl flex items-start space-x-3 group hover:border-accent-blue/30 transition-colors h-full">
                           <Rocket size={14} className="text-accent-blue shrink-0 mt-0.5" />
                           <span className="text-xs font-bold text-zinc-400 group-hover:text-zinc-200 transition-colors leading-tight">{item}</span>
                         </div>
                       ))}
                     </div>
                </div>

                {/* Use Cases */}
                <div className="bg-black/40 border border-white/5 rounded-[2rem] p-6 flex flex-wrap gap-4">
                  {analysis.useCases.map((useCase, idx) => (
                    <div key={idx} className="px-4 py-2 bg-zinc-900 rounded-xl border border-white/5 flex items-center space-x-2">
                       <ShieldCheck size={14} className="text-accent-blue" />
                       <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">{useCase}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-20 text-zinc-600 font-bold uppercase tracking-widest">
              System Fault. Analysis stream terminated.
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-6 bg-black/40 border-t border-white/5 flex justify-between items-center">
          <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em]">Proprietary Assessment Tool • Encrypted Session</p>
          
          <div className="flex items-center space-x-4">
            {analysis && onGenerateBlog && (
              <button 
                onClick={onGenerateBlog}
                className="flex items-center space-x-2 px-6 py-2 bg-accent-orange/10 hover:bg-accent-orange/20 text-accent-orange rounded-xl border border-accent-orange/20 transition-all font-bold text-[10px] uppercase tracking-widest"
              >
                <FileText size={14} />
                <span>Generate Blog Post</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};