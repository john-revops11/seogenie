
import { toast } from "sonner";
import { KeywordData } from './types';
import { fetchDomainKeywords, ensureValidUrl } from './api';
import { processCompetitorData } from './utils/competitorDataProcessor';
import { mergeKeywordData } from './utils/keywordDataMerger';

export const analyzeDomains = async (
  mainDomain: string, 
  competitorDomains: string[],
  locationCode: number = 2840
): Promise<{
  keywords: KeywordData[],
  success: boolean,
  error?: string
}> => {
  try {
    // Make sure domains have proper URL format
    const formattedMainDomain = ensureValidUrl(mainDomain);
    const formattedCompetitorDomains = competitorDomains
      .filter(domain => domain.trim() !== "")
      .map(domain => ensureValidUrl(domain));
    
    console.log("Analyzing domains:", formattedMainDomain, formattedCompetitorDomains);
    console.log("Using location code:", locationCode);
    
    // Only use real API data
    let mainKeywords: KeywordData[] = [];
    
    try {
      console.log(`Fetching keywords for main domain: ${formattedMainDomain}`);
      // Directly use the DataForSEO API
      const { fetchDataForSEOKeywords } = await import('./api/dataForSeo/domains');
      mainKeywords = await fetchDataForSEOKeywords(formattedMainDomain, locationCode);
      
      console.log(`Successfully fetched ${mainKeywords.length} keywords for main domain`);
      
      if (!mainKeywords.length) {
        console.warn(`No keywords found for ${formattedMainDomain}`);
        toast.error(`API returned no keywords for ${formattedMainDomain}`);
        return {
          keywords: [],
          success: false,
          error: `API returned no keywords for ${formattedMainDomain}`
        };
      }
    } catch (error) {
      console.error(`Error fetching keywords for ${formattedMainDomain}:`, error);
      toast.error(`API not working for ${formattedMainDomain}: ${(error as Error).message}`);
      return {
        keywords: [],
        success: false,
        error: `API not working: ${(error as Error).message}`
      };
    }
    
    // Process competitor domains - only use real API data
    const competitorResults = [];
    
    for (const domain of formattedCompetitorDomains) {
      const result = await processCompetitorData(domain, true, locationCode);
      competitorResults.push(result);
    }
    
    // Process and merge data
    const mergedKeywords = mergeKeywordData(
      formattedMainDomain,
      mainKeywords,
      competitorResults
    );
    
    return {
      keywords: mergedKeywords,
      success: true
    };
  } catch (error) {
    console.error("Error analyzing domains:", error);
    toast.error(`API not working: ${(error as Error).message}`);
    return {
      keywords: [],
      success: false,
      error: `API not working: ${(error as Error).message}`
    };
  }
};
