
// Re-export types and functions from specialized modules
export * from './keywords/types';
export * from './keywords/api';
export * from './keywords/domainAnalysis';
export * from './keywords/contentGeneration';
export * from './keywords/keywordGaps';
export * from './keywords/seoRecommendations';

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
  return currentCompetitors.filter(domain => domain !== domainToRemove);
};
