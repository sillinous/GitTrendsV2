import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { RepoCard } from './components/RepoCard';
import { AnalysisModal } from './components/AnalysisModal';
import { Repository, SearchFilters, AnalysisResult } from './types';
import { DEFAULT_FILTERS } from './constants';
import { fetchTrendingRepos } from './services/githubService';
import { analyzeRepository } from './services/aiService';
import { RefreshCw, AlertTriangle, Search, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';

const App: React.FC = () => {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const loadRepos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchTrendingRepos(filters);
      setRepos(data.items);
      setTotalCount(data.total_count);
    } catch (err) {
      setError("Failed to fetch repositories. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadRepos();
  }, []); 

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => {
      const isFilterChange = newFilters.query !== undefined || newFilters.language !== undefined;
      return { 
        ...prev, 
        ...newFilters,
        page: isFilterChange ? 1 : (newFilters.page || prev.page)
      };
    });
  };

  const handleSearch = () => loadRepos();

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    setFilters(prev => ({ ...prev, page: newPage }));
    setTimeout(loadRepos, 0); 
  };

  const handleAnalyze = async (repo: Repository) => {
    setSelectedRepo(repo);
    setAnalysisResult(null);
    setIsModalOpen(true);
    setIsAnalyzing(true);
    try {
      const result = await analyzeRepository(repo, filters.provider);
      setAnalysisResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const itemsPerPage = 12;
  const maxResults = Math.min(totalCount, 1000);
  const totalPages = Math.ceil(maxResults / itemsPerPage);

  return (
    <div className="min-h-screen bg-background text-zinc-200 selection:bg-accent-blue/30">
      <Header 
        filters={filters} 
        onFilterChange={handleFilterChange} 
        onSearch={handleSearch} 
      />

      <main className="container mx-auto px-6 py-12 pb-24">
        
        {/* Banner Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-accent-blue font-black text-xs uppercase tracking-[0.3em]">
              <LayoutGrid size={14} />
              <span>Dashboard Terminal</span>
            </div>
            <h2 className="text-5xl font-black text-white tracking-tighter italic">Asset Discovery</h2>
            <p className="text-zinc-500 text-lg max-w-xl font-medium">
              Mapping the digital frontier. Leverage <span className="text-white">advanced models</span> to decode project trajectories and commercial viability.
            </p>
          </div>
          <div className="bg-surface border border-white/5 rounded-[2rem] p-6 flex items-center space-x-6">
             <div className="flex flex-col">
               <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Total Monitored</span>
               <span className="text-2xl font-black text-white">{totalCount.toLocaleString()}</span>
             </div>
             <div className="w-px h-10 bg-white/10"></div>
             <div className="flex flex-col">
               <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Intelligence Latency</span>
               <span className="text-2xl font-black text-accent-green">~450ms</span>
             </div>
          </div>
        </div>

        {/* Main Grid */}
        {error ? (
          <div className="bg-accent-red/5 border border-accent-red/20 rounded-[3rem] p-16 flex flex-col items-center justify-center text-center">
            <AlertTriangle className="text-accent-red mb-6" size={64} />
            <h3 className="text-3xl font-black text-white mb-2">Interface Disrupted</h3>
            <p className="text-zinc-400 mb-8 max-w-md">{error}</p>
            <button 
              onClick={loadRepos}
              className="px-8 py-3 bg-white text-black font-black uppercase tracking-widest rounded-2xl transition-all hover:scale-105 active:scale-95"
            >
              Restart Session
            </button>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 bg-surface border border-white/5 rounded-3xl animate-pulse flex flex-col p-8 opacity-40">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 bg-zinc-800 rounded-2xl"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
                    <div className="h-3 bg-zinc-800 rounded w-1/3"></div>
                  </div>
                </div>
                <div className="space-y-3 flex-grow">
                   <div className="h-2 bg-zinc-800 rounded w-full"></div>
                   <div className="h-2 bg-zinc-800 rounded w-5/6"></div>
                   <div className="h-2 bg-zinc-800 rounded w-4/6"></div>
                </div>
                <div className="pt-8 flex justify-between">
                   <div className="w-20 h-4 bg-zinc-800 rounded"></div>
                   <div className="w-24 h-10 bg-zinc-800 rounded-2xl"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {repos.length > 0 ? (
                repos.map(repo => (
                  <RepoCard 
                    key={repo.id} 
                    repo={repo} 
                    onAnalyze={handleAnalyze} 
                  />
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-32 opacity-30">
                  <Search className="w-24 h-24 mb-6" strokeWidth={1} />
                  <p className="text-2xl font-black tracking-widest uppercase">No Active Signals</p>
                  <button 
                     onClick={() => {
                       setFilters(DEFAULT_FILTERS); 
                       setTimeout(loadRepos, 100);
                     }}
                     className="mt-6 text-accent-blue font-bold uppercase tracking-widest hover:underline"
                  >
                    Reset Grid
                  </button>
                </div>
              )}
            </div>

            {/* Pagination */}
            {repos.length > 0 && totalPages > 1 && (
              <div className="mt-20 flex justify-center items-center space-x-12">
                <button
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page <= 1}
                  className="p-4 rounded-full bg-surface border border-white/5 text-zinc-400 hover:text-white hover:border-white/20 disabled:opacity-20 transition-all shadow-xl"
                >
                  <ChevronLeft size={24} />
                </button>
                
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-1">Index</span>
                  <span className="text-xl font-black text-white">
                    {filters.page} <span className="text-zinc-700 italic mx-2">/</span> {totalPages}
                  </span>
                </div>

                <button
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page >= totalPages}
                  className="p-4 rounded-full bg-surface border border-white/5 text-zinc-400 hover:text-white hover:border-white/20 disabled:opacity-20 transition-all shadow-xl"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <AnalysisModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        repo={selectedRepo}
        analysis={analysisResult}
        isLoading={isAnalyzing}
      />
    </div>
  );
};

export default App;