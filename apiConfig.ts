// Dynamic API keys storage
const dynamicApiKeys: Record<string, string> = {};

// API key validation patterns
const API_KEY_PATTERNS: Record<string, RegExp> = {
  openai: /^sk-[a-zA-Z0-9]{32,}$/,
  pinecone: /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/,
  semrush: /^[a-zA-Z0-9]{32}$/,
  dataforseo_login: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  dataforseo_password: /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/
};

/**
 * Sets an API key for a service
 */
export const setApiKey = (service: string, key: string): boolean => {
  const pattern = API_KEY_PATTERNS[service.toLowerCase()];
  if (!pattern) {
    console.error(`No validation pattern found for service: ${service}`);
    return false;
  }

  if (!pattern.test(key)) {
    console.error(`Invalid API key format for service: ${service}`);
    return false;
  }

  dynamicApiKeys[service.toLowerCase()] = key;
  console.log(`API key set for service: ${service}`);
  return true;
};

/**
 * Gets an API key for a service
 */
export const getApiKey = (service: string): string | null => {
  return dynamicApiKeys[service.toLowerCase()] || null;
};

/**
 * Removes an API key for a service
 */
export const removeApiKey = (service: string): boolean => {
  if (dynamicApiKeys[service.toLowerCase()]) {
    delete dynamicApiKeys[service.toLowerCase()];
    console.log(`API key removed for service: ${service}`);
    return true;
  }
  return false;
};

/**
 * Checks if an API key is configured for a service
 */
export const isApiKeyConfigured = (service: string): boolean => {
  return Boolean(dynamicApiKeys[service.toLowerCase()]);
};

/**
 * Clears all API keys
 */
export const clearAllApiKeys = (): void => {
  Object.keys(dynamicApiKeys).forEach(service => {
    delete dynamicApiKeys[service];
  });
  console.log('All API keys cleared');
};

/**
 * Gets the validation pattern for a service
 */
export const getApiKeyPattern = (service: string): RegExp | null => {
  return API_KEY_PATTERNS[service.toLowerCase()] || null;
};

/**
 * Validates an API key format for a service
 */
export const validateApiKey = (service: string, key: string): boolean => {
  const pattern = API_KEY_PATTERNS[service.toLowerCase()];
  if (!pattern) {
    return false;
  }
  return pattern.test(key);
};
