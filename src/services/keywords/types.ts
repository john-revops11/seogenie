
export interface KeywordData {
  keyword: string;
  monthly_search: number;
  competition: string;
  competition_index: number;
  cpc: number;
  position: number | null;
  rankingUrl?: string | null;
  competitorRankings?: Record<string, number>;
  competitorUrls?: Record<string, string>;
}

export interface KeywordGap {
  keyword: string;
  volume: number;
  difficulty: number;
  opportunity: 'high' | 'medium' | 'low';
  competitor: string;
  rank: number;
  relevance?: number;  // Added as optional to maintain backward compatibility
  competitiveAdvantage?: number;  // Added as optional to maintain backward compatibility
  isTopOpportunity?: boolean;
}

export interface KeywordResearchPrompt {
  keyword: string;
  relatedKeywords: string[];
}

export interface SeoRecommendation {
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'medium' | 'hard';
  priority: number;
  implementation: string;
  category: 'onPage' | 'technical' | 'content' | 'offPage' | 'summary';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
