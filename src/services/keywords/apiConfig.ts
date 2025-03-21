
// API configuration and keys
import { getApiKey as getApiKeyFromService } from "@/services/apiIntegrationService";

// DataForSEO API configuration
export const DATAFORSEO_API_URL = "https://api.dataforseo.com/v3/serp/google/organic/live/advanced";
export const DATAFORSEO_KEYWORDS_API_URL = "https://api.dataforseo.com/v3/keywords_data/google/search_volume/live";

// RapidAPI configuration
export const API_HOST = "domain-seo-analysis.p.rapidapi.com";
export const API_URL = "https://domain-seo-analysis.p.rapidapi.com/domain-seo-analysis";
export const API_KEY = "7a0b0d8a49msh468233bdf363ce4p13b9a6jsnd07ada3a9eff";

// Google Keyword API configuration
export const GOOGLE_KEYWORD_API_HOST = "google-keyword-research-api.p.rapidapi.com";
export const GOOGLE_KEYWORD_API_URL = "https://google-keyword-research-api.p.rapidapi.com/keywords";

// OpenAI configuration
export const OPENAI_API_KEY = "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";

// Dynamic API key accessor - allows getting API keys that are set at runtime
let dynamicApiKeys: Record<string, string> = {
  // Initialize with default keys that can be overridden
  openai: OPENAI_API_KEY,
  gemini: "AIzaSyCJIDNvI7w8jpjyWLI9yaPp3PWAeD95AnA",
  dataforseo: "",
  rapidapi: API_KEY
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
