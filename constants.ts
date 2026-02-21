import { SearchFilters } from "./types";

export const DEFAULT_FILTERS: SearchFilters = {
  language: '',
  period: 'weekly',
  query: '',
  page: 1,
  provider: 'gemini',
  sort: 'stars',
  order: 'desc'
};

export const POPULAR_LANGUAGES = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Rust',
  'Go',
  'Java',
  'C++',
  'Swift'
];

export const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: '#f7df1e',
  TypeScript: '#3178c6',
  Python: '#3776ab',
  Rust: '#dea584',
  Go: '#00add8',
  Java: '#b07219',
  'C++': '#f34b7d',
  Swift: '#ffac45',
  Vue: '#41b883',
  React: '#61dafb',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Zig: '#ec915c',
  Elixir: '#6e4a7e'
};

export const AI_PROVIDERS = [
  { id: 'gemini', name: 'Google Gemini' },
  { id: 'anthropic', name: 'Anthropic Claude' },
  { id: 'openrouter', name: 'OpenRouter (Multi)' }
];

// Fallback data in case GitHub API rate limits are hit
export const MOCK_REPOS = [
  {
    id: 1,
    name: "react",
    full_name: "facebook/react",
    description: "A declarative, efficient, and flexible JavaScript library for building user interfaces.",
    stargazers_count: 213000,
    forks_count: 45000,
    language: "JavaScript",
    html_url: "https://github.com/facebook/react",
    owner: {
      login: "facebook",
      avatar_url: "https://avatars.githubusercontent.com/u/69631?v=4"
    },
    topics: ["declarative", "frontend", "javascript", "library", "react", "ui"],
    updated_at: "2023-10-26T10:00:00Z",
    created_at: "2013-05-24T16:15:54Z"
  },
  {
    id: 2,
    name: "three.js",
    full_name: "mrdoob/three.js",
    description: "JavaScript 3D Library.",
    stargazers_count: 95000,
    forks_count: 34000,
    language: "JavaScript",
    html_url: "https://github.com/mrdoob/three.js",
    owner: {
      login: "mrdoob",
      avatar_url: "https://avatars.githubusercontent.com/u/97088?v=4"
    },
    topics: ["3d", "html5", "javascript", "svg", "webgl"],
    updated_at: "2023-10-25T15:30:00Z",
    created_at: "2010-03-23T18:58:01Z"
  },
  {
    id: 3,
    name: "bun",
    full_name: "oven-sh/bun",
    description: "Incredibly fast JavaScript runtime, bundler, test runner, and package manager – all in one",
    stargazers_count: 67000,
    forks_count: 2000,
    language: "Zig",
    html_url: "https://github.com/oven-sh/bun",
    owner: {
      login: "oven-sh",
      avatar_url: "https://avatars.githubusercontent.com/u/102660117?v=4"
    },
    topics: ["bun", "javascript", "runtime", "typescript", "zig"],
    updated_at: "2023-10-27T09:15:00Z",
    created_at: "2021-04-26T18:50:52Z"
  },
   {
    id: 4,
    name: "pytorch",
    full_name: "pytorch/pytorch",
    description: "Tensors and Dynamic neural networks in Python with strong GPU acceleration",
    stargazers_count: 75000,
    forks_count: 21000,
    language: "Python",
    html_url: "https://github.com/pytorch/pytorch",
    owner: {
      login: "pytorch",
      avatar_url: "https://avatars.githubusercontent.com/u/21003710?v=4"
    },
    topics: ["deep-learning", "machine-learning", "neural-network", "python", "tensor"],
    updated_at: "2023-10-27T11:00:00Z",
    created_at: "2016-08-13T05:29:22Z"
  }
];