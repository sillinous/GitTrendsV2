import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { RepoCard } from './components/RepoCard';
import { AnalysisModal } from './components/AnalysisModal';
import { Repository, SearchFilters, AnalysisResult, BlogPost, Task } from './types';
import { DEFAULT_FILTERS } from './constants';
import { fetchTrendingRepos } from './services/githubService';
import { analyzeRepository, generateBlogPost } from './services/aiService';
import { RefreshCw, AlertTriangle, Search, ChevronLeft, ChevronRight, LayoutGrid, FileText, ListTodo, GitBranch } from 'lucide-react';
import { BlogPostModal } from './components/BlogPostModal';
import { TaskSidebar } from './components/TaskSidebar';
import { IntegrationModal } from './components/IntegrationModal';

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

  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [isGeneratingBlog, setIsGeneratingBlog] = useState(false);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isTaskSidebarOpen, setIsTaskSidebarOpen] = useState(false);
  const [isIntegrationModalOpen, setIsIntegrationModalOpen] = useState(false);

  // Load tasks from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('gittrends_tasks');
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (e) {
        console.error("Failed to parse tasks", e);
      }
    }
  }, []);

  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem('gittrends_tasks', JSON.stringify(tasks));
  }, [tasks]);

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

  // Initial load
  useEffect(() => {
    loadRepos();
  }, []); 

  // Auto-reload when specific filters change
  useEffect(() => {
    loadRepos();
  }, [filters.period, filters.sort, filters.order, filters.page, loadRepos]);

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
    // useEffect will handle the reload
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

  const handleGenerateBlog = async (repo: Repository) => {
    setSelectedRepo(repo);
    setBlogPost(null);
    setIsBlogModalOpen(true);
    setIsGeneratingBlog(true);
    try {
      // If we already have analysis, use it for better blog post
      const post = await generateBlogPost(repo, analysisResult);
      setBlogPost(post);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingBlog(false);
    }
  };

  const handleAddTask = (repo: Repository) => {
    const newTask: Task = {
      id: Math.random().toString(36).substring(7),
      repoId: repo.id,
      repoName: repo.name,
      repoFullName: repo.full_name,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setTasks(prev => [newTask, ...prev]);
    setIsTaskSidebarOpen(true);
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: task.status === 'completed' ? 'pending' : 'completed' } 
        : task
    ));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
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
                    onAddTask={handleAddTask}
                    isTasked={tasks.some(t => t.repoId === repo.id)}
                  />
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-32 opacity-30">
                  <Search className="w-24 h-24 mb-6" strokeWidth={1} />
                  <p className="text-2xl font-black tracking-widest uppercase">No Active Signals</p>
                  <button 
                     onClick={() => {
                       setFilters(DEFAULT_FILTERS); 
                       // No timeout needed as useEffect handles it, but setting default filter will trigger it
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
        onGenerateBlog={() => selectedRepo && handleGenerateBlog(selectedRepo)}
      />

      <BlogPostModal
        isOpen={isBlogModalOpen}
        onClose={() => setIsBlogModalOpen(false)}
        repo={selectedRepo}
        post={blogPost}
        isLoading={isGeneratingBlog}
        analysis={analysisResult}
      />

      <TaskSidebar 
        tasks={tasks}
        isOpen={isTaskSidebarOpen}
        onClose={() => setIsTaskSidebarOpen(false)}
        onToggleTask={handleToggleTask}
        onDeleteTask={handleDeleteTask}
      />

      <IntegrationModal 
        isOpen={isIntegrationModalOpen}
        onClose={() => setIsIntegrationModalOpen(false)}
      />

      {/* Task Toggle Button */}
      <button 
        onClick={() => setIsTaskSidebarOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-accent-blue text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group"
      >
        <ListTodo size={28} />
        {tasks.filter(t => t.status === 'pending').length > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-accent-red text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-background">
            {tasks.filter(t => t.status === 'pending').length}
          </span>
        )}
        <div className="absolute right-full mr-4 px-4 py-2 bg-surface border border-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          <span className="text-xs font-black uppercase tracking-widest">Task Terminal</span>
        </div>
      </button>

      {/* Connection Guide Footer */}
      <footer className="border-t border-white/5 bg-black/40 py-12 mt-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 flex items-center justify-center bg-white rounded-lg">
                  <GitBranch className="text-black" size={16} />
                </div>
                <span className="text-lg font-black text-white italic tracking-tighter">GitTrends AI</span>
              </div>
              <p className="text-zinc-500 text-sm max-w-sm leading-relaxed">
                Autonomous repository intelligence and content synthesis. Mapping the evolution of open-source assets in real-time.
              </p>
            </div>
            
            <div className="bg-surface border border-white/5 rounded-3xl p-6">
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-4">Connection Guide</h3>
              <div className="space-y-4">
                <div className="p-3 bg-black/20 rounded-xl border border-white/5">
                  <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">App Endpoint</p>
                  <code className="text-[10px] text-accent-blue break-all">POST https://ais-dev-qv77p7ub3mlkzosr6z6itu-66557052969.us-east1.run.app/api/import</code>
                </div>
                <div className="p-3 bg-black/20 rounded-xl border border-white/5">
                  <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Required Headers</p>
                  <div className="space-y-1">
                    <code className="block text-[9px] text-zinc-300">Content-Type: application/json</code>
                    <code className="block text-[9px] text-zinc-300">x-api-key: &lt;YOUR_IMPORT_API_KEY&gt;</code>
                  </div>
                </div>
                <p className="text-[10px] text-zinc-500 italic">
                  To secure your endpoint, set the <code className="text-zinc-400">IMPORT_API_KEY</code> environment variable in AI Studio.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center">
            <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em]">© 2026 GitTrends Intelligence Systems</p>
            <div className="flex space-x-6">
              <button 
                onClick={() => setIsIntegrationModalOpen(true)}
                className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] cursor-pointer hover:text-white transition-colors"
              >
                Integration Guide
              </button>
              <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] cursor-pointer hover:text-zinc-500 transition-colors">Documentation</span>
              <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] cursor-pointer hover:text-zinc-500 transition-colors">API Status</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;