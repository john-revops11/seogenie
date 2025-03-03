
// Define content type interfaces and types

export type ContentType = 'blog' | 'case-study' | 'white-paper' | 'guide' | 'article';

export interface ContentPreferences {
  focusOnHeadings?: boolean;
  includeMetaDescriptions?: boolean;
  useBulletPoints?: boolean;
  addInternalLinks?: boolean;
  addTablesForData?: boolean;
  includeStatistics?: boolean;
  addFaqSection?: boolean;
}

export interface GeneratedContent {
  title: string;
  metaDescription: string;
  outline: string[];
  content: string;
  ragEnhanced: boolean; // Changed from optional to required
}

// Alias for backward compatibility
export type GeneratedContentType = GeneratedContent;

export interface RagResults {
  relevantKeywords: string[];
  relatedTopics: string[];
  contextualExamples: string[];
  structuralRecommendations: string[];
}
