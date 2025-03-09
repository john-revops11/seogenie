
import { getPineconeHostUrl, getPineconeApiKey, isPineconeConfigured } from './pineconeConfig';

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
        'Api-Key': getPineconeApiKey()
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
