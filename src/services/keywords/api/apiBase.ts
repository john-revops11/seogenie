
import { DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD } from '../apiConfig';

// Helper function to get API credentials from dynamic API keys
export function getApiKey(apiName: string): string | null {
  // Check if we have the key in the dynamic storage
  const dynamicKey = getApiKeyFromDynamic(apiName);
  if (dynamicKey) return dynamicKey;
  
  // Fall back to the hardcoded credentials in apiConfig
  if (apiName.toLowerCase() === 'dataforseo') {
    return `${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`;
  }
  
  return null;
}

// Helper to retrieve from dynamic API keys (implemented elsewhere)
function getApiKeyFromDynamic(apiName: string): string | null {
  // This would typically integrate with apiConfig.getApiKey
  // For now, let's just return null to use the fallback
  return null;
}
