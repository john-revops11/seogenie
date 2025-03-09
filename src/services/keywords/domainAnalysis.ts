
import { toast } from "sonner";
import { KeywordData } from './types';
import { ensureValidUrl } from './api';
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
        throw new Error(`No keywords found for ${formattedMainDomain}`);
      }
    } catch (error) {
      console.error(`Error fetching keywords for ${formattedMainDomain}:`, error);
      toast.error(`API error: ${(error as Error).message}`);
      useRealData = false;
      throw new Error(`Failed to fetch keywords: ${(error as Error).message}`);
    }
    
    // Process competitor domains
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
