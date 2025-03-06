
import { AIProvider } from "@/types/aiModels";

export interface KeywordData {
  keyword: string;
  volume?: number;
  difficulty?: number;
  cpc?: number;
  competition?: number | string;
  trending?: number;
  intent?: string;
  
  // Add the missing properties used by DataForSEO and related components
  monthly_search?: number;
  competition_index?: number;
  position?: number | null;
  rankingUrl?: string | null;
  competitorRankings?: Record<string, number>;
  competitorUrls?: Record<string, string>;
}

export interface CompetitorData {
  domain: string;
  keywords?: KeywordData[];
  traffic?: number;
  rank?: number;
}

export interface DomainAnalysisResult {
  success: boolean;
  domain?: string;
  competitors?: CompetitorData[];
  keywords?: KeywordData[];
  error?: string;
}

export interface KeywordTableRow {
  keyword: string;
  volume?: number;
  difficulty?: number;
  intent?: string;
  position?: number;
  url?: string;
  competitors?: {
    domain: string;
    position?: number;
    url?: string;
  }[];
}

export interface ContentBlock {
  id: string;
  type: 'heading1' | 'heading2' | 'heading3' | 'paragraph' | 'list' | 'quote' | 'image' | 'code';
  content: string;
}

export interface GeneratedContent {
  id?: string;
  title: string;
  metaDescription: string;
  outline: string[];
  blocks: ContentBlock[];
  keywords: string[];
  contentType: string;
  generationMethod: 'standard' | 'rag';
  aiProvider?: AIProvider;
  aiModel?: string;
  createdAt?: string;
  // Add the missing ragInfo property
  ragInfo?: {
    chunksRetrieved: number;
    relevanceScore: number;
  };
}

export interface KeywordGap {
  keyword: string;
  volume: number;
  difficulty: number;
  opportunity: 'high' | 'medium' | 'low';
  competitor: string;
  rank: number;
  relevance?: number;
  competitiveAdvantage?: number;
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
  priority: 'high' | 'medium' | 'low';
  implementation: string;
  category: 'onPage' | 'technical' | 'content' | 'offPage' | 'summary';
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

export interface DomainKeywordResponse {
  success: boolean;
  data?: any[];
  reason?: string;
}

export interface GoogleKeywordInsightResponse {
  status: string;
  keyword?: string;
  keywords?: any[];
}

export interface ContentTemplate {
  id: string;
  name: string;
  contentType: string;
  structure: string[];
  description: string;
}

export interface ContentOutline {
  title: string;
  headings: string[];
  faqs: Array<{question: string, answer: string}>;
}
