
import { toast } from "sonner";
import { KeywordData } from '../types';
import { supabase } from "@/integrations/supabase/client";

/**
 * Process keyword data for a competitor domain
 */
export const processCompetitorData = async (
  domain: string, 
  locationCode: number = 2840
): Promise<{ domain: string, keywords: KeywordData[] }> => {
  try {
    toast.info(`Analyzing competitor: ${domain}`);
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
      console.error(`Error calling DataForSEO edge function for ${domain}:`, error);
      throw new Error(`Edge function error: ${error.message}`);
    }
    
    if (!data || !data.success) {
      const errorMessage = data?.error || 'Unknown API error';
      throw new Error(errorMessage);
    }
    
    if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
      throw new Error(`No keywords found for ${domain}. This competitor may not have keyword data available.`);
    }
    
    const keywords = data.results;
    console.log(`Successfully fetched ${keywords.length} keywords for competitor ${domain}`);
    toast.success(`Found ${keywords.length} keywords for ${domain}`);
    return { domain, keywords };
  } catch (error) {
    console.error(`Error analyzing competitor ${domain}:`, error);
    toast.error(`Failed to analyze ${domain}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    // Return empty keywords array to allow analysis to continue with other competitors
    return { domain, keywords: [] };
  }
};
