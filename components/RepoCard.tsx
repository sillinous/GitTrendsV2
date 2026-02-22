import React, { useMemo } from 'react';
import { Repository } from '../types';
import { ExternalLink, Sparkles, TrendingUp, Zap, ListPlus, Check } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { LANGUAGE_COLORS } from '../constants';

interface RepoCardProps {
  repo: Repository;
  onAnalyze: (repo: Repository) => void;
  onAddTask: (repo: Repository) => void;
  isTasked?: boolean;
}

export const RepoCard: React.FC<RepoCardProps> = ({ repo, onAnalyze, onAddTask, isTasked }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const langColor = LANGUAGE_COLORS[repo.language] || '#71717a';

  // Generate simulated momentum data for the sparkline
  const sparklineData = useMemo(() => {
    const points = 20;
    const data = [];
    let current = repo.stargazers_count * 0.9; // Start at 90% of current stars
    const increment = (repo.stargazers_count - current) / points;
    
    for (let i = 0; i < points; i++) {
      // Add some random volatility but generally trending up
      const volatility = (Math.random() - 0.3) * (increment * 2);
      current += increment + volatility;
      data.push({ value: Math.max(0, current) });
    }
    // Ensure last point is the actual star count
    data[points - 1] = { value: repo.stargazers_count };
    return data;
  }, [repo.stargazers_count]);

  return (
    <div className="group relative bg-surface border border-white/5 rounded-[2.5rem] p-8 hover:bg-zinc-900/80 transition-all duration-500 flex flex-col h-full shadow-2xl overflow-hidden">
      {/* Background Sparkline - Subtle and integrated */}
      <div className="absolute top-0 right-0 w-1/2 h-32 opacity-10 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sparklineData}>
            <YAxis domain={['dataMin', 'dataMax']} hide />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#3b82f6" 
              strokeWidth={2} 
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Header: Identity & External Link */}
      <div className="flex justify-between items-start mb-8 relative z-10">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img 
              src={repo.owner.avatar_url} 
              alt={repo.owner.login} 
              className="w-14 h-14 rounded-2xl object-cover bg-zinc-800 ring-2 ring-white/5 group-hover:ring-accent-blue/30 transition-all duration-500"
            />
            <div 
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-surface flex items-center justify-center shadow-lg"
              style={{ backgroundColor: langColor }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-white/80"></div>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-1">
              {repo.owner.login}
            </p>
            <h4 className="text-2xl font-black text-white tracking-tighter italic group-hover:text-accent-blue transition-colors duration-300">
              {repo.name}
            </h4>
          </div>
        </div>
        <a 
          href={repo.html_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl text-zinc-500 hover:text-white transition-all border border-white/5"
        >
          <ExternalLink size={18} />
        </a>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
        <div className="bg-black/20 border border-white/5 rounded-2xl p-4">
          <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-1">Market Cap</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-white">
              {repo.stargazers_count > 1000 ? `${(repo.stargazers_count / 1000).toFixed(1)}k` : repo.stargazers_count}
            </span>
            <span className="text-[10px] font-bold text-accent-green flex items-center">
              <TrendingUp size={10} className="mr-1" />
              +{(repo.forks_count / 100).toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="bg-black/20 border border-white/5 rounded-2xl p-4">
          <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-1">Liquidity</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-white">
              {repo.forks_count > 1000 ? `${(repo.forks_count / 1000).toFixed(1)}k` : repo.forks_count}
            </span>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Forks</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="flex-grow mb-8 relative z-10">
        <p className="text-zinc-400 text-sm leading-relaxed font-medium line-clamp-3">
          {repo.description || "Project performance remains stable with consistent community contributions and architectural integrity."}
        </p>
      </div>

      {/* Footer: Tags & Actions */}
      <div className="pt-8 border-t border-white/5 space-y-6 relative z-10">
        <div className="flex flex-wrap gap-2">
          <span 
            className="text-[10px] px-3 py-1 rounded-lg font-black border border-white/5 uppercase tracking-widest"
            style={{ color: langColor, backgroundColor: `${langColor}10` }}
          >
            {repo.language || 'General'}
          </span>
          <span className="text-[10px] px-3 py-1 rounded-lg font-black bg-zinc-800/50 text-zinc-500 border border-white/5 uppercase tracking-widest">
            {formatDate(repo.updated_at)}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={() => !isTasked && onAddTask(repo)}
            disabled={isTasked}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-2xl transition-all font-black text-[11px] uppercase tracking-widest border ${
              isTasked 
                ? 'bg-accent-green/10 text-accent-green border-accent-green/20' 
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border-white/5 active:scale-95'
            }`}
          >
            {isTasked ? <Check size={14} /> : <ListPlus size={14} />}
            <span>{isTasked ? 'Monitored' : 'Track'}</span>
          </button>

          <button 
            onClick={() => onAnalyze(repo)}
            className="flex-1 flex items-center justify-center space-x-2 py-3 bg-white text-black text-[11px] font-black rounded-2xl hover:bg-zinc-200 active:scale-95 transition-all shadow-xl shadow-white/10"
          >
            <Sparkles size={14} className="fill-black" />
            <span className="uppercase tracking-[0.15em]">Analyze</span>
          </button>
        </div>
      </div>
    </div>
  );
};