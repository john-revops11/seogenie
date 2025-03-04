
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
} = {
  data: null,
  domain: "",
  competitorDomains: [],
  keywordsLength: 0,
  page: 1,
  itemsPerPage: 15,
  selectedKeywords: []
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
