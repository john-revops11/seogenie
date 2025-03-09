
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
  
  // Normalize main domain name
  const normalizedMainDomain = mainDomain.replace(/^https?:\/\//, '').replace(/^www\./, '');
  
  // Add main domain keywords first
  mainKeywords.forEach(kw => {
    // Simulate a ranking position and URL for the main domain
    const position = kw.position || Math.floor(Math.random() * 100) + 1;
    const rankingUrl = kw.rankingUrl || generateSampleUrl(mainDomain, kw.keyword);
    
    keywordMap.set(kw.keyword, {
      keyword: kw.keyword,
      monthly_search: kw.monthly_search,
      competition: kw.competition,
      competition_index: kw.competition_index,
      cpc: kw.cpc,
      position: position,
      rankingUrl: rankingUrl,
      competitorRankings: {},
      competitorUrls: {}
    });
  });
  
  // Add competitor keywords and rankings
  competitorResults.forEach(({ domain, keywords }) => {
    // Make sure to use the normalized domain that was returned from processCompetitorData
    const domainName = domain.replace(/^https?:\/\//, '').replace(/^www\./, '');
    
    // Debug log for domain normalization
    console.log(`Processing competitor in mergeKeywordData: ${domain} -> ${domainName}`);
    
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
        
        // Simulate a ranking position and URL for this competitor
        const position = kw.position || Math.floor(Math.random() * 100) + 1;
        const rankingUrl = kw.rankingUrl || generateSampleUrl(domain, kw.keyword);
        
        existing.competitorRankings[domainName] = position;
        existing.competitorUrls[domainName] = rankingUrl;
      } else {
        // Add new keyword that main domain doesn't have
        const position = kw.position || Math.floor(Math.random() * 100) + 1;
        const rankingUrl = kw.rankingUrl || generateSampleUrl(domain, kw.keyword);
        
        keywordMap.set(kw.keyword, {
          keyword: kw.keyword,
          monthly_search: kw.monthly_search,
          competition: kw.competition,
          competition_index: kw.competition_index,
          cpc: kw.cpc,
          position: null, // Main domain doesn't rank for this
          rankingUrl: null,
          competitorRankings: {
            [domainName]: position
          },
          competitorUrls: {
            [domainName]: rankingUrl
          }
        });
      }
    });
  });
  
  return Array.from(keywordMap.values());
};
