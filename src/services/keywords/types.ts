
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

// Updated SeoRecommendation interface to include both old and new properties
export interface SeoRecommendation {
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'medium' | 'hard';
  priority: 'high' | 'medium' | 'low';  // Changed from number to string enum
  implementation: string;
  category: 'onPage' | 'technical' | 'content' | 'offPage' | 'summary';
  // Additional properties used in existing code
  type?: string;
  recommendation?: string;
  details?: string;
  implementationDifficulty?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Define the missing types needed for api.ts
export interface DomainKeywordResponse {
  success: boolean;
  reason?: string;
  data: {
    keyword: string;
    monthly_search: number;
    competition: string;
    competition_index: number;
    low_bid: number;
    high_bid: number;
  }[];
}

export interface GoogleKeywordInsightResponse {
  status: string;
  keyword?: string;
  keywords: {
    keyword: string;
    volume: number;
    difficulty: number;
    cpc: number;
    current_rank?: number;
  }[];
  insights?: any;
}
