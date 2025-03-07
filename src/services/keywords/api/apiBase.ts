
import { setApiKey, getApiKey as getDynamicApiKey } from '../apiConfig';

// Helper function to get API credentials from dynamic API keys
export function getApiKey(apiName: string): string | null {
  // Check if we have the key in the dynamic storage
  const dynamicKey = getApiKeyFromDynamic(apiName);
  if (dynamicKey) return dynamicKey;
  
  // If no specific key was found, return null
  return null;
}

// Helper to retrieve from dynamic API keys
function getApiKeyFromDynamic(apiName: string): string | null {
  return getDynamicApiKey(apiName) || null;
}
