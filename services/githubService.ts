import { Repository, SearchFilters, SearchResult } from "../types";
import { MOCK_REPOS } from "../constants";

export const fetchTrendingRepos = async (filters: SearchFilters): Promise<SearchResult> => {
  try {
    const date = new Date();
    // Calculate date based on period filter
    switch (filters.period) {
      case 'daily':
        date.setDate(date.getDate() - 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() - 7);
        break;
      case 'monthly':
        date.setDate(date.getDate() - 30);
        break;
      default:
        date.setDate(date.getDate() - 7); // Default to weekly
    }
    const dateString = date.toISOString().split('T')[0];

    let q = '';

    // If there is a search query, we search globally (not restricted by date)
    // If no query, we look for trending items from the specified period
    if (filters.query && filters.query.trim().length > 0) {
      q = filters.query;
    } else {
      q = `created:>${dateString} stars:>500`;
    }

    if (filters.language) {
      q += ` language:${filters.language}`;
    }

    const encodedQuery = encodeURIComponent(q);
    const page = filters.page || 1;
    
    // Sort and order must be separate query parameters
    const response = await fetch(`https://api.github.com/search/repositories?q=${encodedQuery}&sort=stars&order=desc&per_page=12&page=${page}`);

    if (!response.ok) {
        if (response.status === 403 || response.status === 429) {
            console.warn("GitHub API rate limit exceeded. Using mock data.");
            return { items: MOCK_REPOS as unknown as Repository[], total_count: MOCK_REPOS.length };
        }
        throw new Error(`GitHub API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return { 
      items: data.items || [], 
      total_count: data.total_count || 0 
    };
  } catch (error) {
    console.error("Failed to fetch repos, falling back to mock data:", error);
    // Fallback for demo stability
    return { items: MOCK_REPOS as unknown as Repository[], total_count: MOCK_REPOS.length };
  }
};