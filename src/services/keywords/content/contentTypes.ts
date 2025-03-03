
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
  ragEnhanced?: boolean;
}

export interface RagResults {
  relevantKeywords: string[];
  relatedTopics: string[];
  contextualExamples: string[];
  structuralRecommendations: string[];
}
