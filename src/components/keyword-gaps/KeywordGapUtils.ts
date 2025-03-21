import { KeywordGap } from "@/services/keywords/keywordGaps";

// Cache object for keyword gaps data
export const keywordGapsCache: {
  data: KeywordGap[];
  domain: string;
  competitorDomains: string[];
  keywordsLength: number;
  currentPage: number;
  itemsPerPage: number;
  filterCompetitor: string;
  locationCode: number;
  apiSource: string;
  selectedKeywords: string[];
  page: number;
} = {
  data: [],
  domain: "",
  competitorDomains: [],
  keywordsLength: 0,
  currentPage: 1,
  itemsPerPage: 10,
  filterCompetitor: "all",
  locationCode: 2840,
  apiSource: "dataforseo-intersection",
  selectedKeywords: [],
  page: 1
};

/**
 * Normalize a domain name by removing protocol and www prefix
 */
export const normalizeDomain = (domain: string): string => {
  if (!domain) return "";
  return domain.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
};

/**
 * Normalize a list of domain names
 */
export const normalizeDomainList = (domains: string[]): string[] => {
  return domains.map(normalizeDomain);
};

/**
 * Check if competitors have changed between analysis runs
 */
export const haveCompetitorsChanged = (
  currentCompetitors: string[],
  cachedCompetitors: string[]
): boolean => {
  if (currentCompetitors.length !== cachedCompetitors.length) return true;
  
  const normalizedCurrent = normalizeDomainList(currentCompetitors);
  const normalizedCached = normalizeDomainList(cachedCompetitors);
  
  return !normalizedCurrent.every(comp => normalizedCached.includes(comp));
};

/**
 * Get location name from location code
 */
export const getLocationNameByCode = (locationCode: number): string => {
  const locations: {[key: number]: string} = {
    2840: "United States",
    2826: "United Kingdom",
    2124: "Canada",
    2036: "Australia",
    2276: "Germany",
    2250: "France",
    2724: "Spain",
    2380: "Italy",
    2356: "India",
    2392: "Japan"
  };
  
  return locations[locationCode] || `Location (${locationCode})`;
};

/**
 * Get a list of common locations for keyword research
 */
export const commonLocations = [
  { code: 2840, name: "United States" },
  { code: 2826, name: "United Kingdom" },
  { code: 2124, name: "Canada" },
  { code: 2036, name: "Australia" },
  { code: 2276, name: "Germany" },
  { code: 2250, name: "France" },
  { code: 2724, name: "Spain" },
  { code: 2380, name: "Italy" },
  { code: 2356, name: "India" },
  { code: 2392, name: "Japan" }
];

/**
 * Extract unique competitors from a list of keyword gaps
 */
export const getUniqueCompetitors = (keywordGaps: KeywordGap[]): string[] => {
  if (!keywordGaps || keywordGaps.length === 0) return [];
  
  const competitors = new Set<string>();
  keywordGaps.forEach(gap => {
    if (gap.competitors && gap.competitors.length > 0) {
      gap.competitors.forEach(comp => {
        competitors.add(comp);
      });
    }
  });
  
  return Array.from(competitors);
};

/**
 * Categorize keyword intent based on keyword text and metrics
 */
export const categorizeKeywordIntent = (
  keyword: string,
  competitionIndex: number,
  searchVolume: number
): string => {
  // Check for informational intent
  if (/^(how|what|why|when|where|which|who)\s/.test(keyword.toLowerCase())) {
    return 'informational';
  }
  
  // Check for transactional intent
  if (/\b(buy|price|cost|cheap|discount|deal|purchase|order|shop)\b/i.test(keyword)) {
    return 'transactional';
  }
  
  // Check for navigational intent
  if (/\b(login|sign in|account|download|app|website|official)\b/i.test(keyword)) {
    return 'navigational';
  }
  
  // Check for commercial intent
  if (/\b(best|top|review|compare|vs|versus|alternative)\b/i.test(keyword)) {
    return 'commercial';
  }
  
  // Default to informational for high-competition, low-volume keywords
  if (competitionIndex > 70 && searchVolume < 100) {
    return 'informational';
  }
  
  // Default to commercial for medium-competition, high-volume keywords
  if (competitionIndex > 30 && competitionIndex < 70 && searchVolume > 500) {
    return 'commercial';
  }
  
  // Default to transactional for low-competition, high-volume keywords
  if (competitionIndex < 30 && searchVolume > 1000) {
    return 'transactional';
  }
  
  // Default fallback
  return 'informational';
};
