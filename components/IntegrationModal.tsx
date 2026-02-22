import React from 'react';
import { X, Code2, Globe, Zap, Terminal, Copy, Check, Info } from 'lucide-react';

interface IntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IntegrationModal: React.FC<IntegrationModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const isPre = window.location.hostname.includes('ais-pre-');
  const APP_URL = window.location.origin;
  const BLOG_URL = isPre 
    ? 'https://ais-pre-qv77p7ub3mlkzosr6z6itu-66557052969.us-east1.run.app'
    : 'https://ais-dev-qv77p7ub3mlkzosr6z6itu-66557052969.us-east1.run.app';

  const schemaCode = `{
  "type": "post" | "repo",
  "title": "string",
  "content": "string (Markdown)",
  "url": "string (GitHub URL)",
  "author": "string",
  "metadata": {
    "summary": "string",
    "tags": ["string"],
    "repoName": "string",
    "repo": { /* Full GitHub Repo Object */ },
    "analysis": { /* Full AI Analysis Object */ },
    "exportedAt": "ISO8601 String"
  }
}`;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl transition-opacity" onClick={onClose}></div>
      
      <div className="relative bg-surface border border-white/10 rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="p-8 flex justify-between items-start border-b border-white/5 bg-zinc-900/30">
          <div className="flex items-center space-x-6">
             <div className="w-14 h-14 flex items-center justify-center bg-accent-blue/20 rounded-2xl border border-accent-blue/30">
                <Code2 className="text-accent-blue" size={28} />
             </div>
             <div>
               <h2 className="text-2xl font-black text-white tracking-tight italic">Integration Protocol</h2>
               <p className="text-zinc-500 text-sm font-medium">Developer documentation for consuming GitTrends AI data</p>
             </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-zinc-800/50 hover:bg-zinc-700 rounded-xl text-zinc-500 hover:text-white transition-all border border-white/5">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-8 custom-scrollbar space-y-12">
          {/* Section 1: Endpoints */}
          <section>
            <div className="flex items-center space-x-3 mb-6">
              <Globe className="text-accent-blue" size={20} />
              <h3 className="text-lg font-bold text-white uppercase tracking-widest">1. Connection Endpoints</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-zinc-900/50 border border-white/5 rounded-3xl">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Source Application (This App)</p>
                <code className="text-xs text-accent-blue break-all">{APP_URL}</code>
              </div>
              <div className="p-6 bg-zinc-900/50 border border-white/5 rounded-3xl">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Target Import Endpoint</p>
                <code className="text-xs text-accent-green break-all">{BLOG_URL}/api/import</code>
              </div>
            </div>
          </section>

          {/* Section 2: Methods */}
          <section>
            <div className="flex items-center space-x-3 mb-6">
              <Zap className="text-accent-yellow" size={20} />
              <h3 className="text-lg font-bold text-white uppercase tracking-widest">2. Transmission Methods</h3>
            </div>
            <div className="space-y-6">
              <div className="p-6 bg-zinc-900/50 border border-white/5 rounded-3xl">
                <h4 className="text-sm font-bold text-white mb-3 flex items-center">
                  <Terminal size={16} className="mr-2 text-zinc-500" />
                  Method A: Server-to-Server (REST)
                </h4>
                <p className="text-zinc-400 text-sm mb-4">
                  GitTrends sends a <code className="text-accent-blue">POST</code> request to your <code className="text-accent-blue">/api/import</code> endpoint.
                </p>
                <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-2">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Required Headers</p>
                  <div className="space-y-1">
                    <code className="block text-[10px] text-zinc-300">Content-Type: application/json</code>
                    <code className="block text-[10px] text-zinc-300">x-api-key: &lt;YOUR_IMPORT_API_KEY&gt;</code>
                  </div>
                  <p className="text-[9px] text-zinc-500 italic mt-2">
                    To secure your endpoint, set the <code className="text-zinc-400">IMPORT_API_KEY</code> environment variable in AI Studio.
                  </p>
                </div>
              </div>
              <div className="p-6 bg-zinc-900/50 border border-white/5 rounded-3xl">
                <h4 className="text-sm font-bold text-white mb-3 flex items-center">
                  <Terminal size={16} className="mr-2 text-zinc-500" />
                  Method B: Client-Side (postMessage)
                </h4>
                <p className="text-zinc-400 text-sm mb-4">
                  If your app is the parent or opener of GitTrends, it will receive a message via the browser.
                </p>
                <div className="relative group">
                  <pre className="p-4 bg-black rounded-xl text-[10px] text-zinc-300 overflow-x-auto border border-white/5">
                    {`window.addEventListener('message', (event) => {
  if (event.data.type === 'EXPORT_DATA') {
    const { payload } = event.data;
    console.log('Received GitTrends Data:', payload);
  }
});`}
                  </pre>
                  <button 
                    onClick={() => handleCopy(`window.addEventListener('message', (event) => {
  if (event.data.type === 'EXPORT_DATA') {
    const { payload } = event.data;
    console.log('Received GitTrends Data:', payload);
  }
});`, 'js')}
                    className="absolute top-2 right-2 p-2 bg-zinc-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {copied === 'js' ? <Check size={14} className="text-accent-green" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Schema */}
          <section>
            <div className="flex items-center space-x-3 mb-6">
              <Info className="text-accent-orange" size={20} />
              <h3 className="text-lg font-bold text-white uppercase tracking-widest">3. Data Schema</h3>
            </div>
            <div className="p-6 bg-zinc-900/50 border border-white/5 rounded-3xl">
              <p className="text-zinc-400 text-sm mb-4">
                GitTrends exports a unified payload containing both the narrative blog post and the deep technical analysis.
              </p>
              <div className="relative group">
                <pre className="p-4 bg-black rounded-xl text-[10px] text-zinc-300 overflow-x-auto border border-white/5">
                  {schemaCode}
                </pre>
                <button 
                  onClick={() => handleCopy(schemaCode, 'schema')}
                  className="absolute top-2 right-2 p-2 bg-zinc-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {copied === 'schema' ? <Check size={14} className="text-accent-green" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </section>

          {/* Section 4: Reliability */}
          <section className="pb-8">
            <div className="p-6 bg-accent-blue/5 border border-accent-blue/20 rounded-3xl">
              <h3 className="text-sm font-black text-accent-blue uppercase tracking-widest mb-2">Reliability & Retries</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                GitTrends implements exponential backoff for network requests. If your server returns a <code className="text-white">429 Rate Limit</code>, 
                the system will retry up to 3 times (1s, 2s, 4s delays). Browser-level <code className="text-white">postMessage</code> is always sent immediately 
                and is not subject to network rate limits.
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 bg-zinc-900/50 border-t border-white/10 flex justify-between items-center">
          <div className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">
            Integration Protocol v2.1 • Last Updated: Feb 2026
          </div>
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl border border-white/5 transition-all font-bold text-[10px] uppercase tracking-widest"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
