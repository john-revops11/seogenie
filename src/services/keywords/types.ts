
import { DataForSEOTaskIdentifier, DataForSEOTaskStatus } from '../typesDataForSEO';

export interface KeywordData {
  keyword: string;
  monthly_search: number;
  competition: number;
  competition_index: number;
  cpc: number;
  position: number | null;
  rankingUrl?: string | null;
  competitorRankings?: Record<string, number | null>;
}

export interface KeywordGap {
  keyword: string;
  volume: number;
  difficulty: number;
  opportunity: 'high' | 'medium' | 'low';
  competitor: string | null;
  rank: number | null;
  isTopOpportunity: boolean;
  relevance?: number;
  competitiveAdvantage?: number;
  keywordType?: 'gap' | 'missing' | 'shared';
}

export interface DomainKeywordResponse {
  success: boolean;
  reason?: string;
  data: Array<{
    keyword: string;
    monthly_search: number;
    competition: number;
    competition_index: number;
    low_bid: number;
    high_bid: number;
  }>;
}

export interface GoogleKeywordInsightResponse {
  status: string;
  domain: string;
  keywords: Array<{
    keyword: string;
    volume: number;
    difficulty: number;
    cpc: number;
    current_rank?: number;
  }>;
}

export interface DataForSEOKeywordTask {
  id: string;
  status: DataForSEOTaskStatus;
  created: string;
  taskType: 'domain_keywords' | 'competitors' | 'intersection';
  domain?: string;
  competitors?: string[];
  domains?: string[];
  locationCode?: number;
  taskIdentifier?: DataForSEOTaskIdentifier;
}

export interface ApiSource {
  value: string;
  label: string;
}

export interface ContentGenerationRequest {
  title: string;
  topic: string;
  keyword: string;
  secondaryKeywords: string[];
  outline: string[];
  style: string;
  audience: string;
  wordCount: number;
  creativity: number;
  useRag: boolean;
  contentType: string;
  aiModel: string; 
  aiProvider: string;
}

export interface ContentGenerationResponse {
  content: string;
  title: string;
  outline: string[];
  metaDescription?: string;
  keywords: string[];
}
