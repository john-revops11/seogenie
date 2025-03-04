
/**
 * Analyzes and categorizes keywords for content generation
 */

/**
 * Extracts high-value keywords based on volume and opportunity
 */
export const getHighValueKeywords = (keywordMetrics: Array<{
  keyword: string;
  volume: number;
  opportunity: string;
  difficulty: string;
}>): string[] => {
  return keywordMetrics
    .filter(k => k.opportunity === 'high' || k.volume > 500)
    .map(k => k.keyword);
};

/**
 * Identifies long-tail keywords (3+ words)
 */
export const getLongTailKeywords = (keywordsToUse: string[]): string[] => {
  return keywordsToUse.filter(keyword => keyword.split(' ').length >= 3);
};

/**
 * Identifies question-based keywords
 */
export const getQuestionKeywords = (keywordsToUse: string[]): string[] => {
  return keywordsToUse.filter(keyword => 
    /^(how|what|why|when|where|which|who|is|can|does|do|will|should)/.test(keyword.toLowerCase())
  );
};

/**
 * Builds keyword metrics from keywords and gaps data
 */
export const buildKeywordMetrics = (
  keywordsToUse: string[], 
  keywordGaps: any[]
): Array<{
  keyword: string;
  volume: number;
  opportunity: string;
  difficulty: string;
}> => {
  return keywordsToUse.map(keyword => {
    const gap = keywordGaps.find(g => g.keyword === keyword);
    return {
      keyword,
      volume: gap?.volume || 0,
      opportunity: gap?.opportunity || 'medium',
      difficulty: gap?.difficulty || 'medium'
    };
  });
};

/**
 * Extract keywords with highest search volumes
 */
export const getHighVolumeKeywords = (keywordMetrics: Array<{
  keyword: string;
  volume: number;
  opportunity: string;
  difficulty: string;
}>): string[] => {
  return keywordMetrics
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 20)
    .map(k => k.keyword);
};

/**
 * Identifies competitor-specific keywords
 */
export const getCompetitorKeywords = (
  domainKeywords: {[domain: string]: string[]},
  mainDomain: string
): string[] => {
  const allCompetitorKeywords = new Set<string>();
  
  Object.entries(domainKeywords).forEach(([domain, keywords]) => {
    if (domain !== mainDomain) {
      keywords.forEach(k => allCompetitorKeywords.add(k));
    }
  });
  
  return Array.from(allCompetitorKeywords);
};
