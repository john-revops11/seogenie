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

export interface ContentBlock {
  id: string;
  type: 'heading1' | 'heading2' | 'heading3' | 'paragraph' | 'list' | 'quote' | 'faq';
  content: string;
  metadata?: Record<string, any>;
}

export interface ContentOutline {
  title: string;
  headings: string[];
  faqs: Array<{question: string, answer: string}>;
}

export interface GeneratedContent {
  title: string;
  metaDescription: string;
  outline: string[];
  blocks: ContentBlock[];
  keywords: string[];
  contentType: string;
  generationMethod: 'standard' | 'rag';
  ragInfo?: {
    chunksRetrieved: number;
    relevanceScore: number;
  };
}
