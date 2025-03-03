
/**
 * Pinecone connection utilities
 */
import { getPineconeApiKey, getPineconeApiUrl, isPineconeConfigured, STORAGE_KEYS } from './config';

/**
 * Test the Pinecone configuration with a simple API call
 */
export const testPineconeConnection = async (namespace: string = ''): Promise<boolean> => {
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
      body: JSON.stringify({
        filter: {},
        ...(namespace ? { namespace } : {})
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log("Pinecone connection successful:", data);
      localStorage.removeItem(STORAGE_KEYS.ERRORS);
      
      // Check if index actually exists and has vectors
      if (data.totalVectorCount === 0) {
        console.warn("Pinecone index exists but is empty. No vectors have been uploaded yet.");
      }
      
      if (namespace && data.namespaces && !data.namespaces[namespace]) {
        console.warn(`Namespace '${namespace}' doesn't exist in the index yet.`);
      }
      
      return true;
    } else {
      const errorText = await response.text();
      console.error(`Pinecone API error: ${response.status} - ${errorText}`);
      localStorage.setItem(STORAGE_KEYS.ERRORS, `Status ${response.status}: ${errorText}`);
      
      // Provide more helpful error messages for common errors
      if (response.status === 401 || response.status === 403) {
        localStorage.setItem(STORAGE_KEYS.ERRORS, 
          "Authentication error: Your Pinecone API key appears to be invalid or doesn't have permission to access this index."
        );
      } else if (response.status === 404) {
        localStorage.setItem(STORAGE_KEYS.ERRORS, 
          "Not found error: The specified Pinecone index doesn't exist or the endpoint URL is incorrect."
        );
      }
      
      return false;
    }
  } catch (error) {
    console.error("Error testing Pinecone connection:", error);
    // Store more detailed error information
    const errorMessage = error instanceof Error ? error.message : String(error);
    localStorage.setItem(STORAGE_KEYS.ERRORS, errorMessage);
    
    // If it's a CORS issue, provide more helpful information
    if (errorMessage.includes('Failed to fetch')) {
      localStorage.setItem(STORAGE_KEYS.ERRORS, 
        "CORS error: The browser couldn't access the Pinecone API. This is likely due to " +
        "cross-origin restrictions. Consider using a proxy server or adjusting Pinecone CORS settings."
      );
    }
    
    return false;
  }
};

// Export Pinecone configuration check function for other modules to use
export { isPineconeConfigured } from './config';

// Export test connection function for use in other modules
export const connectionUtils = {
  testPineconeConnection
};
