
// Pinecone configuration management
import { getApiKey } from '@/services/apiIntegrationService';

// Pinecone configuration info
let PINECONE_API_KEY = '';
let PINECONE_INDEX = 'revology-rag-llm';
let PINECONE_ENVIRONMENT = 'aped-4627-b74a'; 
let PINECONE_CLOUD = 'AWS';
let PINECONE_REGION = 'us-east-1';
let PINECONE_TYPE = 'Dense';
let PINECONE_CAPACITY_MODE = 'Serverless';
let PINECONE_DIMENSION = 1536;

// Try to load configuration from localStorage on initialization
try {
  const savedConfig = localStorage.getItem('pineconeConfig');
  if (savedConfig) {
    const config = JSON.parse(savedConfig);
    PINECONE_API_KEY = config.apiKey || '';
    PINECONE_INDEX = config.index || 'revology-rag-llm';
    PINECONE_ENVIRONMENT = config.environment || 'aped-4627-b74a';
    PINECONE_CLOUD = config.cloud || 'AWS';
    PINECONE_REGION = config.region || 'us-east-1';
    PINECONE_TYPE = config.type || 'Dense';
    PINECONE_CAPACITY_MODE = config.capacityMode || 'Serverless';
    PINECONE_DIMENSION = config.dimension || 1536;
  }
} catch (error) {
  console.error("Error loading Pinecone config from localStorage:", error);
}

/**
 * Sets the Pinecone API configuration
 */
export const configurePinecone = (
  apiKey: string, 
  index: string = PINECONE_INDEX,
  environment: string = PINECONE_ENVIRONMENT,
  cloud: string = PINECONE_CLOUD,
  region: string = PINECONE_REGION,
  type: string = PINECONE_TYPE,
  capacityMode: string = PINECONE_CAPACITY_MODE,
  dimension: number = PINECONE_DIMENSION
) => {
  PINECONE_API_KEY = apiKey;
  PINECONE_INDEX = index;
  PINECONE_ENVIRONMENT = environment;
  PINECONE_CLOUD = cloud;
  PINECONE_REGION = region;
  PINECONE_TYPE = type;
  PINECONE_CAPACITY_MODE = capacityMode;
  PINECONE_DIMENSION = dimension;
  
  // Save config to localStorage
  try {
    const config = {
      apiKey,
      index,
      environment,
      cloud,
      region,
      type,
      capacityMode,
      dimension
    };
    localStorage.setItem('pineconeConfig', JSON.stringify(config));
  } catch (error) {
    console.error("Error saving Pinecone config to localStorage:", error);
  }
  
  return { success: true };
};

/**
 * Retrieve the current Pinecone API configuration
 */
export const getPineconeConfig = () => {
  return {
    apiKey: PINECONE_API_KEY ? PINECONE_API_KEY.substring(0, 5) + '...' : '',
    index: PINECONE_INDEX,
    environment: PINECONE_ENVIRONMENT,
    cloud: PINECONE_CLOUD,
    region: PINECONE_REGION,
    type: PINECONE_TYPE,
    capacityMode: PINECONE_CAPACITY_MODE,
    dimension: PINECONE_DIMENSION
  };
};

/**
 * Returns the full Pinecone host URL
 */
export const getPineconeHostUrl = () => {
  return `https://${PINECONE_INDEX}-${PINECONE_ENVIRONMENT}.svc.${PINECONE_ENVIRONMENT}.pinecone.io`;
};

/**
 * Checks if Pinecone is configured
 */
export const isPineconeConfigured = () => {
  return PINECONE_API_KEY !== '';
};

/**
 * Internal function to get the raw API key for use in other modules
 */
export const getPineconeApiKey = () => PINECONE_API_KEY;
