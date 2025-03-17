
import { toast } from "sonner";
import { KeywordData } from '../types';
import { supabase } from "@/integrations/supabase/client";
import { normalizeDomain } from '@/components/keyword-gaps/KeywordGapUtils';

/**
 * Process keyword data for a competitor domain
 */
export const processCompetitorData = async (
  domain: string, 
  locationCode: number = 2840
): Promise<{ domain: string, keywords: KeywordData[] }> => {
  try {
    // Normalize domain for consistent display
    const normalizedDomain = normalizeDomain(domain);
    
    toast.info(`Analyzing competitor: ${normalizedDomain}`);
    console.log(`Fetching keywords for competitor: ${domain} with location code: ${locationCode}`);
    
    // Clean domain by removing protocol prefixes if present
    const cleanedDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '');
    
    // Call our DataForSEO edge function with improved error handling and longer timeout
    const { data, error } = await Promise.race([
      supabase.functions.invoke('dataforseo', {
        body: {
          action: 'domain_keywords',
          domain: cleanedDomain,
          location_code: locationCode,
          sort_by: "relevance"
        }
      }),
      new Promise<{data: null, error: Error}>((resolve) => {
        setTimeout(() => {
          resolve({
            data: null, 
            error: new Error('Request timed out after 180 seconds')
          });
        }, 180000); // 180 second client-side timeout
      })
    ]);
    
    if (error) {
      console.error(`Error calling DataForSEO edge function for ${normalizedDomain}:`, error);
      
      // Check for common error types and provide better messages
      let errorMessage = error.message || 'Unknown error';
      
      if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
        errorMessage = `Request timed out for ${normalizedDomain}. The DataForSEO API may be experiencing delays. Please try again later.`;
      } else if (errorMessage.includes('network') || errorMessage.includes('failed to send')) {
        errorMessage = `Network error when analyzing ${normalizedDomain}. Please check your connection and try again.`;
      } else if (errorMessage.includes('failed to fetch')) {
        errorMessage = `Failed to connect to the DataForSEO service. Please check your network connection or try again later.`;
      }
      
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
    
    if (!data || !data.success) {
      const errorMessage = data?.error || 'Unknown API error';
      console.error(`API error for ${normalizedDomain}:`, errorMessage);
      
      // Provide more context for specific error cases
      let enhancedErrorMessage = errorMessage;
      
      if (errorMessage.includes('404')) {
        enhancedErrorMessage = `No data found for ${normalizedDomain}. The domain may not have enough data for analysis.`;
      } else if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
        enhancedErrorMessage = `Rate limit exceeded when analyzing ${normalizedDomain}. Please try again later.`;
      } else if (errorMessage.includes('timeout')) {
        enhancedErrorMessage = `Request timed out for ${normalizedDomain}. Please try again later.`;
      }
      
      toast.warning(enhancedErrorMessage);
      return { domain: normalizedDomain, keywords: [] };
    }
    
    // Handle empty results gracefully - data.results might be an empty array
    const keywords = data.results && Array.isArray(data.results) ? data.results : [];
    
    console.log(`Successfully fetched ${keywords.length} keywords for competitor ${normalizedDomain}`);
    
    if (keywords.length > 0) {
      toast.success(`Found ${keywords.length} keywords for ${normalizedDomain}`);
    } else {
      toast.info(`No keywords found for ${normalizedDomain}`);
    }
    
    // Return the normalized domain name for consistent display across components
    return { domain: normalizedDomain, keywords };
  } catch (error) {
    console.error(`Error analyzing competitor ${domain}:`, error);
    toast.error(`Failed to analyze ${domain}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    // Return normalized domain even in error case with empty keywords
    const normalizedDomain = normalizeDomain(domain);
    return { domain: normalizedDomain, keywords: [] };
  }
};
