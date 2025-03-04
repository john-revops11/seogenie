// API configuration and keys

// DataForSEO API configuration
export const DATAFORSEO_LOGIN = "john@revologyanalytics.com";
export const DATAFORSEO_PASSWORD = "c5a4c248785ced68"; // Updated password for all DataForSEO APIs
export const DATAFORSEO_API_URL = "https://api.dataforseo.com/v3/keywords_data/google_ads/keywords_for_site/live";
export const DATAFORSEO_KEYWORDS_API_URL = "https://api.dataforseo.com/v3/keywords_data/google_ads/keywords_for_keywords/task_post";
export const DATAFORSEO_KEYWORDS_PASSWORD = "c5a4c248785ced68"; // Now using the same password

// SemRush API configuration
export const SEMRUSH_API_KEY = ""; // Will be populated from ApiIntegrationManager
export const SEMRUSH_API_URL = "https://api.semrush.com/analytics/v1/";

// Keep old API configurations for backward compatibility and fallback
export const API_HOST = "keyword-tool.p.rapidapi.com";
export const API_KEY = "795e7799e2116908b7e00f6992fb812d1da70905"; // Updated API key
export const API_URL = "https://keyword-tool.p.rapidapi.com/urlextract/";
export const OPENAI_API_KEY = "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";

// Google Keyword Insight API configuration
export const GOOGLE_KEYWORD_API_HOST = "google-keyword-insight1.p.rapidapi.com";
export const GOOGLE_KEYWORD_API_URL = "https://google-keyword-insight1.p.rapidapi.com/globalurl/";

// Dynamic API key accessor - allows getting API keys that are set at runtime
let dynamicApiKeys: Record<string, string> = {};

export const setApiKey = (service: string, key: string) => {
  dynamicApiKeys[service.toLowerCase()] = key;
};

export const getApiKey = (service: string): string => {
  const key = service.toLowerCase();
  return dynamicApiKeys[key] || "";
};
