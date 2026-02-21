import React from 'react';
import { BlogPost, Repository } from '../types';
import { X, FileText, Calendar, User, Tag, Download, Copy, Check } from 'lucide-react';
import Markdown from 'react-markdown';

interface BlogPostModalProps {
  repo: Repository | null;
  post: BlogPost | null;
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
}

export const BlogPostModal: React.FC<BlogPostModalProps> = ({ repo, post, isOpen, onClose, isLoading }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (post) {
      navigator.clipboard.writeText(`# ${post.title}\n\n${post.content}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (post) {
      const element = document.createElement("a");
      const file = new Blob([`# ${post.title}\n\n${post.content}`], {type: 'text/markdown'});
      element.href = URL.createObjectURL(file);
      element.download = `${repo?.name || 'blog-post'}.md`;
      document.body.appendChild(element);
      element.click();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl transition-opacity" onClick={onClose}></div>
      
      <div className="relative bg-surface border border-white/10 rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="p-8 flex justify-between items-start border-b border-white/5 bg-zinc-900/30">
          <div className="flex items-center space-x-6">
             <div className="w-14 h-14 flex items-center justify-center bg-accent-orange/20 rounded-2xl border border-accent-orange/30">
                <FileText className="text-accent-orange" size={28} />
             </div>
             <div>
               <h2 className="text-2xl font-black text-white tracking-tight italic">Blog Post Generator</h2>
               <p className="text-zinc-500 text-sm font-medium">Drafting content for {repo?.full_name}</p>
             </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-zinc-800/50 hover:bg-zinc-700 rounded-xl text-zinc-500 hover:text-white transition-all border border-white/5">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-8 custom-scrollbar bg-zinc-950/50">
          {isLoading ? (
             <div className="flex flex-col items-center justify-center py-32 space-y-8">
                <div className="relative">
                   <div className="w-16 h-16 border-4 border-zinc-800 rounded-full animate-spin border-t-accent-orange"></div>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-white mb-2 tracking-widest uppercase">Drafting Narrative...</p>
                  <p className="text-zinc-500 text-xs max-w-xs mx-auto uppercase tracking-widest">Synthesizing repository data into a compelling tech story.</p>
                </div>
             </div>
          ) : post ? (
            <article className="max-w-3xl mx-auto">
              {/* Meta */}
              <div className="flex flex-wrap gap-6 mb-12 pb-8 border-b border-white/5">
                <div className="flex items-center space-x-2 text-zinc-400">
                  <User size={14} className="text-accent-orange" />
                  <span className="text-xs font-bold uppercase tracking-widest">{post.author}</span>
                </div>
                <div className="flex items-center space-x-2 text-zinc-400">
                  <Calendar size={14} className="text-accent-orange" />
                  <span className="text-xs font-bold uppercase tracking-widest">{post.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  {post.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-zinc-800 rounded-md text-[10px] font-bold text-zinc-500 border border-white/5 uppercase tracking-widest">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tighter leading-tight italic">
                {post.title}
              </h1>

              {/* Summary */}
              <div className="p-6 bg-accent-orange/5 border-l-4 border-accent-orange rounded-r-2xl mb-12">
                <p className="text-zinc-300 text-lg font-medium italic leading-relaxed">
                  "{post.summary}"
                </p>
              </div>

              {/* Body */}
              <div className="prose prose-invert prose-orange max-w-none">
                <div className="markdown-body text-zinc-300 leading-relaxed space-y-6 text-lg">
                  <Markdown>{post.content}</Markdown>
                </div>
              </div>
            </article>
          ) : (
            <div className="text-center py-20 text-zinc-600 font-bold uppercase tracking-widest">
              Generation failed. Please try again.
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!isLoading && post && (
          <div className="p-6 bg-zinc-900/50 border-t border-white/10 flex justify-between items-center">
            <div className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">
              AI Generated Content • Review Before Publishing
            </div>
            <div className="flex space-x-4">
              <button 
                onClick={handleCopy}
                className="flex items-center space-x-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl border border-white/10 transition-all font-bold text-xs uppercase tracking-widest"
              >
                {copied ? <Check size={16} className="text-accent-green" /> : <Copy size={16} />}
                <span>{copied ? 'Copied' : 'Copy Markdown'}</span>
              </button>
              <button 
                onClick={handleDownload}
                className="flex items-center space-x-2 px-6 py-3 bg-accent-orange text-white rounded-2xl hover:bg-accent-orange/80 transition-all font-bold text-xs uppercase tracking-widest shadow-lg shadow-accent-orange/20"
              >
                <Download size={16} />
                <span>Download .md</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
