
import { KeywordGap } from "@/services/keywordService";
import { extractDomain } from "@/services/keywords/utils/domainUtils";

export const keywordGapsCache = {
  data: null as KeywordGap[] | null,
  domain: "",
  competitorDomains: [] as string[],
  keywordsLength: 0,
  selectedKeywords: [] as string[],
  page: 1,
  itemsPerPage: 15
};

export const prioritizeKeywords = (keywords: KeywordGap[]): KeywordGap[] => {
  const keywordsWithIntent = keywords.map(kw => ({
    ...kw,
    intent: categorizeKeywordIntent(kw.keyword, kw.difficulty, kw.volume)
  }));
  
  const informationalKeywords = keywordsWithIntent.filter(kw => kw.intent === 'informational');
  const navigationalKeywords = keywordsWithIntent.filter(kw => kw.intent === 'navigational');
  const commercialKeywords = keywordsWithIntent.filter(kw => kw.intent === 'commercial');
  const transactionalKeywords = keywordsWithIntent.filter(kw => kw.intent === 'transactional');
  
  return [
    ...informationalKeywords,
    ...navigationalKeywords,
    ...commercialKeywords,
    ...transactionalKeywords
  ];
};

export const categorizeKeywordIntent = (keyword: string, difficulty: number, volume: number): 'informational' | 'navigational' | 'commercial' | 'transactional' => {
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
};

export const getUniqueCompetitors = (keywordGaps: KeywordGap[] | null): string[] => {
  if (!keywordGaps) return [];
  const competitors = new Set<string>();
  keywordGaps.forEach(gap => {
    if (gap.competitor) competitors.add(gap.competitor);
  });
  return Array.from(competitors);
};

export const haveCompetitorsChanged = (
  newDomain: string, 
  newCompetitors: string[], 
  cachedDomain: string,
  cachedCompetitors: string[]
): boolean => {
  if (cachedDomain !== newDomain) return true;
  
  if (!cachedCompetitors || newCompetitors.length !== cachedCompetitors.length) {
    return true;
  }
  
  // Check if all competitors are the same
  return !newCompetitors.every(comp => cachedCompetitors.includes(comp));
};

// Ensure we're extracting domain names correctly for comparison
export const normalizeDomainList = (domains: string[]): string[] => {
  return domains.map(domain => {
    try {
      return extractDomain(domain);
    } catch (e) {
      // If extraction fails, return as is
      return domain.trim().toLowerCase();
    }
  });
};
