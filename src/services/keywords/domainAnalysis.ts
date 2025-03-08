
import { toast } from "sonner";
import { KeywordData } from './types';
import { ensureValidUrl } from './api';
import { generateMockKeywords } from './utils/mockDataGenerator';
import { processCompetitorData } from './utils/competitorDataProcessor';
import { mergeKeywordData } from './utils/keywordDataMerger';
import { supabase } from "@/integrations/supabase/client";

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
    
    // Try to fetch real data from API
    let mainKeywords: KeywordData[] = [];
    let useRealData = true;
    
    try {
      console.log(`Attempting to fetch keywords for main domain: ${formattedMainDomain}`);
      
      // Call our DataForSEO edge function for the main domain
      const { data, error } = await supabase.functions.invoke('dataforseo', {
        body: {
          action: 'domain_keywords',
          domain: formattedMainDomain,
          location_code: locationCode
        }
      });
      
      if (error) {
        console.error(`Error calling DataForSEO edge function for ${formattedMainDomain}:`, error);
        throw new Error(`Edge function error: ${error.message}`);
      }
      
      if (data && data.success && data.results && data.results.length > 0) {
        mainKeywords = data.results;
        console.log(`Successfully fetched ${mainKeywords.length} keywords for main domain`);
      } else {
        throw new Error('No keywords returned from DataForSEO API');
      }
      
      if (!mainKeywords.length) {
        console.warn(`No real keywords found for ${formattedMainDomain}, using mock data`);
        useRealData = false;
        mainKeywords = generateMockKeywords(formattedMainDomain, 30);
        toast.warning(`No keywords found for ${formattedMainDomain}, using sample data instead`);
      }
    } catch (error) {
      console.warn(`Error fetching real keywords for ${formattedMainDomain}, using mock data:`, error);
      useRealData = false;
      mainKeywords = generateMockKeywords(formattedMainDomain, 30);
      toast.warning(`API error when fetching keywords for ${formattedMainDomain}, using sample data`);
    }
    
    // Process competitor domains - use mock data if real data isn't available
    const competitorResults = [];
    
    for (const domain of formattedCompetitorDomains) {
      const result = await processCompetitorData(domain, useRealData, locationCode);
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
    toast.error(`Domain analysis failed: ${(error as Error).message}`);
    return {
      keywords: [],
      success: false,
      error: (error as Error).message
    };
  }
};
