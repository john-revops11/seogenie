// Define DataForSEO types to avoid import error
export interface DataForSEOTaskIdentifier {
  id: string;
  type: string;
  status: string;
}

export type DataForSEOTaskStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface KeywordData {
  keyword: string;
  monthly_search: number;
  competition: number | string;
  competition_index: number;
  cpc: number;
  position: number | null;
  rankingUrl?: string | null;
  competitorRankings?: Record<string, number | null>;
  competitorUrls?: Record<string, string | null>;
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

// Content block types
export interface ContentBlock {
  id: string;
  type: 'heading1' | 'heading2' | 'heading3' | 'paragraph' | 'list' | 'quote' | 'image' | 'orderedList';
  content: string;
  metadata?: {
    level?: number;
    section?: string;
    heading?: string;
    [key: string]: any;
  };
}

// Editable content block extends ContentBlock
export interface EditableContentBlock extends ContentBlock {
  isEditing: boolean;
}

export interface ContentOutline {
  title?: string;
  metaDescription?: string;
  headings: string[];
  outline?: string[];
  wordCountTarget?: number;
  keywordDensity?: number;
  structureNotes?: string[];
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
}

export interface RagInfo {
  chunksRetrieved: number;
  relevanceScore: number;
  topicsFound?: string[];
  enabled?: boolean;
  usedOpenAIEmbeddings?: boolean;
  model?: string;
}

export interface GeneratedContent {
  title: string;
  metaDescription: string;
  outline: string[];
  content: string;
  blocks: ContentBlock[];
  keywords?: string[];
  contentType?: string;
  generationMethod?: 'standard' | 'rag';
  aiProvider?: string;
  aiModel?: string;
  wordCountOption?: string;
  wordCount?: {
    min: number;
    max: number;
    target: number;
  };
  customBlocksContent?: string;
  ragInfo?: RagInfo;
}

export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  contentType: string;
  structure?: string[];
  headings?: string[];
  promptTemplate?: string;
  outline?: string[];
  sampleContent?: string;
}

export interface SeoRecommendation {
  type?: string;
  category?: string;
  title?: string;
  recommendation?: string;
  details?: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  difficulty?: 'easy' | 'medium' | 'hard';
  implementationDifficulty?: 'easy' | 'medium' | 'hard';
  impact?: 'high' | 'medium' | 'low';
  timeToImplement?: string;
  implementation?: string;
}

export interface TrendData {
  date: string;
  value: number;
  change?: number;
  month?: string;
  volume?: number;
}
