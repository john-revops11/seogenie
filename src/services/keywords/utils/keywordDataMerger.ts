
import { KeywordData } from '../types';
import { generateSampleUrl } from './mockDataGenerator';

/**
 * Merge and normalize keywords from main domain and competitors
 */
export const mergeKeywordData = (
  mainDomain: string,
  mainKeywords: KeywordData[],
  competitorResults: Array<{ domain: string, keywords: KeywordData[] }>
): KeywordData[] => {
  const keywordMap = new Map<string, KeywordData>();
  
  // Add main domain keywords first
  mainKeywords.forEach(kw => {
    // Track if this is real API data or mock data
    const isRealData = kw.rankingUrl && kw.rankingUrl.includes('http');
    
    keywordMap.set(kw.keyword, {
      keyword: kw.keyword,
      monthly_search: kw.monthly_search,
      competition: kw.competition,
      competition_index: kw.competition_index,
      cpc: kw.cpc,
      position: kw.position || null,
      rankingUrl: kw.rankingUrl || null,
      competitorRankings: {},
      competitorUrls: {},
      dataSource: isRealData ? 'api' : 'sample' // Track data source
    });
  });
  
  // Add competitor keywords and rankings
  competitorResults.forEach(({ domain, keywords }) => {
    // Extract just the domain name without protocol and www prefix for cleaner display
    const domainName = domain.replace(/^https?:\/\//, '').replace(/^www\./, '');
    
    keywords.forEach(kw => {
      if (keywordMap.has(kw.keyword)) {
        // Update existing keyword with competitor ranking
        const existing = keywordMap.get(kw.keyword)!;
        if (!existing.competitorRankings) {
          existing.competitorRankings = {};
        }
        if (!existing.competitorUrls) {
          existing.competitorUrls = {};
        }
        
        // Track if this is real API data
        const isRealData = kw.rankingUrl && kw.rankingUrl.includes('http');
        
        existing.competitorRankings[domainName] = kw.position || null;
        existing.competitorUrls[domainName] = kw.rankingUrl || null;
        
        // Update data source if this is real API data
        if (isRealData && existing.dataSource === 'sample') {
          existing.dataSource = 'mixed';
        }
      } else {
        // Add new keyword that main domain doesn't have
        // Track if this is real API data
        const isRealData = kw.rankingUrl && kw.rankingUrl.includes('http');
        
        keywordMap.set(kw.keyword, {
          keyword: kw.keyword,
          monthly_search: kw.monthly_search,
          competition: kw.competition,
          competition_index: kw.competition_index,
          cpc: kw.cpc,
          position: null, // Main domain doesn't rank for this
          rankingUrl: null,
          competitorRankings: {
            [domainName]: kw.position || null
          },
          competitorUrls: {
            [domainName]: kw.rankingUrl || null
          },
          dataSource: isRealData ? 'api' : 'sample' // Track data source
        });
      }
    });
  });
  
  return Array.from(keywordMap.values());
};
