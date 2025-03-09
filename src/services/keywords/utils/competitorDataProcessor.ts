
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
    
    // Call our DataForSEO edge function
    const { data, error } = await supabase.functions.invoke('dataforseo', {
      body: {
        action: 'domain_keywords',
        domain: domain,
        location_code: locationCode,
        sort_by: "relevance"
      }
    });
    
    if (error) {
      console.error(`Error calling DataForSEO edge function for ${normalizedDomain}:`, error);
      throw new Error(`Edge function error: ${error.message}`);
    }
    
    if (!data || !data.success) {
      const errorMessage = data?.error || 'Unknown API error';
      throw new Error(errorMessage);
    }
    
    if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
      throw new Error(`No results found for domain: ${domain}`);
    }
    
    const keywords = data.results;
    console.log(`Successfully fetched ${keywords.length} keywords for competitor ${normalizedDomain}`);
    toast.success(`Found ${keywords.length} keywords for ${normalizedDomain}`);
    
    // Return the normalized domain name for consistent display across components
    return { domain: normalizedDomain, keywords };
  } catch (error) {
    console.error(`Error analyzing competitor ${domain}:`, error);
    toast.error(`Failed to analyze ${domain}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    // Return normalized domain even in error case
    const normalizedDomain = normalizeDomain(domain);
    return { domain: normalizedDomain, keywords: [] };
  }
};
