
// Local storage keys for Pinecone configuration
const STORAGE_KEYS = {
  API_KEY: 'PINECONE_API_KEY',
  INDEX: 'PINECONE_INDEX',
  HOST: 'PINECONE_HOST',
  REGION: 'PINECONE_REGION',
  ENABLED_STATES: 'apiEnabledStates',
  ERRORS: 'pineconeErrors'
};

// Default config values
let PINECONE_API_KEY = '';
let PINECONE_INDEX = 'content-index';
let PINECONE_HOST = '';
let PINECONE_REGION = 'us-east-1';

/**
 * Sets the Pinecone API configuration
 */
export const configurePinecone = (apiKey: string, index: string = PINECONE_INDEX, host: string = '', region: string = 'us-east-1') => {
  PINECONE_API_KEY = apiKey;
  PINECONE_INDEX = index;
  PINECONE_HOST = host;
  PINECONE_REGION = region;
  
  // Persist configuration in localStorage
  try {
    localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey);
    localStorage.setItem(STORAGE_KEYS.INDEX, index);
    localStorage.setItem(STORAGE_KEYS.HOST, host);
    localStorage.setItem(STORAGE_KEYS.REGION, region);
    
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
 * Retrieve the current Pinecone API configuration
 */
export const getPineconeConfig = () => {
  // If we haven't loaded from localStorage yet, do so now
  if (PINECONE_API_KEY === '') {
    try {
      const savedApiKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
      const savedIndex = localStorage.getItem(STORAGE_KEYS.INDEX);
      const savedHost = localStorage.getItem(STORAGE_KEYS.HOST);
      const savedRegion = localStorage.getItem(STORAGE_KEYS.REGION);
      
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
    } catch (error) {
      console.error("Error loading Pinecone config from localStorage:", error);
    }
  }
  
  return {
    apiKey: PINECONE_API_KEY ? PINECONE_API_KEY.substring(0, 5) + '...' : '',
    index: PINECONE_INDEX,
    host: PINECONE_HOST,
    region: PINECONE_REGION
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
  if (PINECONE_HOST) {
    return `${PINECONE_HOST}${endpoint ? `/${endpoint}` : ''}`;
  }
  
  return `https://${PINECONE_INDEX}-${PINECONE_REGION}.svc.${PINECONE_REGION}.pinecone.io${endpoint ? `/${endpoint}` : ''}`;
};

/**
 * Get the API key
 */
export const getPineconeApiKey = () => PINECONE_API_KEY;

// Export the storage keys for use in other modules
export { STORAGE_KEYS };
