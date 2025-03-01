
import { toast } from "sonner";
import { KeywordData } from './types';
import { fetchDomainKeywords } from './api';
import { generateSampleUrl } from './syntheticData';
import { ensureValidUrl } from './api';

export const analyzeDomains = async (
  mainDomain: string, 
  competitorDomains: string[]
): Promise<{
  keywords: KeywordData[],
  success: boolean
}> => {
  try {
    // Make sure domains have proper URL format
    const formattedMainDomain = ensureValidUrl(mainDomain);
    const formattedCompetitorDomains = competitorDomains
      .filter(domain => domain.trim() !== "")
      .map(domain => ensureValidUrl(domain));
    
    console.log("Analyzing domains using Google Keyword Insight API:", formattedMainDomain, formattedCompetitorDomains);
    
    // Start with loading the main domain keywords
    const mainKeywords = await fetchDomainKeywords(formattedMainDomain);
    
    if (!mainKeywords.length) {
      throw new Error(`No keywords found for ${formattedMainDomain}`);
    }
    
    // Process competitor domains one by one with better error handling
    const competitorResults = [];
    
    for (const domain of formattedCompetitorDomains) {
      try {
        toast.info(`Analyzing competitor: ${domain}`);
        const keywords = await fetchDomainKeywords(domain);
        
        if (keywords.length > 0) {
          competitorResults.push({ domain, keywords });
          toast.success(`Found ${keywords.length} keywords for ${domain}`);
        } else {
          console.warn(`No keywords found for ${domain}`);
          toast.warning(`No keywords found for ${domain}`);
        }
      } catch (error) {
        console.error(`Error analyzing competitor ${domain}:`, error);
        toast.error(`Failed to analyze ${domain}: ${(error as Error).message}`);
        // Continue with other competitors even if one fails
      }
    }
    
    // Process and merge data
    const keywordMap = new Map<string, KeywordData>();
    
    // Add main domain keywords first
    mainKeywords.forEach(kw => {
      // Simulate a ranking position and URL for the main domain
      const position = Math.floor(Math.random() * 100) + 1;
      const rankingUrl = generateSampleUrl(formattedMainDomain, kw.keyword);
      
      keywordMap.set(kw.keyword, {
        keyword: kw.keyword,
        monthly_search: kw.monthly_search,
        competition: kw.competition,
        competition_index: kw.competition_index,
        cpc: kw.cpc,
        position: position, // Simulate ranking position
        rankingUrl: rankingUrl, // Add ranking URL
        competitorRankings: {},
        competitorUrls: {}
      });
    });
    
    // Add competitor keywords and rankings
    competitorResults.forEach(({ domain, keywords }) => {
      const domainName = new URL(domain).hostname.replace(/^www\./, '');
      
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
          const position = Math.floor(Math.random() * 100) + 1;
          const rankingUrl = generateSampleUrl(domain, kw.keyword);
          
          existing.competitorRankings[domainName] = position;
          existing.competitorUrls[domainName] = rankingUrl;
        } else {
          // Add new keyword that main domain doesn't have
          const position = Math.floor(Math.random() * 100) + 1;
          const rankingUrl = generateSampleUrl(domain, kw.keyword);
          
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
    
    return {
      keywords: Array.from(keywordMap.values()),
      success: true
    };
  } catch (error) {
    console.error("Error analyzing domains:", error);
    toast.error(`Domain analysis failed: ${(error as Error).message}`);
    return {
      keywords: [],
      success: false
    };
  }
};
