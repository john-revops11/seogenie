
// DataForSEO API client service
import { toast } from 'sonner';

// DataForSEO credentials
const username = "armin@revologyanalytics.com";
const password = "ab4016dc9302b8cf";

export type DataForSEOEndpoint = 
  | '/v3/dataforseo_labs/google/domain_rank_overview/live'
  | '/v3/serp/google/organic/live/regular'
  | '/v3/on_page/tasks_post'
  | '/v3/backlinks/summary'  // Changed from '/v3/backlinks/live/links' to the correct endpoint
  | '/v3/keywords_data/google_ads/live/regular'
  | '/v3/competitors_domain/google/organic/live/regular'
  | '/v3/keywords_data/google_ads/keywords_for_site/live'
  | '/v3/keywords_data/google/search_volume/live';

export const callDataForSeoApi = async <T>(endpoint: DataForSEOEndpoint, data: any): Promise<T | null> => {
  const credentials = btoa(`${username}:${password}`);
  const url = `https://api.dataforseo.com${endpoint}`;

  try {
    console.log(`Calling DataForSEO API: ${endpoint}`);
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${credentials}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`DataForSEO API ${endpoint} responded with ${response.status}: ${errorText}`);
      throw new Error(`API error (${response.status}): ${errorText}`);
    }

    const responseData = await response.json();
    
    if (responseData.status_code !== 20000) {
      throw new Error(`DataForSEO API error: ${responseData.status_message || 'Unknown error'}`);
    }
    
    console.log("DataForSEO API response:", responseData);
    return responseData as T;
  } catch (error) {
    console.error(`Error calling DataForSEO API ${endpoint}:`, error);
    toast.error(`API Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
};

// Domain Analytics
export const fetchDomainAnalytics = async (domain: string) => {
  return callDataForSeoApi('/v3/dataforseo_labs/google/domain_rank_overview/live', [{ target: domain }]);
};

// SERP Organic Tracking
export const fetchSerpData = async (keyword: string) => {
  return callDataForSeoApi('/v3/serp/google/organic/live/regular', [
    {
      keyword,
      location_code: 2840,
      language_code: "en"
    }
  ]);
};

// On-Page SEO Checker
export const fetchOnPageData = async (urlToCheck: string) => {
  return callDataForSeoApi('/v3/on_page/tasks_post', [
    {
      target: urlToCheck
    }
  ]);
};

// Backlinks Analytics - Updated to use correct endpoint and parameters
export const fetchBacklinkData = async (domain: string) => {
  // Using backlinks summary endpoint instead of links endpoint
  return callDataForSeoApi('/v3/backlinks/summary', [{ 
    target: domain,
    limit: 10
  }]);
};

// Keywords Data (Google Ads)
export const fetchKeywordData = async (keyword: string) => {
  return callDataForSeoApi('/v3/keywords_data/google_ads/live/regular', [
    {
      keyword,
      location_code: 2840,
      language_code: "en"
    }
  ]);
};

// Domain Keywords
export const fetchDomainKeywords = async (domain: string) => {
  return callDataForSeoApi('/v3/keywords_data/google_ads/keywords_for_site/live', [
    {
      target: domain,
      location_code: 2840,
      language_code: "en",
      sort_by: "relevance"
    }
  ]);
};

// Keyword Search Volume
export const fetchKeywordVolume = async (keywords: string[]) => {
  return callDataForSeoApi('/v3/keywords_data/google/search_volume/live', [
    {
      language_code: "en",
      location_code: 2840,
      keywords
    }
  ]);
};

// Competitor Data
export const fetchCompetitorData = async (domain: string) => {
  return callDataForSeoApi('/v3/competitors_domain/google/organic/live/regular', [{ target: domain }]);
};
