// API configuration and keys

// SemRush API configuration
export const SEMRUSH_API_KEY = ""; // Will be populated from ApiIntegrationManager
export const SEMRUSH_API_URL = "https://api.semrush.com/analytics/v1/";

// DataForSEO API configuration
export const DATAFORSEO_LOGIN = "armin@revologyanalytics.com";
export const DATAFORSEO_PASSWORD = "ab4016dc9302b8cf";
export const DATAFORSEO_API_URL = "https://api.dataforseo.com/v3/keywords_data/google/organic_search_volume";
export const DATAFORSEO_KEYWORDS_API_URL = "https://api.dataforseo.com/v3/keywords_data/google/keywords_for_keywords";

// Keep old API configurations for backward compatibility and fallback
export const API_HOST = "keyword-tool.p.rapidapi.com";
export const API_KEY = "795e7799e2116908b7e00f6992fb812d1da70905"; // Updated API key
export const API_URL = "https://keyword-tool.p.rapidapi.com/urlextract/";

// Google Keyword Insight API configuration
export const GOOGLE_KEYWORD_API_HOST = "google-keyword-insight1.p.rapidapi.com";
export const GOOGLE_KEYWORD_API_URL = "https://google-keyword-insight1.p.rapidapi.com/globalurl/";

// OpenAI API configuration
export const OPENAI_API_KEY = ""; // This will be populated dynamically via the ApiIntegrationManager

// Gemini AI configuration
export const GEMINI_API_KEY = "AIzaSyCJIDNvI7w8jpjyWLI9yaPp3PWAeD95AnA"; // Default API key
export const GEMINI_PROJECT_ID = "623108624631"; // Default project ID

// Dynamic API key accessor - allows getting API keys that are set at runtime
let dynamicApiKeys: Record<string, string> = {
  // Initialize with default keys that can be overridden
  openai: "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",
  gemini: GEMINI_API_KEY
};

export const setApiKey = (service: string, key: string) => {
  dynamicApiKeys[service.toLowerCase()] = key;
  console.log(`Set API key for ${service}`);
};

export const getApiKey = (service: string): string => {
  const key = service.toLowerCase();
  const apiKey = dynamicApiKeys[key] || "";
  console.log(`Getting API key for ${service}: ${apiKey ? "Key found" : "No key found"}`);
  return apiKey;
};

export const removeApiKey = (service: string): void => {
  const key = service.toLowerCase();
  if (dynamicApiKeys[key]) {
    delete dynamicApiKeys[key];
    console.log(`Removed API key for ${service}`);
  }
};
