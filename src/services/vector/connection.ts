
import { getPineconeApiKey, getPineconeApiUrl, isPineconeConfigured, STORAGE_KEYS } from './config';

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
    const response = await fetch(getPineconeApiUrl('describe_index_stats'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': getPineconeApiKey()
      },
      body: JSON.stringify({})
    });
    
    if (response.ok) {
      localStorage.removeItem(STORAGE_KEYS.ERRORS);
      return true;
    } else {
      const errorText = await response.text();
      console.error(`Pinecone API error: ${response.status} - ${errorText}`);
      localStorage.setItem(STORAGE_KEYS.ERRORS, errorText);
      return false;
    }
  } catch (error) {
    console.error("Error testing Pinecone connection:", error);
    localStorage.setItem(STORAGE_KEYS.ERRORS, (error as Error).message);
    return false;
  }
};

// Export Pinecone configuration check function for other modules to use
export { isPineconeConfigured } from './config';
