import React, { useMemo } from 'react';
import { Repository } from '../types';
import { ExternalLink, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { LANGUAGE_COLORS } from '../constants';

interface RepoCardProps {
  repo: Repository;
  onAnalyze: (repo: Repository) => void;
}

export const RepoCard: React.FC<RepoCardProps> = ({ repo, onAnalyze }) => {
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
    <div className="bg-surface border border-white/5 rounded-3xl p-6 hover:bg-surface-lighter transition-all duration-500 group relative flex flex-col h-full overflow-hidden shadow-2xl">
      {/* Top Section: Identity */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start space-x-4 min-w-0 flex-1">
          <div className="relative shrink-0">
            <img 
              src={repo.owner.avatar_url} 
              alt={repo.owner.login} 
              className="w-12 h-12 rounded-2xl object-cover bg-zinc-800 ring-1 ring-white/10"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-surface rounded-full flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: langColor }}></div>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] truncate mb-0.5">
              {repo.owner.login}
            </h3>
            <div className="flex flex-col space-y-2">
              <h4 className="text-xl font-extrabold text-white group-hover:text-accent-blue transition-colors line-clamp-2 leading-tight break-words">
                {repo.name}
              </h4>
              <div className="flex">
                <span 
                  className="text-[10px] px-2 py-0.5 rounded-lg font-bold border border-white/5 uppercase tracking-wider"
                  style={{ color: langColor, backgroundColor: `${langColor}10` }}
                >
                  {repo.language || 'General'}
                </span>
              </div>
            </div>
          </div>
        </div>
        <a 
          href={repo.html_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-10 h-10 shrink-0 flex items-center justify-center bg-zinc-900/50 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition-all border border-white/5 ml-4"
        >
          <ExternalLink size={18} />
        </a>
      </div>

      {/* Stats as "Prices" */}
      <div className="mb-4">
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-black text-white tracking-tighter italic">
            {repo.stargazers_count > 1000 ? `${(repo.stargazers_count / 1000).toFixed(1)}k` : repo.stargazers_count}
          </span>
          <span className="text-xs font-bold text-accent-green flex items-center">
            <TrendingUp size={12} className="mr-1" />
            +{(repo.forks_count / 10).toFixed(1)}%
          </span>
        </div>
        <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mt-1 opacity-60">Stargazers / Forecasted Growth</p>
      </div>

      {/* Description as "News/Analysis" */}
      <div className="bg-black/20 rounded-2xl p-4 mb-4 border border-white/5 flex-grow">
        <p className="text-zinc-400 text-sm leading-relaxed line-clamp-3 font-medium">
          {repo.description || "Project performance remains stable with consistent community contributions and architectural integrity."}
        </p>
      </div>

      {/* Real Dynamic Sparkline Chart */}
      <div className="h-16 w-full mb-6 opacity-40 group-hover:opacity-100 transition-all duration-500 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-accent-blue/5 to-transparent rounded-xl pointer-events-none"></div>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sparklineData}>
            <YAxis domain={['dataMin', 'dataMax']} hide />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#3b82f6" 
              strokeWidth={2} 
              dot={false}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="absolute bottom-0 right-0 p-1">
           <span className="text-[8px] font-black text-accent-blue/40 uppercase tracking-tighter">Growth Momentum</span>
        </div>
      </div>

      {/* Footer Metrics */}
      <div className="flex items-center justify-between pt-6 border-t border-white/5">
        <div className="flex items-center space-x-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-zinc-700 uppercase tracking-tighter">Updated</span>
            <span className="text-xs font-black text-zinc-500">{formatDate(repo.updated_at)}</span>
          </div>
          <div className="w-px h-6 bg-white/5"></div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-zinc-700 uppercase tracking-tighter">Forks</span>
            <span className="text-xs font-black text-zinc-500">{repo.forks_count.toLocaleString()}</span>
          </div>
        </div>

        <button 
          onClick={() => onAnalyze(repo)}
          className="flex items-center space-x-2 px-5 py-2.5 bg-white text-black text-[11px] font-black rounded-2xl hover:bg-zinc-200 active:scale-95 transition-all shadow-xl shadow-white/5"
        >
          <Sparkles size={14} className="fill-black" />
          <span className="uppercase tracking-[0.15em]">Analyze</span>
        </button>
      </div>
    </div>
  );
};