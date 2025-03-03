
// Local storage keys for Pinecone configuration
const STORAGE_KEYS = {
  API_KEY: 'PINECONE_API_KEY',
  INDEX: 'PINECONE_INDEX',
  HOST: 'PINECONE_HOST',
  REGION: 'PINECONE_REGION',
  NAMESPACE: 'PINECONE_NAMESPACE',
  ENABLED_STATES: 'apiEnabledStates',
  ERRORS: 'pineconeErrors'
};

// Default config values
let PINECONE_API_KEY = '';
let PINECONE_INDEX = 'llama-text-embed-v2-index';
let PINECONE_HOST = '';
let PINECONE_REGION = 'us-east-1';
let PINECONE_NAMESPACE = 'ns1';

/**
 * Sets the Pinecone API configuration
 */
export const configurePinecone = (
  apiKey: string, 
  index: string = PINECONE_INDEX, 
  host: string = '', 
  region: string = 'us-east-1',
  namespace: string = 'ns1'
) => {
  PINECONE_API_KEY = apiKey;
  PINECONE_INDEX = index;
  PINECONE_HOST = host;
  PINECONE_REGION = region;
  PINECONE_NAMESPACE = namespace;
  
  // Persist configuration in localStorage
  try {
    localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey);
    localStorage.setItem(STORAGE_KEYS.INDEX, index);
    localStorage.setItem(STORAGE_KEYS.HOST, host);
    localStorage.setItem(STORAGE_KEYS.REGION, region);
    localStorage.setItem(STORAGE_KEYS.NAMESPACE, namespace);
    
    // Mark Pinecone as configured in the system health
    const apiEnabledStates = JSON.parse(localStorage.getItem(STORAGE_KEYS.ENABLED_STATES) || '{}');
    apiEnabledStates.pinecone = true;
    localStorage.setItem(STORAGE_KEYS.ENABLED_STATES, JSON.stringify(apiEnabledStates));
    
    // Clear any previous errors
    localStorage.removeItem(STORAGE_KEYS.ERRORS);
    
    console.log("Pinecone configuration saved to localStorage");
  } catch (error) {
    console.error("Error saving Pinecone config to localStorage:", error);
  }
  
  return { success: true };
};

/**
 * Retrieve the current Pinecone configuration
 */
export const getPineconeConfig = () => {
  // If we haven't loaded from localStorage yet, do so now
  if (PINECONE_API_KEY === '') {
    try {
      const savedApiKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
      const savedIndex = localStorage.getItem(STORAGE_KEYS.INDEX);
      const savedHost = localStorage.getItem(STORAGE_KEYS.HOST);
      const savedRegion = localStorage.getItem(STORAGE_KEYS.REGION);
      const savedNamespace = localStorage.getItem(STORAGE_KEYS.NAMESPACE);
      
      if (savedApiKey) {
        PINECONE_API_KEY = savedApiKey;
      }
      
      if (savedIndex) {
        PINECONE_INDEX = savedIndex;
      }
      
      if (savedHost) {
        PINECONE_HOST = savedHost;
      }
      
      if (savedRegion) {
        PINECONE_REGION = savedRegion;
      }
      
      if (savedNamespace) {
        PINECONE_NAMESPACE = savedNamespace;
      }
    } catch (error) {
      console.error("Error loading Pinecone config from localStorage:", error);
    }
  }
  
  return {
    apiKey: PINECONE_API_KEY ? PINECONE_API_KEY.substring(0, 5) + '...' : '',
    index: PINECONE_INDEX,
    host: PINECONE_HOST,
    region: PINECONE_REGION,
    namespace: PINECONE_NAMESPACE
  };
};

/**
 * Checks if Pinecone is configured
 */
export const isPineconeConfigured = () => {
  // Check if we need to load from localStorage (on page refresh)
  if (PINECONE_API_KEY === '') {
    try {
      const savedApiKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
      const savedIndex = localStorage.getItem(STORAGE_KEYS.INDEX);
      const savedHost = localStorage.getItem(STORAGE_KEYS.HOST);
      const savedRegion = localStorage.getItem(STORAGE_KEYS.REGION);
      const savedNamespace = localStorage.getItem(STORAGE_KEYS.NAMESPACE);
      
      if (savedApiKey) {
        PINECONE_API_KEY = savedApiKey;
        console.log("Loaded Pinecone API key from localStorage");
      }
      
      if (savedIndex) {
        PINECONE_INDEX = savedIndex;
      }
      
      if (savedHost) {
        PINECONE_HOST = savedHost;
      }
      
      if (savedRegion) {
        PINECONE_REGION = savedRegion;
      }
      
      if (savedNamespace) {
        PINECONE_NAMESPACE = savedNamespace;
      }
    } catch (error) {
      console.error("Error loading Pinecone config from localStorage:", error);
    }
  }
  
  return PINECONE_API_KEY !== '';
};

/**
 * Get the API URL for Pinecone operations
 */
export const getPineconeApiUrl = (endpoint: string = '') => {
  // If a custom host is provided, use it directly
  if (PINECONE_HOST) {
    // Make sure the URL has the correct format
    const baseUrl = PINECONE_HOST.endsWith('/') ? PINECONE_HOST.slice(0, -1) : PINECONE_HOST;
    return `${baseUrl}${endpoint ? `/${endpoint}` : ''}`;
  }
  
  // Otherwise, construct the Pinecone URL from index and region
  // Make sure we're using the latest Pinecone URL format
  if (!PINECONE_INDEX || !PINECONE_REGION) {
    console.warn("Missing Pinecone index or region, using defaults");
  }
  
  const index = PINECONE_INDEX || 'llama-text-embed-v2-index';
  const region = PINECONE_REGION || 'us-east-1';
  
  // The newer Pinecone URL format
  return `https://${index}-${region}.svc.${region}.pinecone.io${endpoint ? `/${endpoint}` : ''}`;
};

/**
 * Get the API key
 */
export const getPineconeApiKey = () => PINECONE_API_KEY;

/**
 * Get the namespace
 */
export const getPineconeNamespace = () => PINECONE_NAMESPACE;

// Export the storage keys for use in other modules
export { STORAGE_KEYS };
