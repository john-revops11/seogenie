
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
  priority: 'high' | 'medium' | 'low';  // Changed from number to string enum
  implementation: string;
  category: 'onPage' | 'technical' | 'content' | 'offPage' | 'summary';
  type?: string;  // Added to match usage in SeoRecommendationsCard
  recommendation?: string;  // Added to match usage in SeoRecommendationsCard
  details?: string;  // Added to match usage in SeoRecommendationsCard
  implementationDifficulty?: string;  // Added to match usage in SeoRecommendationsCard
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Add the missing types that are causing errors in api.ts
export interface DomainKeywordResponse {
  // Add the necessary properties based on the actual implementation
  domain: string;
  keywords: KeywordData[];
}

export interface GoogleKeywordInsightResponse {
  // Add the necessary properties based on the actual implementation
  keyword: string;
  insights: any; // Replace with specific type if available
}
