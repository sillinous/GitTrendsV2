import { Repository, AnalysisResult, BlogPost } from '../types';

export interface ExportPayload {
  type: 'repo' | 'post';
  title: string;
  content: string;
  url?: string;
  author?: string;
  metadata?: any;
}

export const exportToExternalBlog = async (payload: ExportPayload, retries = 3, delay = 1000) => {
  // Determine the correct Blog URL based on current environment
  const isPre = window.location.hostname.includes('ais-pre-');
  const BLOG_URL = isPre 
    ? 'https://ais-pre-qv77p7ub3mlkzosr6z6itu-66557052969.us-east1.run.app'
    : 'https://ais-dev-qv77p7ub3mlkzosr6z6itu-66557052969.us-east1.run.app';
  
  const message = {
    type: 'EXPORT_DATA',
    payload: payload
  };

  // Always try postMessage immediately as it's local and not rate-limited
  if (window.opener) {
    window.opener.postMessage(message, '*');
  }
  
  if (window.parent && window.parent !== window) {
    window.parent.postMessage(message, '*');
  }

  for (let i = 0; i <= retries; i++) {
    try {
      // Option A: Direct API Call via local proxy to bypass CORS
      // ONLY for 'post' type as per user requirement
      if (payload.type === 'post') {
        const response = await fetch('/api/proxy-export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetUrl: `${BLOG_URL}/api/import`,
            data: payload
          })
        });
        
        if (response.ok) {
          return true;
        }

        const errorText = await response.text();
        
        // If rate limited and we have retries left, wait and try again
        if (response.status === 429 && i < retries) {
          console.warn(`Rate limit hit. Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
          continue;
        }

        throw new Error(errorText || `Export failed with status ${response.status}`);
      } else {
        // For non-post types, we only do postMessage (already done above)
        return true;
      }
    } catch (error) {
      if (i === retries) {
        console.error('Export failed after all retries:', error);
        // If we have a window connection, we consider it a partial success
        if (window.opener || (window.parent && window.parent !== window)) {
          return true; 
        }
        throw error;
      }
      
      // For network errors, also retry
      console.warn(`Export attempt ${i + 1} failed. Retrying...`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
  
  return true;
};

export const createRepoExportPayload = (repo: Repository, analysis: AnalysisResult | null): ExportPayload => {
  return {
    type: 'repo',
    title: repo.name,
    content: repo.description || `Analysis for ${repo.full_name}`,
    url: repo.html_url,
    author: repo.owner.login,
    metadata: {
      repo,
      analysis,
      source: 'GitTrends AI'
    }
  };
};

export const createPostExportPayload = (repo: Repository, post: BlogPost, analysis: AnalysisResult | null): ExportPayload => {
  // Append a structured analysis section to the blog post content
  let enrichedContent = post.content;
  
  if (analysis) {
    enrichedContent += `\n\n---\n\n## 🧬 Project DNA & Technical Analysis\n\n`;
    enrichedContent += `### 💡 Abstract\n${analysis.summary}\n\n`;
    enrichedContent += `### 🏗️ Architecture & Tech Stack\n${analysis.techStackAnalysis}\n\n`;
    
    if (analysis.riskAssessment) {
      enrichedContent += `### ⚠️ Risk Assessment\n${analysis.riskAssessment}\n\n`;
    }
    
    enrichedContent += `### 📊 Market Intelligence\n`;
    enrichedContent += `- **Hype Score:** ${analysis.hypeScore}/100\n`;
    enrichedContent += `- **Competitors:** ${analysis.competitors.length > 0 ? analysis.competitors.join(', ') : 'None identified'}\n`;
    enrichedContent += `- **Revenue Models:** ${analysis.revenueModels.join(', ')}\n\n`;
    
    enrichedContent += `### 🚀 Future Horizons\n`;
    enrichedContent += analysis.nextDirections.map(d => `- ${d}`).join('\n');
    enrichedContent += `\n\n### 🛠️ Key Use Cases\n`;
    enrichedContent += analysis.useCases.map(u => `- ${u}`).join('\n');
  }

  return {
    type: 'post',
    title: post.title,
    content: enrichedContent,
    url: repo.html_url,
    author: post.author,
    metadata: {
      summary: post.summary,
      tags: post.tags,
      repoName: repo.full_name,
      repo: repo,
      analysis: analysis,
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      language: repo.language,
      exportedAt: new Date().toISOString()
    }
  };
};
