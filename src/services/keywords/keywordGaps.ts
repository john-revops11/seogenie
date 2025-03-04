
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
 * @returns Array of keyword gaps with opportunity analysis
 */
export const findKeywordGaps = async (
  mainDomain: string,
  competitorDomains: string[],
  keywords: KeywordData[],
  targetGapCount: number = 100,
  apiSource: ApiSource = 'sample'
): Promise<KeywordGap[]> => {
  try {
    if (!keywords.length) {
      console.error("No keywords provided to findKeywordGaps");
      return [];
    }
    
    const mainDomainName = extractDomain(mainDomain);
    const competitorDomainNames = competitorDomains.map(extractDomain);
    
    console.log(`Finding keyword gaps for ${mainDomainName} vs ${competitorDomainNames.join(', ')}`);
    console.log(`Using API source: ${apiSource}`);
    
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
    if (apiSource.startsWith('dataforseo')) {
      try {
        // In a real implementation, we would call different DataForSEO endpoints
        // based on the apiSource value (dataforseo-live vs dataforseo-task)
        toast.info(`Using ${apiSource} API for gap analysis`);
        
        // Mock implementation for now
        return mockDataForSEOGaps(mainDomainName, competitorDomainNames, keywords, targetGapCount);
      } catch (error) {
        console.error(`Error with ${apiSource} analysis:`, error);
        toast.error(`Failed with ${apiSource}: ${(error as Error).message}`);
      }
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
  const competitorIndex = 0;
  const competitor = competitorDomains[competitorIndex] || 'competitor.com';
  
  // Take 20% of the keywords as gaps
  const gapCount = Math.min(Math.ceil(keywords.length * 0.2), targetGapCount);
  
  for (let i = 0; i < gapCount; i++) {
    const keyword = keywords[i];
    if (!keyword) continue;
    
    // Determine opportunity level based on volume and difficulty
    let opportunity: 'high' | 'medium' | 'low' = 'medium';
    const volume = keyword.monthly_search || Math.floor(Math.random() * 5000) + 100;
    const difficulty = Math.floor(Math.random() * 70) + 10;
    
    if (volume > 1000 && difficulty < 30) {
      opportunity = 'high';
    } else if (volume < 100 || difficulty > 60) {
      opportunity = 'low';
    }
    
    gaps.push({
      keyword: keyword.keyword,
      competitor,
      rank: Math.floor(Math.random() * 10) + 1, // Competitor ranks 1-10
      volume: volume,
      difficulty: difficulty,
      relevance: Math.floor(Math.random() * 100) + 1,
      competitiveAdvantage: Math.floor(Math.random() * 100) + 1,
      isTopOpportunity: Math.random() > 0.7, // 30% chance of being a top opportunity
      opportunity: opportunity // Add the required 'opportunity' property
    });
  }
  
  return gaps;
}
