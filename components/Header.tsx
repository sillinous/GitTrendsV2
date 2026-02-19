import React from 'react';
import { Search, Github, GitBranch, Cpu, ChevronDown } from 'lucide-react';
import { SearchFilters } from '../types';
import { POPULAR_LANGUAGES, AI_PROVIDERS } from '../constants';

interface HeaderProps {
  filters: SearchFilters;
  onFilterChange: (newFilters: Partial<SearchFilters>) => void;
  onSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ filters, onFilterChange, onSearch }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onSearch();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-xl border-b border-white/5 py-4">
      <div className="container mx-auto px-6 flex items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => window.location.reload()}>
          <div className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-lg shadow-white/10 group-hover:scale-105 transition-transform">
             <GitBranch className="text-black" size={20} strokeWidth={2.5} />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold tracking-tight text-white leading-none">
              GitTrends
            </h1>
            <span className="text-[10px] font-bold text-accent-blue tracking-widest uppercase opacity-70">Intelligence</span>
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-2xl relative">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-white transition-colors" />
            <input
              type="text"
              value={filters.query}
              onChange={(e) => onFilterChange({ query: e.target.value })}
              onKeyDown={handleKeyDown}
              className="w-full bg-surface-lighter border border-white/5 rounded-2xl py-3 pl-11 pr-24 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all shadow-inner"
              placeholder="Search trending repositories..."
            />
            <button 
              onClick={onSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl border border-white/5 transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* Global Controls */}
        <div className="hidden lg:flex items-center space-x-3">
          <div className="flex items-center bg-surface-lighter border border-white/5 rounded-2xl px-3 py-2 group">
            <Cpu size={14} className="text-accent-blue mr-2" />
            <select
              value={filters.provider}
              onChange={(e) => onFilterChange({ provider: e.target.value as any })}
              className="bg-transparent border-none text-zinc-400 text-xs font-medium outline-none cursor-pointer appearance-none pr-1"
            >
              {AI_PROVIDERS.map(p => (
                <option key={p.id} value={p.id} className="bg-surface text-white">{p.name}</option>
              ))}
            </select>
            <ChevronDown size={12} className="text-zinc-500 ml-1" />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={filters.period}
              onChange={(e) => {
                onFilterChange({ period: e.target.value as any });
                setTimeout(onSearch, 0);
              }}
              className="bg-surface-lighter border border-white/5 text-zinc-400 text-xs font-semibold rounded-2xl px-4 py-2.5 hover:text-white transition-colors cursor-pointer outline-none"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-2xl bg-surface-lighter border border-white/5 text-zinc-400 hover:text-white transition-all">
              <Github size={18} />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};