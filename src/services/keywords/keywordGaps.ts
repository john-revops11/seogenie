import { toast } from "sonner";
import { KeywordData, KeywordGap } from './types';
import { extractDomain } from './utils/domainUtils';
import { analyzeKeywordsWithAI } from './utils/aiKeywordAnalysis';
import { findDirectKeywordGaps, prioritizeKeywordGaps } from './utils/directGapAnalysis';

// Define API source options
export type ApiSource = 'sample' | 'semrush' | 'dataforseo-live' | 'dataforseo-task';

/**
 * Finds keyword gaps between a main domain and competitor domains
 * 
 * @param mainDomain - The main domain URL to analyze
 * @param competitorDomains - Array of competitor domain URLs
 * @param keywords - Keyword data including rankings
 * @param targetGapCount - Maximum number of gaps to find per competitor (default: 100)
 * @param apiSource - Source API for keyword data (default: 'sample')
 * @param locationCode - Location code for the analysis (default: 2840 for US)
 * @returns Array of keyword gaps with opportunity analysis
 */
export const findKeywordGaps = async (
  mainDomain: string,
  competitorDomains: string[],
  keywords: KeywordData[],
  targetGapCount: number = 100,
  apiSource: ApiSource = 'sample',
  locationCode: number = 2840
): Promise<KeywordGap[]> => {
  try {
    if (!keywords.length) {
      console.error("No keywords provided to findKeywordGaps");
      return [];
    }
    
    const mainDomainName = extractDomain(mainDomain);
    const competitorDomainNames = competitorDomains.map(extractDomain);
    
    console.log(`Finding keyword gaps for ${mainDomainName} vs ${competitorDomainNames.join(', ')}`);
    console.log(`Using API source: ${apiSource} with location code: ${locationCode}`);
    
    // Try direct analysis first (based on ranking data we already have)
    const directGaps = findDirectKeywordGaps(mainDomainName, competitorDomainNames, keywords, targetGapCount);
    
    if (directGaps.length > 0) {
      console.log("Using directly identified gaps with local analysis");
      console.log(`Found ${directGaps.length} potential keyword gaps before analysis`);
      
      // Prioritize gaps and mark top opportunities
      const prioritizedGaps = prioritizeKeywordGaps(directGaps);
      
      console.log("Returning directly identified gaps:", prioritizedGaps.length);
      return prioritizedGaps;
    }
    
    // Fallback to API-specific methods if direct analysis didn't find any gaps
    if (apiSource === 'dataforseo-live') {
      try {
        toast.info(`Using DataForSEO Live API for gap analysis`);
        
        // In a real implementation, we would call the DataForSEO live endpoint
        // Enhanced in the api.ts file
        return await fetchDataForSEOLiveGaps(
          mainDomainName, 
          competitorDomainNames, 
          targetGapCount,
          locationCode
        );
      } catch (error) {
        console.error(`Error with DataForSEO Live analysis:`, error);
        toast.error(`Failed with DataForSEO Live: ${(error as Error).message}`);
      }
    } else if (apiSource === 'dataforseo-task') {
      try {
        toast.info(`Using DataForSEO Task API for gap analysis`);
        
        // In a real implementation, we would call the DataForSEO task endpoint
        // Enhanced in the api.ts file
        return await fetchDataForSEOTaskGaps(
          mainDomainName, 
          competitorDomainNames, 
          targetGapCount,
          locationCode
        );
      } catch (error) {
        console.error(`Error with DataForSEO Task analysis:`, error);
        toast.error(`Failed with DataForSEO Task: ${(error as Error).message}`);
      }
    } else if (apiSource === 'semrush') {
      // Existing semrush implementation or placeholder
      toast.info(`Using SEMrush API for gap analysis`);
      // Implementation would go here
      return mockDataForSEOGaps(mainDomainName, competitorDomainNames, keywords, targetGapCount);
    }
    
    // Fallback to AI-based analysis as a last resort
    try {
      toast.info("Using AI-based keyword gap analysis");
      const aiGaps = await analyzeKeywordsWithAI(
        mainDomainName, 
        competitorDomainNames, 
        keywords,
        targetGapCount
      );
      return aiGaps;
    } catch (error) {
      console.error("Error with AI keyword analysis:", error);
      toast.error(`Failed with AI analysis: ${(error as Error).message}`);
      return [];
    }
  } catch (error) {
    console.error("Error finding keyword gaps:", error);
    toast.error(`Failed to find keyword gaps: ${(error as Error).message}`);
    return [];
  }
};

// Function to fetch DataForSEO Live gaps
async function fetchDataForSEOLiveGaps(
  mainDomain: string,
  competitorDomains: string[],
  targetGapCount: number,
  locationCode: number
): Promise<KeywordGap[]> {
  // This function would be implemented in a production environment
  // For now, return mock data
  console.log(`Fetching DataForSEO Live gaps for ${mainDomain} vs ${competitorDomains.join(', ')}`);
  console.log(`Using location code: ${locationCode}`);
  
  return mockDataForSEOGaps(mainDomain, competitorDomains, [], targetGapCount);
}

// Function to fetch DataForSEO Task gaps
async function fetchDataForSEOTaskGaps(
  mainDomain: string,
  competitorDomains: string[],
  targetGapCount: number,
  locationCode: number
): Promise<KeywordGap[]> {
  // This function would be implemented in a production environment
  // For now, return mock data
  console.log(`Fetching DataForSEO Task gaps for ${mainDomain} vs ${competitorDomains.join(', ')}`);
  console.log(`Using location code: ${locationCode}`);
  
  // Simulate a task being queued
  toast.info("DataForSEO task has been queued. Results will be available soon.");
  
  // Wait 2 seconds to simulate a delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return mockDataForSEOGaps(mainDomain, competitorDomains, [], targetGapCount);
}

// Mock function to simulate DataForSEO results - in a real implementation, this would be replaced
// with actual API calls to DataForSEO endpoints
function mockDataForSEOGaps(
  mainDomain: string,
  competitorDomains: string[],
  keywords: KeywordData[],
  targetGapCount: number
): KeywordGap[] {
  // Generate some realistic looking gaps based on the provided keywords
  const gaps: KeywordGap[] = [];
  
  // Use all competitors or default to the first one
  const competitors = competitorDomains.length > 0 ? competitorDomains : ['competitor.com'];
  
  // Generate gaps for each competitor
  for (let c = 0; c < competitors.length; c++) {
    const competitor = competitors[c];
    const gapsPerCompetitor = Math.max(5, Math.ceil(targetGapCount / competitors.length));
    
    for (let i = 0; i < gapsPerCompetitor; i++) {
      // Generate a realistic keyword
      const keywordOptions = [
        "pricing strategy", "value based pricing", "price optimization",
        "b2b pricing", "saas pricing", "pricing software", "revenue optimization",
        "price management", "profit optimization", "pricing analysis", 
        "market pricing", "competitive pricing", "price intelligence"
      ];
      
      const keyword = keywords.length > i 
        ? keywords[i].keyword 
        : keywordOptions[Math.floor(Math.random() * keywordOptions.length)];
      
      // Determine opportunity level based on random volume and difficulty
      let opportunity: 'high' | 'medium' | 'low' = 'medium';
      const volume = Math.floor(Math.random() * 5000) + 100;
      const difficulty = Math.floor(Math.random() * 70) + 10;
      
      if (volume > 1000 && difficulty < 30) {
        opportunity = 'high';
      } else if (volume < 100 || difficulty > 60) {
        opportunity = 'low';
      }
      
      gaps.push({
        keyword,
        competitor,
        rank: Math.floor(Math.random() * 10) + 1, // Competitor ranks 1-10
        volume,
        difficulty,
        relevance: Math.floor(Math.random() * 100) + 1,
        competitiveAdvantage: Math.floor(Math.random() * 100) + 1,
        isTopOpportunity: Math.random() > 0.7, // 30% chance of being a top opportunity
        opportunity
      });
    }
  }
  
  return gaps;
}
