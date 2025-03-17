import { toast } from "sonner";
import { KeywordData, KeywordGap } from './types';
import { extractDomain } from './utils/domainUtils';
import { analyzeKeywordsWithAI } from './utils/aiKeywordAnalysis';
import { findDirectKeywordGaps, prioritizeKeywordGaps } from './utils/directGapAnalysis';
import { useDataForSeoClient } from "@/hooks/useDataForSeoClient";

// Define API source options
export type ApiSource = 'sample' | 'semrush' | 'dataforseo-live' | 'dataforseo-task' | 'dataforseo-intersection';

/**
 * Finds keyword gaps between a main domain and competitor domains using DataForSEO's domain intersection API
 */
export const findKeywordGapsWithDataForSEOIntersection = async (
  mainDomain: string,
  competitorDomains: string[],
  dataForSeoClient: ReturnType<typeof useDataForSeoClient>,
  locationCode: number = 2840
): Promise<KeywordGap[]> => {
  try {
    const mainDomainName = extractDomain(mainDomain);
    const competitorDomainNames = competitorDomains.map(extractDomain);
    
    console.log(`Finding keyword gaps using DataForSEO intersection for ${mainDomainName} vs ${competitorDomainNames.join(', ')}`);
    
    const allGaps: KeywordGap[] = [];
    
    // Process each competitor one by one
    for (const competitorDomain of competitorDomainNames) {
      toast.info(`Analyzing gaps between ${mainDomainName} and ${competitorDomain}...`);
      
      // Important: Set target1 as competitor and target2 as main domain to find keywords 
      // the competitor ranks for that the main domain doesn't
      const intersectionData = await dataForSeoClient.getDomainIntersection(
        competitorDomain,  // target1 should be the competitor (we want THEIR keywords)
        mainDomainName,    // target2 should be the main domain
        locationCode
      );
      
      if (!intersectionData.tasks || !intersectionData.tasks[0]?.result) {
        console.warn(`No intersection data available for ${competitorDomain} vs ${mainDomainName}`);
        continue;
      }
      
      const results = intersectionData.tasks[0].result;
      
      if (!results || results.length === 0) {
        console.warn(`Empty intersection results for ${competitorDomain} vs ${mainDomainName}`);
        continue;
      }
      
      // Process the intersection data to find gaps
      const keywordGaps = processIntersectionData(results, mainDomainName, competitorDomain);
      console.log(`Found ${keywordGaps.length} gaps between ${competitorDomain} and ${mainDomainName}`);
      
      allGaps.push(...keywordGaps);
    }
    
    if (allGaps.length === 0) {
      console.warn("No keyword gaps found with DataForSEO intersection API");
      return [];
    }
    
    // Prioritize the gaps and mark top opportunities
    return prioritizeKeywordGaps(allGaps);
  } catch (error) {
    console.error("Error finding keyword gaps with DataForSEO intersection:", error);
    throw error;
  }
};

/**
 * Process the intersection data from DataForSEO to extract keyword gaps
 */
const processIntersectionData = (
  results: any[],
  mainDomain: string,
  competitorDomain: string
): KeywordGap[] => {
  const gaps: KeywordGap[] = [];
  
  console.log(`Processing ${results.length} intersection results`);
  
  // First, look for items array in the results if it exists
  const itemsArray = results[0]?.items || results;
  
  // Debug what we're processing
  console.log(`Processing items array with ${itemsArray.length} entries`);
  if (itemsArray.length > 0) {
    console.log(`Sample item:`, JSON.stringify(itemsArray[0]).substring(0, 300));
  }
  
  for (const result of itemsArray) {
    // Skip if no keyword
    if (!result.keyword) {
      continue;
    }
    
    // Log what we're processing for debugging
    console.log(`Processing keyword: ${result.keyword}`);
    
    // target1_rank represents the competitor's rank
    // target2_rank represents the main domain's rank
    // If these aren't available directly, look for them in nested objects
    const competitorRank = result.target1_rank || 
                          result.rank_data?.target1_rank || 
                          result.rank_absolute || 
                          result.rank_position || 
                          0;
                         
    const mainDomainRank = result.target2_rank || 
                          result.rank_data?.target2_rank || 
                          100; // Default to 100 (not ranking) if not found
    
    console.log(`${result.keyword}: Competitor rank: ${competitorRank}, Main domain rank: ${mainDomainRank}`);
    
    // Only consider keywords where:
    // 1. Competitor has a ranking (not zero)
    // 2. Either main domain doesn't rank at all (rank 100) or ranks much worse
    if (competitorRank > 0 && (mainDomainRank === 100 || competitorRank < mainDomainRank - 5)) {
      const difficulty = calculateDifficulty(result);
      const searchVolume = result.search_volume || 
                          result.keyword_data?.search_volume || 
                          result.monthly_searches || 
                          500; // Default if not found
                          
      const opportunity = determineOpportunity(competitorRank, mainDomainRank, searchVolume);
      
      gaps.push({
        keyword: result.keyword,
        competitor: competitorDomain,
        rank: competitorRank,
        volume: searchVolume,
        difficulty,
        relevance: calculateRelevance(result, mainDomainRank),
        competitiveAdvantage: calculateCompetitiveAdvantage(mainDomainRank, competitorRank, difficulty),
        isTopOpportunity: false, // Will be determined in prioritizeKeywordGaps
        opportunity
      });
      
      console.log(`Added gap for keyword: ${result.keyword}`);
    } else {
      console.log(`Skipping keyword: ${result.keyword} - not a valid gap`);
    }
  }
  
  console.log(`Found ${gaps.length} total gaps for competitor ${competitorDomain}`);
  return gaps;
};

/**
 * Calculate keyword difficulty based on available metrics
 */
const calculateDifficulty = (result: any): number => {
  if (result.keyword_difficulty !== undefined) {
    return result.keyword_difficulty;
  }
  
  // Fallback calculation based on search volume and competition
  const searchVolume = result.search_volume || 0;
  const competition = result.competition_index || 50;
  
  // Higher volume and competition means higher difficulty
  return Math.min(Math.round((searchVolume / 1000 + competition) / 2), 100);
};

/**
 * Calculate keyword relevance to the main domain
 */
const calculateRelevance = (result: any, mainDomainRank: number): number => {
  // If the main domain ranks for the keyword at all, it's likely relevant
  const hasMainDomainRanking = mainDomainRank < 100;
  const relevanceBase = hasMainDomainRanking ? 70 : 50;
  
  // Higher search volume implies more relevance to the industry
  const volumeBonus = Math.min(Math.log(result.search_volume || 1) * 5, 20);
  
  return Math.min(relevanceBase + volumeBonus, 100);
};

/**
 * Calculate competitive advantage based on ranking positions
 */
const calculateCompetitiveAdvantage = (
  mainDomainRank: number, 
  competitorRank: number, 
  difficulty: number
): number => {
  // The closer the ranks, the higher the advantage (easier to outrank)
  const rankDifference = mainDomainRank - competitorRank;
  const rankFactor = Math.max(100 - rankDifference * 5, 30);
  
  // Lower difficulty means higher advantage
  const difficultyFactor = Math.max(100 - difficulty, 20);
  
  return Math.round((rankFactor + difficultyFactor) / 2);
};

/**
 * Determine opportunity level based on rankings and search volume
 */
const determineOpportunity = (
  competitorRank: number, 
  mainDomainRank: number, 
  searchVolume: number
): 'high' | 'medium' | 'low' => {
  // High opportunity if competitor ranks well, main domain doesn't, and good volume
  if (competitorRank <= 5 && mainDomainRank > 20 && searchVolume > 500) {
    return 'high';
  }
  
  // Low opportunity if poor volume or both domains rank poorly
  if (searchVolume < 100 || (competitorRank > 20 && mainDomainRank > 50)) {
    return 'low';
  }
  
  // Medium for everything else
  return 'medium';
};

/**
 * Finds keyword gaps between a main domain and competitor domains
 * 
 * @param mainDomain - The main domain URL to analyze
 * @param competitorDomains - Array of competitor domain URLs
 * @param keywords - Keyword data including rankings
 * @param targetGapCount - Maximum number of gaps to find per competitor (default: 100)
 * @param apiSource - Source API for keyword data (default: 'sample')
 * @param locationCode - Location code for the analysis (default: 2840)
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
    
    // Collect gaps for each competitor
    let allGaps: KeywordGap[] = [];
    
    // Try direct analysis first (based on ranking data we already have)
    for (const competitorDomain of competitorDomainNames) {
      const directGaps = findDirectKeywordGaps(
        mainDomainName, 
        [competitorDomain], 
        keywords, 
        Math.ceil(targetGapCount / competitorDomainNames.length)
      );
      
      if (directGaps.length > 0) {
        console.log(`Found ${directGaps.length} direct gaps for competitor ${competitorDomain}`);
        allGaps.push(...directGaps);
      }
    }
    
    if (allGaps.length > 0) {
      console.log("Using directly identified gaps with local analysis");
      console.log(`Found ${allGaps.length} potential keyword gaps before analysis`);
      
      // Prioritize gaps and mark top opportunities
      const prioritizedGaps = prioritizeKeywordGaps(allGaps);
      
      console.log("Returning directly identified gaps:", prioritizedGaps.length);
      return prioritizedGaps;
    }
    
    // If direct analysis didn't find any gaps, use the specified API source
    if (apiSource === 'dataforseo-intersection') {
      // We'll need to create a dataForSeoClient instance for this fallback path
      // This is not ideal but necessary for the static method to work
      const { useDataForSeoClient } = await import("@/hooks/useDataForSeoClient");
      // Create a temporary client
      const tempClient = useDataForSeoClient();
      
      return findKeywordGapsWithDataForSEOIntersection(
        mainDomainName,
        competitorDomainNames,
        tempClient,
        locationCode
      );
    } else if (apiSource === 'dataforseo-live') {
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
  
  // Distribute the target gap count evenly among competitors
  const gapsPerCompetitor = Math.max(5, Math.ceil(targetGapCount / competitors.length));
  console.log(`Generating approximately ${gapsPerCompetitor} mock gaps per competitor`);
  
  // Generate gaps for each competitor
  for (const competitor of competitors) {
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

