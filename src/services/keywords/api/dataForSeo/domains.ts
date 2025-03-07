
import { KeywordData } from '../../types';
import { DATAFORSEO_API_URL } from '../../apiConfig';
import { getDataForSeoCredentials } from './auth';
import { parseApiResponse, convertToKeywordData, checkApiResponseStatus } from './utils';

/**
 * Enhanced function to fetch DataForSEO API for domain keywords with location support
 */
export const fetchDataForSEOKeywords = async (
  domainUrl: string, 
  locationCode: number = 2840
): Promise<KeywordData[]> => {
  try {
    console.log(`Fetching keywords from DataForSEO API for domain: ${domainUrl} in location: ${locationCode}`);
    
    // Use the Supabase Edge Function instead of direct API call
    const response = await fetch(`${window.location.origin}/.netlify/functions/dataforseo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'domain_keywords',
        domain: domainUrl,
        location_code: locationCode
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`DataForSEO Edge Function error ${response.status}: ${errorText}`);
      throw new Error(`Edge Function error ${response.status}: ${errorText.substring(0, 100)}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      console.error(`DataForSEO Edge Function returned error: ${data.error}`);
      throw new Error(`API error: ${data.error}`);
    }
    
    if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
      console.warn(`DataForSEO Edge Function returned no keyword results for ${domainUrl}`);
      throw new Error("No keywords found for this domain");
    }
    
    // Process the results
    const keywords: KeywordData[] = data.results.map((item: any) => ({
      keyword: item.keyword || '',
      volume: item.search_volume || 0,
      difficulty: Math.round((item.competition || 0.5) * 100),
      cpc: item.cpc || 0,
      competition: item.competition || 'medium',
      position: item.position,
      rankingUrl: null,
      traffic: item.traffic || 0,
      trafficCost: 0
    }));
    
    console.log(`Successfully extracted ${keywords.length} keywords from DataForSEO API`);
    return keywords;
  } catch (error) {
    console.error(`Error fetching DataForSEO keywords for ${domainUrl}:`, error);
    throw error;
  }
};
