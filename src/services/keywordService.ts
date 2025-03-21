
// Re-export types and functions from specialized modules
export * from './keywords/types';
export * from './keywords/api';
export * from './keywords/domainAnalysis';
export * from './keywords/contentGeneration';
export * from './keywords/keywordGaps';
export * from './keywords/seoRecommendations';

// Re-export utilities for keyword analysis
export * from './keywords/utils/mockDataGenerator';
export * from './keywords/utils/competitorDataProcessor';
export * from './keywords/utils/keywordDataMerger';

// Re-export updated keyword analysis
export {
  getHighValueKeywords,
  getLongTailKeywords,
  getQuestionKeywords,
  buildKeywordMetrics,
  getHighVolumeKeywords,
  getCompetitorKeywords
} from '../utils/topicGeneration/keywordAnalysis';

// Re-export SemRush API functions with renamed export to avoid conflict
export { 
  fetchDomainOverview,
  fetchKeywordData,
  fetchDomainKeywords as fetchSemrushDomainKeywords, // Rename to avoid conflict
  testSemrushConnection,
  isSemrushConfigured
} from './keywords/semrushApi';

// Export new specialized functions for Revology Analytics
export * from './keywords/revologySeoStrategy';

// Export vector database services
export * from './vector/pineconeService';

// Export additional utilities for the system health card
export {
  testPineconeConnection,
  getPineconeConfig,
  getPineconeHostUrl
} from './vector/pineconeService';

// Add a new function to handle competitor removal
export const removeCompetitorDomain = (
  currentCompetitors: string[],
  domainToRemove: string
): string[] => {
  // Normalize the domain to remove for case-insensitive comparison
  const normalizedDomainToRemove = domainToRemove.trim().toLowerCase();
  
  // Filter out the domain to remove (case-insensitive)
  return currentCompetitors.filter(domain => {
    const normalizedDomain = domain.trim().toLowerCase();
    return normalizedDomain !== normalizedDomainToRemove;
  });
};

// Re-export API source type from keywordGaps
export type { ApiSource } from './keywords/keywordGaps';
