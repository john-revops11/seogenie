
// API configuration and keys
import { getApiKey } from "@/services/apiIntegrationService";

// DataForSEO API configuration
export const DATAFORSEO_LOGIN = "armin@revologyanalytics.com";
export const DATAFORSEO_PASSWORD = "ab4016dc9302b8cf";

// Dynamic API key accessor - allows getting API keys that are set at runtime
let dynamicApiKeys: Record<string, string> = {
  // Initialize with default keys that can be overridden
  openai: "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",
  gemini: "AIzaSyCJIDNvI7w8jpjyWLI9yaPp3PWAeD95AnA",
  dataforseo: `${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`
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
