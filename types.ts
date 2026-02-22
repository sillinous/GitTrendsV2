export type AiProvider = 'gemini' | 'anthropic' | 'openrouter';

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  html_url: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  topics: string[];
  updated_at: string;
  created_at: string;
}

export interface AnalysisResult {
  summary: string;
  useCases: string[];
  techStackAnalysis: string;
  hypeScore: number;
  nextDirections: string[];
  revenueModels: string[];
  competitors: string[];
  riskAssessment: string;
  provider?: AiProvider;
}

export interface SearchFilters {
  language: string;
  period: 'daily' | 'weekly' | 'monthly';
  query: string;
  page: number;
  provider: AiProvider;
  sort: 'stars' | 'forks' | 'updated';
  order: 'asc' | 'desc';
}

export interface BlogPost {
  title: string;
  content: string;
  tags: string[];
  summary: string;
  author: string;
  date: string;
}

export interface Task {
  id: string;
  repoId: number;
  repoName: string;
  repoFullName: string;
  status: 'pending' | 'completed';
  createdAt: string;
}

export interface SearchResult {
  items: Repository[];
  total_count: number;
}