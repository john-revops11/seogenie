
import { AIProvider } from "@/types/aiModels";

export interface GenerateContentParams {
  domain: string;
  keywords: string[];
  contentType: string;
  title: string;
  creativity: number;
  contentPreferences: string[];
  templateId: string;
  aiProvider: AIProvider;
  aiModel: string;
  ragEnabled: boolean;
  wordCountOption: string;
  customSubheadings?: string[];
}

export interface ContentGenerationResult {
  content: string;
  generatedContent: any;
}

export interface RAGInfo {
  chunksRetrieved: number;
  relevanceScore: number;
  topicsFound: string[];
}

export interface ContentOutlineResult {
  headings: string[];
  faqs?: Array<{ question: string; answer: string }>;
}
