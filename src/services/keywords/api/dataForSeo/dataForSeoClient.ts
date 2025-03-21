
import { toast } from "sonner";

// Default DataForSEO credentials
const DEFAULT_AUTH = "YXJtaW5AcmV2b2xvZ3lhbmFseXRpY3MuY29tOmFiNDAxNmRjOTMwMmI4Y2Y=";

// Base DataForSEO API URL
const API_BASE_URL = "https://api.dataforseo.com";

// Interface for API responses
interface ApiResponse<T> {
  status_code: number;
  status_message: string;
  tasks: {
    id: string;
    status_code: number;
    status_message: string;
    result: T[];
  }[];
  error?: string;
}

/**
 * Generic function to call DataForSEO APIs
 */
export const callDataForSeoApi = async <T>(
  endpoint: string,
  body: any[],
  auth: string = DEFAULT_AUTH
): Promise<ApiResponse<T> | null> => {
  try {
    console.log(`Making DataForSEO API request to ${endpoint}`);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${auth}`
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`DataForSEO API error (${response.status}): ${errorText}`);
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status_code !== 20000) {
      console.error(`DataForSEO API error: ${data.status_message}`);
      throw new Error(data.status_message || "Unknown API error");
    }
    
    return data as ApiResponse<T>;
  } catch (error) {
    console.error(`Error calling DataForSEO API:`, error);
    return null;
  }
};

/**
 * Fetch domain keywords from DataForSEO API
 */
export const fetchDomainKeywords = async (
  domain: string,
  locationCode: number = 2840,
  languageCode: string = "en",
  limit: number = 500
) => {
  const cleanDomain = domain.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
  
  return callDataForSeoApi(`/v3/dataforseo_labs/google/keywords_for_site/live`, [
    {
      target: cleanDomain,
      location_code: locationCode,
      language_code: languageCode,
      include_serp_info: false,
      include_subdomains: true,
      ignore_synonyms: false,
      include_clickstream_data: false,
      limit: limit
    }
  ]);
};

/**
 * Fetch domain analytics data
 */
export const fetchDomainAnalytics = async (
  domain: string,
  locationCode: number = 2840
) => {
  const cleanDomain = domain.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
  
  return callDataForSeoApi(`/v3/dataforseo_labs/google/domain_rank_overview/live`, [
    {
      target: cleanDomain,
      location_code: locationCode,
      language_code: "en",
      ignore_synonyms: false
    }
  ]);
};

/**
 * Fetch backlink data for a domain
 */
export const fetchBacklinkData = async (
  domain: string
) => {
  const cleanDomain = domain.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
  
  return callDataForSeoApi(`/v3/backlinks/summary/live`, [
    {
      target: cleanDomain,
      limit: 10
    }
  ]);
};

/**
 * Fetch domain intersection data for keyword gaps
 */
export const fetchDomainIntersection = async (
  target1Domain: string,
  target2Domain: string,
  locationCode: number = 2840
) => {
  const cleanTarget1 = target1Domain.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
  const cleanTarget2 = target2Domain.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
  
  return callDataForSeoApi(`/v3/dataforseo_labs/google/domain_intersection/live`, [
    {
      target1: cleanTarget1,
      target2: cleanTarget2,
      location_code: locationCode,
      language_code: "en",
      include_serp_info: true,
      intersections: true,
      item_types: ["organic"],
      limit: 100
    }
  ]);
};
