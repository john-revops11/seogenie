import { getApiKey } from '../api/apiConfig';
import { rateLimiter } from '../api/rateLimiter';
import { toast } from 'sonner';

// DataForSEO API endpoints
const BASE_URL = "https://api.dataforseo.com/v3";

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface DataForSEOAuth {
  login: string;
  password: string;
}

interface DataForSEORequest {
  [key: string]: any;
}

/**
 * Makes an API call to DataForSEO with rate limiting and timeout handling
 */
const makeDataForSEORequest = async (
  endpoint: string,
  method: string = 'POST',
  body: DataForSEORequest = {}
): Promise<any> => {
  // Check rate limit before making request
  await rateLimiter.checkLimit('dataforseo');

  const auth = getDataForSEOAuth();
  if (!auth) {
    throw new Error("DataForSEO credentials not configured");
  }

  // Make the API call with timeout
  const response = await rateLimiter.setTimeout('dataforseo', fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${btoa(`${auth.login}:${auth.password}`)}`
    },
    body: JSON.stringify(body)
  }));

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DataForSEO API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  // Check for API-specific errors
  if (data.status_code !== 20000) {
    throw new Error(`DataForSEO API error: ${data.status_message || 'Unknown error'}`);
  }

  return data;
};

/**
 * Gets DataForSEO authentication credentials
 */
const getDataForSEOAuth = (): DataForSEOAuth | null => {
  const login = getApiKey('dataforseo_login');
  const password = getApiKey('dataforseo_password');

  if (!login || !password) {
    return null;
  }

  return { login, password };
};

/**
 * Checks if DataForSEO is configured
 */
export const isDataForSEOConfigured = (): boolean => {
  return Boolean(getDataForSEOAuth());
};

/**
 * Fetches keyword data from DataForSEO
 */
export const fetchKeywordData = async (
  keyword: string,
  locationCode: number = 2840, // US
  languageCode: string = 'en'
): Promise<any> => {
  const requestBody = {
    keyword,
    location_code: locationCode,
    language_code: languageCode,
    include_serp_info: true,
    include_adult: false,
    include_seed_keyword: true
  };

  for (let retry = 0; retry < MAX_RETRIES; retry++) {
    try {
      if (retry > 0) {
        await delay(RETRY_DELAY * retry); // Exponential backoff
      }

      const data = await makeDataForSEORequest('/keywords_data/google/search_volume/live', 'POST', requestBody);
      return processKeywordData(data);
    } catch (error) {
      if (retry === MAX_RETRIES - 1) {
        console.error("Error fetching keyword data from DataForSEO:", error);
        throw error;
      }
    }
  }

  throw new Error("Failed to fetch keyword data after multiple retries");
};

/**
 * Fetches SERP data from DataForSEO
 */
export const fetchSERPData = async (
  keyword: string,
  locationCode: number = 2840, // US
  languageCode: string = 'en'
): Promise<any> => {
  const requestBody = {
    keyword,
    location_code: locationCode,
    language_code: languageCode,
    depth: 100,
    include_serp_info: true,
    include_adult: false
  };

  for (let retry = 0; retry < MAX_RETRIES; retry++) {
    try {
      if (retry > 0) {
        await delay(RETRY_DELAY * retry); // Exponential backoff
      }

      const data = await makeDataForSEORequest('/serp/google/organic/live/advanced', 'POST', requestBody);
      return processSERPData(data);
    } catch (error) {
      if (retry === MAX_RETRIES - 1) {
        console.error("Error fetching SERP data from DataForSEO:", error);
        throw error;
      }
    }
  }

  throw new Error("Failed to fetch SERP data after multiple retries");
};

/**
 * Fetches competitor analysis data
 */
export const fetchCompetitorAnalysis = async (
  domain: string,
  locationCode: number = 2840, // US
  languageCode: string = 'en'
): Promise<any> => {
  const requestBody = {
    target: domain,
    location_code: locationCode,
    language_code: languageCode,
    filters: [
      ['metrics.organic.keywords', '>', 0]
    ],
    order_by: [
      ['metrics.organic.keywords', 'desc']
    ],
    limit: 20
  };

  for (let retry = 0; retry < MAX_RETRIES; retry++) {
    try {
      if (retry > 0) {
        await delay(RETRY_DELAY * retry); // Exponential backoff
      }

      const data = await makeDataForSEORequest('/domain_analytics/competitors/live', 'POST', requestBody);
      return processCompetitorData(data);
    } catch (error) {
      if (retry === MAX_RETRIES - 1) {
        console.error("Error fetching competitor analysis from DataForSEO:", error);
        throw error;
      }
    }
  }

  throw new Error("Failed to fetch competitor analysis after multiple retries");
};

/**
 * Processes keyword data from DataForSEO response
 */
const processKeywordData = (data: any): any => {
  if (!data.tasks?.[0]?.result?.[0]) {
    throw new Error("No keyword data found in response");
  }

  const result = data.tasks[0].result[0];
  return {
    keyword: result.keyword,
    searchVolume: result.search_volume,
    cpc: result.cpc,
    competition: result.competition,
    monthlySearches: result.monthly_searches,
    serpInfo: result.serp_info,
    seedKeyword: result.seed_keyword
  };
};

/**
 * Processes SERP data from DataForSEO response
 */
const processSERPData = (data: any): any => {
  if (!data.tasks?.[0]?.result?.[0]?.items) {
    throw new Error("No SERP data found in response");
  }

  const items = data.tasks[0].result[0].items;
  return items.map((item: any) => ({
    position: item.rank_absolute,
    title: item.title,
    url: item.url,
    description: item.description,
    breadcrumb: item.breadcrumb,
    metrics: {
      backlinks: item.metrics?.backlinks,
      referringDomains: item.metrics?.referring_domains,
      referringPages: item.metrics?.referring_pages
    }
  }));
};

/**
 * Processes competitor data from DataForSEO response
 */
const processCompetitorData = (data: any): any => {
  if (!data.tasks?.[0]?.result?.[0]?.items) {
    throw new Error("No competitor data found in response");
  }

  const items = data.tasks[0].result[0].items;
  return items.map((item: any) => ({
    domain: item.domain,
    metrics: {
      organicKeywords: item.metrics?.organic?.keywords,
      organicTraffic: item.metrics?.organic?.traffic,
      paidKeywords: item.metrics?.paid?.keywords,
      paidTraffic: item.metrics?.paid?.traffic
    },
    keywords: item.keywords,
    backlinks: item.backlinks
  }));
};

/**
 * Tests the DataForSEO API connection
 */
export const testDataForSEOConnection = async (): Promise<boolean> => {
  try {
    const auth = getDataForSEOAuth();
    if (!auth) {
      return false;
    }

    const requestBody = {
      keyword: "test",
      location_code: 2840,
      language_code: "en"
    };

    const data = await makeDataForSEORequest('/keywords_data/google/search_volume/live', 'POST', requestBody);
    return data.status_code === 20000;
  } catch (error) {
    console.error("Error testing DataForSEO API connection:", error);
    return false;
  }
};
