
import { OPENAI_API_KEY } from '../keywords/apiConfig';

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
 * Test Pinecone connection
 */
export const testPineconeConnection = async () => {
  if (!isPineconeConfigured()) {
    return { success: false, message: "Pinecone API key not configured" };
  }
  
  try {
    const response = await fetch(`${getPineconeHostUrl()}/describe_index_stats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': PINECONE_API_KEY
      },
      body: JSON.stringify({ filter: {} })
    });
    
    if (!response.ok) {
      throw new Error(`Pinecone API error: ${response.status}`);
    }
    
    const data = await response.json();
    return { 
      success: true, 
      data,
      message: "Successfully connected to Pinecone"
    };
  } catch (error) {
    return { 
      success: false, 
      message: `Failed to connect to Pinecone: ${(error as Error).message}`
    };
  }
};

/**
 * Creates text embedding using OpenAI
 */
export const createEmbedding = async (text: string): Promise<number[]> => {
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-3-small'
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error("Error creating embedding:", error);
    throw new Error(`Failed to create embedding: ${(error as Error).message}`);
  }
};

/**
 * Upserts a document into the Pinecone index
 */
export const upsertToPinecone = async (
  id: string,
  embedding: number[],
  metadata: Record<string, any>
): Promise<boolean> => {
  if (!isPineconeConfigured()) {
    throw new Error("Pinecone is not configured");
  }

  try {
    const response = await fetch(`${getPineconeHostUrl()}/vectors/upsert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': PINECONE_API_KEY
      },
      body: JSON.stringify({
        vectors: [{
          id,
          values: embedding,
          metadata
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pinecone API error: ${response.status} - ${errorText}`);
    }

    return true;
  } catch (error) {
    console.error("Error upserting to Pinecone:", error);
    throw new Error(`Failed to upsert to Pinecone: ${(error as Error).message}`);
  }
};

/**
 * Searches the Pinecone index for similar vectors
 */
export const queryPinecone = async (
  embedding: number[],
  topK: number = 5,
  filter: Record<string, any> = {}
): Promise<Array<{
  id: string;
  score: number;
  metadata: Record<string, any>;
}>> => {
  if (!isPineconeConfigured()) {
    throw new Error("Pinecone is not configured");
  }

  try {
    const response = await fetch(`${getPineconeHostUrl()}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': PINECONE_API_KEY
      },
      body: JSON.stringify({
        vector: embedding,
        topK,
        includeMetadata: true,
        filter
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pinecone API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.matches;
  } catch (error) {
    console.error("Error querying Pinecone:", error);
    throw new Error(`Failed to query Pinecone: ${(error as Error).message}`);
  }
};

/**
 * Indexes a document into Pinecone with generated embedding
 */
export const indexDocument = async (
  text: string, 
  metadata: Record<string, any> = {}
): Promise<string> => {
  try {
    const id = `doc_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const embedding = await createEmbedding(text);
    await upsertToPinecone(id, embedding, {
      ...metadata,
      text: text.slice(0, 1000) // Store a preview of the text
    });
    return id;
  } catch (error) {
    console.error("Error indexing document:", error);
    throw new Error(`Failed to index document: ${(error as Error).message}`);
  }
};

/**
 * Retrieves similar documents from Pinecone based on a query
 */
export const retrieveSimilarDocuments = async (
  query: string,
  topK: number = 5,
  filter: Record<string, any> = {}
): Promise<Array<{
  id: string;
  score: number;
  metadata: Record<string, any>;
}>> => {
  try {
    const queryEmbedding = await createEmbedding(query);
    return await queryPinecone(queryEmbedding, topK, filter);
  } catch (error) {
    console.error("Error retrieving similar documents:", error);
    throw new Error(`Failed to retrieve similar documents: ${(error as Error).message}`);
  }
};
