
/**
 * Pinecone connection utilities
 */
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
        'Api-Key': getPineconeApiKey(),
        // Add additional headers to help with CORS
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Api-Key'
      },
      mode: 'cors', // Explicitly set CORS mode
      body: JSON.stringify({})
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log("Pinecone connection successful:", data);
      localStorage.removeItem(STORAGE_KEYS.ERRORS);
      return true;
    } else {
      const errorText = await response.text();
      console.error(`Pinecone API error: ${response.status} - ${errorText}`);
      localStorage.setItem(STORAGE_KEYS.ERRORS, `Status ${response.status}: ${errorText}`);
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
