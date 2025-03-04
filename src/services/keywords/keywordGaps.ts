
import { toast } from "sonner";
import { KeywordData, KeywordGap } from './types';
import { extractDomain } from './utils/domainUtils';
import { analyzeKeywordsWithAI } from './utils/aiKeywordAnalysis';
import { findDirectKeywordGaps, prioritizeKeywordGaps } from './utils/directGapAnalysis';

/**
 * Finds keyword gaps between a main domain and competitor domains
 * 
 * @param mainDomain - The main domain URL to analyze
 * @param competitorDomains - Array of competitor domain URLs
 * @param keywords - Keyword data including rankings
 * @param targetGapCount - Maximum number of gaps to find per competitor (default: 100)
 * @returns Array of keyword gaps with opportunity analysis
 */
export const findKeywordGaps = async (
  mainDomain: string,
  competitorDomains: string[],
  keywords: KeywordData[],
  targetGapCount: number = 100
): Promise<KeywordGap[]> => {
  try {
    if (!keywords.length) {
      console.error("No keywords provided to findKeywordGaps");
      return [];
    }
    
    const mainDomainName = extractDomain(mainDomain);
    const competitorDomainNames = competitorDomains.map(extractDomain);
    
    console.log(`Finding keyword gaps for ${mainDomainName} vs ${competitorDomainNames.join(', ')}`);
    
    // Try direct analysis first (based on ranking data we already have)
    const directGaps = findDirectKeywordGaps(mainDomainName, competitorDomainNames, keywords, targetGapCount);
    
    if (directGaps.length > 0) {
      console.log("Using directly identified gaps with local analysis");
      
      // Prioritize gaps and mark top opportunities
      const prioritizedGaps = prioritizeKeywordGaps(directGaps);
      
      console.log("Returning directly identified gaps:", prioritizedGaps.length);
      return prioritizedGaps;
    }
    
    // Fallback to AI-based analysis if direct analysis didn't find any gaps
    try {
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
