
import { toast } from "sonner";
import { KeywordData } from '../types';

/**
 * Process keyword data for a competitor domain
 */
export const processCompetitorData = async (
  domain: string, 
  locationCode: number = 2840
): Promise<{ domain: string, keywords: KeywordData[] }> => {
  try {
    toast.info(`Analyzing competitor: ${domain}`);
    
    try {
      console.log(`Fetching keywords for competitor: ${domain} with location code: ${locationCode}`);
      
      const { fetchDataForSEOKeywords } = await import('../api/dataForSeo/domains');
      const keywords = await fetchDataForSEOKeywords(domain, locationCode);
      
      console.log(`Successfully fetched ${keywords.length} keywords for competitor ${domain}`);
      toast.success(`Found ${keywords.length} keywords for ${domain}`);
      
      return { domain, keywords };
    } catch (error) {
      console.error(`Error fetching competitor keywords for ${domain}:`, error);
      toast.error(`API not working for competitor ${domain}: ${(error as Error).message}`);
      
      // Return an empty array to indicate API failure
      return { domain, keywords: [] };
    }
  } catch (error) {
    console.error(`Error analyzing competitor ${domain}:`, error);
    toast.error(`API not working for ${domain}: ${(error as Error).message}`);
    
    // Return empty array to indicate failure
    return { domain, keywords: [] };
  }
};
