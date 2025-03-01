
// Common type definitions for keyword services

export interface KeywordData {
  keyword: string;
  monthly_search: number;
  competition: string;
  competition_index: number;
  cpc: number;
  position?: number | null; // For tracking ranking positions
  rankingUrl?: string | null; // Added to store the URL where keyword ranks
  competitorRankings?: Record<string, number | null>; // For competitor rankings
  competitorUrls?: Record<string, string | null>; // Added to store competitor URLs where keywords rank
}

export interface DomainKeywordResponse {
  success: boolean;
  place_id: number;
  lang_id: number;
  currency_code: string;
  period: string;
  url: string;
  reason?: string;
  data: Array<{
    keyword: string;
    monthly_search: number;
    monthly_search_count?: number;
    change_three_month?: number;
    yoy_change?: number;
    competition: string;
    competition_index: number;
    low_bid: number;
    high_bid: number;
  }>;
}

// Google Keyword Insight API response interface
export interface GoogleKeywordInsightResponse {
  keywords: Array<{
    keyword: string;
    volume: number;
    difficulty: number;
    cpc: number;
    current_rank: number | null;
  }>;
  status: string;
  url: string;
}

export interface KeywordGap {
  keyword: string;
  volume: number;
  difficulty: number;
  opportunity: 'high' | 'medium' | 'low';
  competitor?: string; // Competitor domain that ranks for this keyword
  rank?: number; // The competitor's ranking position for this keyword
}

export interface SeoRecommendation {
  type: 'onPage' | 'technical' | 'content';
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
  details?: string; // Optional details about the recommendation
  implementationDifficulty?: 'easy' | 'medium' | 'hard'; // Optional difficulty assessment
}
