
import { AIProvider } from "@/types/aiModels";
import { GeneratedContent } from "@/services/keywords/types";

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
  generatedContent: GeneratedContent;
}

export interface RAGInfo {
  chunksRetrieved: number;
  relevanceScore: number;
  topicsFound: string[];
}
