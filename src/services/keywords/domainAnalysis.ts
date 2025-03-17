
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
    
    // Get main domain keywords from DataForSEO
    let mainKeywords: KeywordData[] = [];
    
    try {
      console.log(`Fetching keywords for main domain: ${formattedMainDomain}`);
      
      // Call our DataForSEO edge function for the main domain with improved error handling
      const { data, error } = await Promise.race([
        supabase.functions.invoke('dataforseo', {
          body: {
            action: 'domain_keywords',
            domain: formattedMainDomain,
            location_code: locationCode,
            sort_by: "relevance"
          }
        }),
        new Promise<{data: null, error: Error}>((resolve) => {
          setTimeout(() => {
            resolve({
              data: null, 
              error: new Error('Request timed out after 45 seconds')
            });
          }, 45000);
        })
      ]);
      
      if (error) {
        console.error(`Error calling DataForSEO edge function for ${formattedMainDomain}:`, error);
        
        // Provide more specific error message based on error type
        let errorMessage = error.message || 'Unknown error';
        
        if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
          errorMessage = `Request to DataForSEO timed out. The service may be experiencing delays.`;
          toast.error(errorMessage, { id: "dataseo-timeout" });
        } else if (errorMessage.includes('network')) {
          errorMessage = `Network error when connecting to DataForSEO. Please check your internet connection.`;
          toast.error(errorMessage, { id: "dataseo-network" });
        } else {
          toast.error(`DataForSEO API error: ${errorMessage}`, { id: "dataseo-error" });
        }
        
        throw new Error(`Edge function error: ${errorMessage}`);
      }
      
      if (!data) {
        throw new Error('Edge function returned empty response');
      }
      
      if (!data.success) {
        // Extract error details for better error messages
        let errorMessage = data.error || 'Unknown API error';
        
        // Try to provide more context based on known error scenarios
        if (errorMessage.includes('404')) {
          errorMessage = `Domain "${formattedMainDomain}" may not have any keywords in the DataForSEO database. Try a more established domain with better organic visibility.`;
        } else if (errorMessage.includes('401') || errorMessage.includes('403')) {
          errorMessage = `Authentication error: Please check your DataForSEO API credentials in Settings.`;
        } else if (errorMessage.includes('429')) {
          errorMessage = `Rate limit exceeded: Too many requests to DataForSEO API. Please try again later.`;
        } else if (errorMessage.includes('500')) {
          errorMessage = `DataForSEO server error: The service is experiencing technical difficulties. Please try again later.`;
        } else if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
          errorMessage = `Request to DataForSEO timed out. The service may be experiencing delays.`;
        }
        
        throw new Error(errorMessage);
      }
      
      if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
        // Handle empty results case gracefully
        toast.info(`No keywords found for ${formattedMainDomain}. This could mean the domain has no organic rankings yet.`);
        mainKeywords = [];
      } else {
        mainKeywords = data.results;
        console.log(`Successfully fetched ${mainKeywords.length} keywords for main domain`);
        toast.success(`Found ${mainKeywords.length} keywords for ${formattedMainDomain}`);
      }
    } catch (error) {
      console.error(`Error fetching keywords for ${formattedMainDomain}:`, error);
      toast.error(`API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new Error(`Failed to fetch keywords: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    // If we have no keywords for the main domain but didn't get an error, continue with an empty array
    if (mainKeywords.length === 0) {
      console.warn(`No keywords found for main domain ${formattedMainDomain}, continuing with empty array`);
    }
    
    // Process competitor domains if main domain was successful or returned empty results
    const competitorResults = [];
    
    for (const domain of formattedCompetitorDomains) {
      try {
        const result = await processCompetitorData(domain, locationCode);
        competitorResults.push(result);
      } catch (error) {
        console.error(`Error processing competitor ${domain}:`, error);
        toast.error(`Failed to analyze ${domain}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        // Continue with next competitor instead of failing entire analysis
        const normalizedDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '');
        competitorResults.push({ domain: normalizedDomain, keywords: [] });
      }
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
    toast.error(`Domain analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      keywords: [],
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
