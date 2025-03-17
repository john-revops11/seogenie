
import { KeywordData } from "../types";

/**
 * Generates sample keyword data when the API returns no results or fails
 * This helps provide a better UX rather than showing empty tables
 */
export const generateSampleKeywords = (domain: string, count: number = 10): KeywordData[] => {
  const sampleKeywords = [
    "pricing strategy", "pricing optimization", "revenue management", 
    "price analytics", "competitive pricing", "dynamic pricing",
    "value based pricing", "pricing software", "pricing intelligence",
    "revenue optimization", "price management", "profit optimization"
  ];
  
  const results: KeywordData[] = [];
  
  // Generate sample data based on the domain name and some preset keywords
  for (let i = 0; i < Math.min(count, sampleKeywords.length); i++) {
    const keyword = sampleKeywords[i];
    const volume = Math.floor(Math.random() * 5000) + 100;
    const competition = Math.random();
    const competitionIndex = Math.floor(Math.random() * 100);
    const position = Math.floor(Math.random() * 30) + 1;
    
    results.push({
      keyword,
      monthly_search: volume,
      competition: competition.toFixed(2),
      competition_index: competitionIndex,
      cpc: (Math.random() * 10 + 1).toFixed(2),
      position: position,
      rankingUrl: `https://${domain}/${keyword.replace(/\s+/g, '-')}`,
      competitorRankings: {},
      competitorUrls: {}
    });
  }
  
  return results;
};

/**
 * Determines if sample data should be used based on API response
 */
export const shouldUseSampleData = (
  keywords: KeywordData[],
  apiHadErrors: boolean
): boolean => {
  // Use sample data if:
  // 1. API call had errors, or
  // 2. No keywords were returned
  return apiHadErrors || (keywords.length === 0);
};

/**
 * Enhances keyword data with mock competitor data
 */
export const enhanceWithCompetitorData = (
  keywords: KeywordData[],
  competitors: string[]
): KeywordData[] => {
  if (!keywords || keywords.length === 0) return [];
  if (!competitors || competitors.length === 0) return keywords;
  
  return keywords.map(keyword => {
    const enhanced = { ...keyword };
    if (!enhanced.competitorRankings) enhanced.competitorRankings = {};
    if (!enhanced.competitorUrls) enhanced.competitorUrls = {};
    
    competitors.forEach(competitor => {
      if (!enhanced.competitorRankings[competitor]) {
        // Add random position between 1-100, with 20% chance of not ranking
        const hasRanking = Math.random() > 0.2;
        enhanced.competitorRankings[competitor] = hasRanking 
          ? Math.floor(Math.random() * 100) + 1
          : null;
        
        // Add URL if ranking
        if (hasRanking && enhanced.competitorRankings[competitor]) {
          enhanced.competitorUrls[competitor] = `https://${competitor}/${keyword.keyword.replace(/\s+/g, '-')}`;
        } else {
          enhanced.competitorUrls[competitor] = null;
        }
      }
    });
    
    return enhanced;
  });
};
