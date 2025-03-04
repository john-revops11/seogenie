
import { toast } from "sonner";
import { KeywordData } from '../types';
import { fetchDomainKeywords } from '../api';
import { generateMockKeywords, generateSampleUrl } from './mockDataGenerator';

/**
 * Process keyword data for a competitor domain
 */
export const processCompetitorData = async (
  domain: string, 
  useRealData: boolean,
  locationCode: number = 2840
): Promise<{ domain: string, keywords: KeywordData[] }> => {
  try {
    toast.info(`Analyzing competitor: ${domain}`);
    let keywords: KeywordData[] = [];
    
    if (useRealData) {
      try {
        console.log(`Attempting to fetch keywords for competitor: ${domain} with location code: ${locationCode}`);
        keywords = await fetchDomainKeywords(domain);
        console.log(`Successfully fetched ${keywords.length} keywords for competitor ${domain}`);
      } catch (error) {
        console.warn(`Error fetching real competitor keywords for ${domain}, using mock data:`, error);
        keywords = generateMockKeywords(domain, 25);
        toast.warning(`API error when fetching keywords for competitor ${domain}, using sample data`);
      }
    } else {
      keywords = generateMockKeywords(domain, 25);
    }
    
    if (keywords.length > 0) {
      toast.success(`Found ${keywords.length} keywords for ${domain}`);
    } else {
      console.warn(`No keywords found for ${domain}, generating mock data`);
      const mockKeywords = generateMockKeywords(domain, 25);
      keywords = mockKeywords;
      toast.success(`Generated ${mockKeywords.length} sample keywords for ${domain}`);
    }
    
    return { domain, keywords };
  } catch (error) {
    console.error(`Error analyzing competitor ${domain}:`, error);
    toast.error(`Failed to analyze ${domain}: ${(error as Error).message}`);
    
    // Generate mock data even if analysis fails
    const mockKeywords = generateMockKeywords(domain, 25);
    toast.success(`Generated ${mockKeywords.length} sample keywords for ${domain} (fallback)`);
    return { domain, keywords: mockKeywords };
  }
};
