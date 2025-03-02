
import { OPENAI_API_KEY } from '../keywords/apiConfig';

// This would ideally come from environment variables
let PINECONE_API_KEY = '';
let PINECONE_INDEX = 'content-index';
const PINECONE_ENVIRONMENT = 'gcp-starter';

/**
 * Sets the Pinecone API configuration
 */
export const configurePinecone = (apiKey: string, index: string = PINECONE_INDEX) => {
  PINECONE_API_KEY = apiKey;
  PINECONE_INDEX = index;
  
  // Persist configuration in localStorage
  try {
    localStorage.setItem('PINECONE_API_KEY', apiKey);
    localStorage.setItem('PINECONE_INDEX', index);
    
    // Mark Pinecone as configured in the system health
    const apiEnabledStates = JSON.parse(localStorage.getItem('apiEnabledStates') || '{}');
    apiEnabledStates.pinecone = true;
    localStorage.setItem('apiEnabledStates', JSON.stringify(apiEnabledStates));
    
    // Clear any previous errors
    localStorage.removeItem('pineconeErrors');
    
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
      const savedApiKey = localStorage.getItem('PINECONE_API_KEY');
      const savedIndex = localStorage.getItem('PINECONE_INDEX');
      
      if (savedApiKey) {
        PINECONE_API_KEY = savedApiKey;
      }
      
      if (savedIndex) {
        PINECONE_INDEX = savedIndex;
      }
    } catch (error) {
      console.error("Error loading Pinecone config from localStorage:", error);
    }
  }
  
  return {
    apiKey: PINECONE_API_KEY ? PINECONE_API_KEY.substring(0, 5) + '...' : '',
    index: PINECONE_INDEX,
    environment: PINECONE_ENVIRONMENT
  };
};

/**
 * Checks if Pinecone is configured
 */
export const isPineconeConfigured = () => {
  // Check if we need to load from localStorage (on page refresh)
  if (PINECONE_API_KEY === '') {
    try {
      const savedApiKey = localStorage.getItem('PINECONE_API_KEY');
      const savedIndex = localStorage.getItem('PINECONE_INDEX');
      
      if (savedApiKey) {
        PINECONE_API_KEY = savedApiKey;
        console.log("Loaded Pinecone API key from localStorage");
      }
      
      if (savedIndex) {
        PINECONE_INDEX = savedIndex;
      }
    } catch (error) {
      console.error("Error loading Pinecone config from localStorage:", error);
    }
  }
  
  return PINECONE_API_KEY !== '';
};

/**
 * Test the Pinecone configuration with a simple API call
 */
export const testPineconeConnection = async (): Promise<boolean> => {
  if (!isPineconeConfigured()) {
    console.error("Cannot test Pinecone connection: Not configured");
    return false;
  }
  
  try {
    // Check if we can connect to the Pinecone index
    const response = await fetch(`https://${PINECONE_INDEX}-${PINECONE_ENVIRONMENT}.svc.${PINECONE_ENVIRONMENT}.pinecone.io/describe_index_stats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': PINECONE_API_KEY
      },
      body: JSON.stringify({})
    });
    
    if (response.ok) {
      localStorage.removeItem('pineconeErrors');
      return true;
    } else {
      const errorText = await response.text();
      console.error(`Pinecone API error: ${response.status} - ${errorText}`);
      localStorage.setItem('pineconeErrors', errorText);
      return false;
    }
  } catch (error) {
    console.error("Error testing Pinecone connection:", error);
    localStorage.setItem('pineconeErrors', (error as Error).message);
    return false;
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
    const response = await fetch(`https://${PINECONE_INDEX}-${PINECONE_ENVIRONMENT}.svc.${PINECONE_ENVIRONMENT}.pinecone.io/vectors/upsert`, {
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
    const response = await fetch(`https://${PINECONE_INDEX}-${PINECONE_ENVIRONMENT}.svc.${PINECONE_ENVIRONMENT}.pinecone.io/query`, {
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
