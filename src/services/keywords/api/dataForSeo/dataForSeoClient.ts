
// DataForSEO API client service - Main export file
// This file re-exports all DataForSEO functionality from the modular files

// Re-export base client functionality
export { 
  callDataForSeoApi,
  clearApiCache,
  ENDPOINT_COSTS,
  generateRequestHash,
  type DataForSEOEndpoint
} from './base/apiClient';

// Re-export domain analytics functions
export {
  fetchDomainAnalytics,
  fetchDomainKeywords,
  fetchDomainIntersection,
  fetchCompetitorsDomain
} from './domainAnalytics';

// Re-export backlink analytics functions
export {
  fetchBacklinkData
} from './backlinkAnalytics';

// Re-export keyword analytics functions
export {
  fetchKeywordVolume,
  fetchRelatedKeywords,
  fetchKeywordSuggestions
} from './keywordAnalytics';

// Re-export usage analytics functions
export {
  getDataForSEOUsageCost
} from './usageAnalytics';
