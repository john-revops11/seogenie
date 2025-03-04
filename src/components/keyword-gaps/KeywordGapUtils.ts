
import { KeywordGap } from "@/services/keywordService";

// A global cache to prevent unnecessary API calls and data loss between component re-renders
export const keywordGapsCache: {
  data: KeywordGap[] | null;
  domain: string;
  competitorDomains: string[];
  keywordsLength: number;
  page: number;
  itemsPerPage: number;
  selectedKeywords: string[];
  locationCode: number;
} = {
  data: null,
  domain: "",
  competitorDomains: [],
  keywordsLength: 0,
  page: 1,
  itemsPerPage: 15,
  selectedKeywords: [],
  locationCode: 2840 // Default to US (2840)
};

/**
 * Get a list of unique competitor domains from keyword gaps
 */
export function getUniqueCompetitors(keywordGaps: KeywordGap[]): string[] {
  const uniqueCompetitors = new Set<string>();
  
  keywordGaps.forEach(gap => {
    if (gap.competitor) {
      uniqueCompetitors.add(gap.competitor);
    }
  });
  
  return Array.from(uniqueCompetitors).sort();
}

/**
 * Normalize a list of domains for comparison
 */
export function normalizeDomainList(domains: string[]): string[] {
  return domains
    .filter(domain => domain && domain.trim() !== "")
    .map(domain => domain.trim().toLowerCase());
}

/**
 * Categorize keyword intent based on keyword content, difficulty, and volume
 */
export function categorizeKeywordIntent(keyword: string, difficulty: number, volume: number): 'informational' | 'navigational' | 'commercial' | 'transactional' {
  const informationalPatterns = ['how', 'what', 'why', 'when', 'where', 'guide', 'tutorial', 'tips', 'learn', 'example', 'definition'];
  const navigationalPatterns = ['login', 'signin', 'account', 'download', 'contact', 'support', 'official'];
  const commercialPatterns = ['best', 'top', 'review', 'compare', 'vs', 'versus', 'comparison', 'alternative'];
  const transactionalPatterns = ['buy', 'price', 'cost', 'purchase', 'cheap', 'deal', 'discount', 'order', 'shop'];
  
  const keywordLower = keyword.toLowerCase();
  
  if (informationalPatterns.some(pattern => keywordLower.includes(pattern))) {
    return 'informational';
  }
  
  if (navigationalPatterns.some(pattern => keywordLower.includes(pattern))) {
    return 'navigational';
  }
  
  if (commercialPatterns.some(pattern => keywordLower.includes(pattern))) {
    return 'commercial';
  }
  
  if (transactionalPatterns.some(pattern => keywordLower.includes(pattern))) {
    return 'transactional';
  }
  
  return difficulty < 40 ? 'informational' : 'commercial';
}

/**
 * Common locations for DataForSEO
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
  { code: 2643, name: "India" },
  { code: 2392, name: "Japan" },
  { code: 2076, name: "Brazil" },
  { code: 2158, name: "China" }
];

/**
 * Get location name by code
 */
export function getLocationNameByCode(code: number): string {
  const location = commonLocations.find(loc => loc.code === code);
  return location ? location.name : "Unknown";
}
