
import { KeywordGap } from "@/services/keywordService";
import { ApiSource } from "@/services/keywords/keywordGaps";

// Common locations for keyword research
export const commonLocations = [
  { code: 2840, name: "United States" },
  { code: 2826, name: "United Kingdom" },
  { code: 2124, name: "Canada" },
  { code: 2036, name: "Australia" },
  { code: 2276, name: "Germany" },
  { code: 2250, name: "France" },
  { code: 2724, name: "Spain" },
  { code: 2380, name: "Italy" },
  { code: 2528, name: "Netherlands" },
  { code: 2484, name: "Mexico" }
];

// Global cache for keyword gaps to avoid redundant API calls
export const keywordGapsCache: {
  data: KeywordGap[] | null;
  domain: string;
  competitorDomains: string[];
  keywordsLength: number;
  page: number;
  itemsPerPage: number;
  selectedKeywords: string[];
  locationCode: number;
  apiSource?: ApiSource; // Add the apiSource property
} = {
  data: null,
  domain: "",
  competitorDomains: [],
  keywordsLength: 0,
  page: 1,
  itemsPerPage: 15,
  selectedKeywords: [],
  locationCode: 2840, // Default to US
  apiSource: 'sample' // Default to sample data
};

// Extract unique competitor names from keyword gaps
export const getUniqueCompetitors = (gaps: KeywordGap[]): string[] => {
  const competitors = new Set<string>();
  
  gaps.forEach(gap => {
    if (gap.competitor) {
      competitors.add(gap.competitor);
    }
  });
  
  // Sort alphabetically for consistent display
  return Array.from(competitors).sort();
};

// Normalize domain names to avoid mismatches due to formatting differences
export const normalizeDomain = (domain: string): string => {
  return domain.replace(/^https?:\/\//, '').replace(/^www\./, '').toLowerCase().trim();
};

// Normalize a list of domains
export const normalizeDomainList = (domains: string[]): string[] => {
  return domains.map(normalizeDomain);
};

// Categorize keyword intent based on keyword text and metrics
export const categorizeKeywordIntent = (
  keyword: string, 
  competitionIndex: number, 
  volume: number
): 'informational' | 'commercial' | 'transactional' | 'navigational' => {
  const lowercaseKeyword = keyword.toLowerCase();
  
  // Check for informational intent first
  if (
    lowercaseKeyword.includes('what is') || 
    lowercaseKeyword.includes('how to') || 
    lowercaseKeyword.includes('guide') ||
    lowercaseKeyword.includes('tutorial') ||
    lowercaseKeyword.includes('tips') ||
    lowercaseKeyword.includes('examples')
  ) {
    return 'informational';
  }
  
  // Check for transactional intent
  if (
    lowercaseKeyword.includes('buy') || 
    lowercaseKeyword.includes('purchase') || 
    lowercaseKeyword.includes('order') ||
    lowercaseKeyword.includes('cheap') ||
    lowercaseKeyword.includes('discount') ||
    lowercaseKeyword.includes('deal') ||
    lowercaseKeyword.includes('price') ||
    lowercaseKeyword.includes('subscription')
  ) {
    return 'transactional';
  }
  
  // Check for commercial intent
  if (
    lowercaseKeyword.includes('best') || 
    lowercaseKeyword.includes('review') || 
    lowercaseKeyword.includes('top') ||
    lowercaseKeyword.includes('comparison') ||
    lowercaseKeyword.includes('vs') ||
    lowercaseKeyword.includes('versus') ||
    lowercaseKeyword.includes('alternative') ||
    (competitionIndex > 70 && volume > 100)
  ) {
    return 'commercial';
  }
  
  // Default to navigational if no other intent is detected
  return 'navigational';
};

// Get location name from code
export const getLocationNameByCode = (code: number): string => {
  const locations: Record<number, string> = {
    2840: "United States",
    2826: "United Kingdom",
    2124: "Canada",
    2036: "Australia",
    2276: "Germany",
    2250: "France",
    2724: "Spain",
    2380: "Italy",
    2528: "Netherlands",
    2484: "Mexico"
  };
  
  return locations[code] || `Location ${code}`;
};

// Format keyword volume with K/M suffix
export const formatVolume = (volume: number): string => {
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`;
  } else if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K`;
  } else {
    return volume.toString();
  }
};
