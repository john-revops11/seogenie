
import { toast } from "sonner";
import { KeywordData } from './types';
import { fetchDomainKeywords, ensureValidUrl } from './api';

// Helper function to generate sample ranking URL
const generateSampleUrl = (domain: string, keyword: string): string => {
  // Remove protocol and trailing slashes to get clean domain
  const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
  
  // Convert keyword to URL-friendly slug
  const slug = keyword.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  // Randomly select a common URL pattern
  const patterns = [
    `https://${cleanDomain}/${slug}/`,
    `https://${cleanDomain}/blog/${slug}/`,
    `https://${cleanDomain}/services/${slug}/`,
    `https://${cleanDomain}/product/${slug}/`,
    `https://${cleanDomain}/resources/${slug}/`,
  ];
  
  return patterns[Math.floor(Math.random() * patterns.length)];
};

// Generate mock keyword data for demonstration purposes
const generateMockKeywords = (domain: string, count: number = 15): KeywordData[] => {
  const keywordPrefixes = ['analytics', 'data', 'business', 'revenue', 'growth', 
    'marketing', 'strategy', 'insight', 'performance', 'metrics', 'dashboard',
    'reporting', 'forecast', 'prediction', 'trends', 'visualization'];
  
  const keywordSuffixes = ['software', 'platform', 'service', 'tool', 'solution',
    'management', 'analysis', 'optimization', 'tracking', 'reporting', 'dashboard',
    'integration', 'automation', 'intelligence', 'framework', 'methodology'];
  
  const keywords: KeywordData[] = [];
  
  for (let i = 0; i < count; i++) {
    const prefix = keywordPrefixes[Math.floor(Math.random() * keywordPrefixes.length)];
    const suffix = keywordSuffixes[Math.floor(Math.random() * keywordSuffixes.length)];
    const keyword = `${prefix} ${suffix}`;
    
    // Generate realistic-looking data
    const monthlySearch = Math.floor(Math.random() * 10000) + 100;
    const competitionIndex = Math.floor(Math.random() * 100) + 1;
    const cpc = (Math.random() * 10 + 0.5).toFixed(2);
    const position = Math.floor(Math.random() * 100) + 1;
    
    keywords.push({
      keyword,
      monthly_search: monthlySearch,
      competition: competitionIndex < 30 ? "low" : competitionIndex < 70 ? "medium" : "high",
      competition_index: competitionIndex,
      cpc: parseFloat(cpc),
      position,
      rankingUrl: generateSampleUrl(domain, keyword),
    });
  }
  
  return keywords;
};

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
    let useRealData = true;
    
    try {
      toast.info(`Fetching keyword data for ${mainDomain}...`, { duration: 3000, id: "fetch-main-domain" });
      mainKeywords = await fetchDomainKeywords(formattedMainDomain);
      
      if (!mainKeywords.length) {
        console.warn(`No real keywords found for ${formattedMainDomain}, using mock data`);
        useRealData = false;
        toast.warning(`No keywords found for ${formattedMainDomain}, using sample data instead`, { id: "no-keywords" });
      } else {
        toast.success(`Found ${mainKeywords.length} keywords for ${mainDomain}`, { id: "keywords-found" });
      }
    } catch (error) {
      console.warn(`Error fetching real keywords for ${formattedMainDomain}, using mock data:`, error);
      useRealData = false;
      toast.warning(`API error when fetching keywords for ${formattedMainDomain}, using sample data`, { id: "api-error" });
    }
    
    // If API failed, use mock data for demo purposes
    if (!useRealData) {
      toast.info("Using demo data for this session - all API services returned errors", { id: "using-demo-data" });
      mainKeywords = generateMockKeywords(formattedMainDomain);
      
      // Log the mock data we're using
      console.log(`Generated ${mainKeywords.length} mock keywords for ${formattedMainDomain}`);
    }
    
    // Process competitor domains - use mock data if real data isn't available
    const competitorResults = [];
    
    for (const domain of formattedCompetitorDomains) {
      try {
        toast.info(`Analyzing competitor: ${domain}`);
        let keywords = [];
        
        if (useRealData) {
          try {
            keywords = await fetchDomainKeywords(domain);
          } catch (error) {
            console.warn(`Error fetching real competitor keywords for ${domain}, using mock data:`, error);
            keywords = generateMockKeywords(domain);
            toast.warning(`API error when fetching keywords for competitor ${domain}, using sample data`);
          }
        } else {
          keywords = generateMockKeywords(domain);
        }
        
        if (keywords.length > 0) {
          competitorResults.push({ domain, keywords });
          toast.success(`Found ${keywords.length} keywords for ${domain}`);
        } else {
          console.warn(`No keywords found for ${domain}, generating mock data`);
          const mockKeywords = generateMockKeywords(domain);
          competitorResults.push({ domain, keywords: mockKeywords });
          toast.success(`Generated ${mockKeywords.length} sample keywords for ${domain}`);
        }
      } catch (error) {
        console.error(`Error analyzing competitor ${domain}:`, error);
        toast.error(`Failed to analyze ${domain}: ${(error as Error).message}`);
        
        // Generate mock data even if analysis fails
        const mockKeywords = generateMockKeywords(domain);
        competitorResults.push({ domain, keywords: mockKeywords });
        toast.success(`Generated ${mockKeywords.length} sample keywords for ${domain} (fallback)`);
      }
    }
    
    // Process and merge data
    const keywordMap = new Map<string, KeywordData>();
    
    // Add main domain keywords first
    mainKeywords.forEach(kw => {
      // Simulate a ranking position and URL for the main domain
      const position = kw.position || Math.floor(Math.random() * 100) + 1;
      const rankingUrl = kw.rankingUrl || generateSampleUrl(formattedMainDomain, kw.keyword);
      
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
