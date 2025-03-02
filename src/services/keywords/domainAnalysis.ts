
import { toast } from "sonner";
import { KeywordData } from './types';
import { fetchDomainKeywords, ensureValidUrl } from './api';

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
    
    console.log("Analyzing domains:", formattedMainDomain, formattedCompetitorDomains);
    
    // Try to fetch real data from API
    let mainKeywords: KeywordData[] = [];
    
    try {
      toast.info(`Fetching keyword data for ${mainDomain}...`, { duration: 3000, id: "fetch-main-domain" });
      mainKeywords = await fetchDomainKeywords(formattedMainDomain);
      
      if (!mainKeywords.length) {
        console.warn(`No keywords found for ${formattedMainDomain}`);
        toast.error(`No keywords found for ${formattedMainDomain}. Please check your domain or API settings.`, { id: "no-keywords" });
        return { keywords: [], success: false };
      } 
      
      toast.success(`Found ${mainKeywords.length} keywords for ${mainDomain}`, { id: "keywords-found" });
    } catch (error) {
      console.error(`Error fetching keywords for ${formattedMainDomain}:`, error);
      toast.error(`API error when fetching keywords for ${formattedMainDomain}: ${(error as Error).message}`, { id: "api-error" });
      return { keywords: [], success: false };
    }
    
    // Process competitor domains
    const competitorResults = [];
    
    for (const domain of formattedCompetitorDomains) {
      try {
        toast.info(`Analyzing competitor: ${domain}`);
        let keywords = [];
        
        try {
          keywords = await fetchDomainKeywords(domain);
        } catch (error) {
          console.error(`Error fetching competitor keywords for ${domain}:`, error);
          toast.error(`API error when fetching keywords for competitor ${domain}: ${(error as Error).message}`);
          continue; // Skip this competitor and move to the next
        }
        
        if (keywords.length > 0) {
          competitorResults.push({ domain, keywords });
          toast.success(`Found ${keywords.length} keywords for ${domain}`);
        } else {
          console.warn(`No keywords found for ${domain}`);
          toast.warning(`No keywords found for competitor ${domain}`);
        }
      } catch (error) {
        console.error(`Error analyzing competitor ${domain}:`, error);
        toast.error(`Failed to analyze ${domain}: ${(error as Error).message}`);
      }
    }
    
    // If we have no competitor results, inform the user
    if (competitorResults.length === 0 && formattedCompetitorDomains.length > 0) {
      toast.error("Failed to analyze any competitors. Please check your competitor domains or API settings.");
    }
    
    // Process and merge data
    const keywordMap = new Map<string, KeywordData>();
    
    // Add main domain keywords first
    mainKeywords.forEach(kw => {
      keywordMap.set(kw.keyword, {
        keyword: kw.keyword,
        monthly_search: kw.monthly_search,
        competition: kw.competition,
        competition_index: kw.competition_index,
        cpc: kw.cpc,
        position: kw.position, 
        rankingUrl: kw.rankingUrl, 
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
          
          existing.competitorRankings[domainName] = kw.position;
          existing.competitorUrls[domainName] = kw.rankingUrl;
        } else {
          // Add new keyword that main domain doesn't have
          keywordMap.set(kw.keyword, {
            keyword: kw.keyword,
            monthly_search: kw.monthly_search,
            competition: kw.competition,
            competition_index: kw.competition_index,
            cpc: kw.cpc,
            position: null, // Main domain doesn't rank for this
            rankingUrl: null,
            competitorRankings: {
              [domainName]: kw.position
            },
            competitorUrls: {
              [domainName]: kw.rankingUrl
            }
          });
        }
      });
    });
    
    const keywords = Array.from(keywordMap.values());
    toast.success(`Analysis complete: Found ${keywords.length} total keywords for comparison`);
    
    return {
      keywords: keywords,
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
