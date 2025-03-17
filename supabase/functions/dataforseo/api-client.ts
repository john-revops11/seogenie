
import { AUTH_HEADER } from "./config.ts";

// Helper function to make DataForSEO API requests using fetch
export async function makeDataForSEORequest(
  endpoint: string, 
  method: string, 
  data: any = null,
  timeoutMs: number = 60000 // Default timeout to 60 seconds
) {
  const url = `https://api.dataforseo.com${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers: {
      'Authorization': `Basic ${AUTH_HEADER}`,
      'Content-Type': 'application/json',
    },
  };
  
  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }
  
  try {
    console.log(`Making DataForSEO request to ${url}`);
    if (data) {
      console.log(`Request data: ${JSON.stringify(data).substring(0, 500)}...`);
    }
    
    // Add timeout to fetch to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.warn(`Request to ${endpoint} timed out after ${timeoutMs/1000} seconds`);
      controller.abort();
    }, timeoutMs);
    
    options.signal = controller.signal;
    
    try {
      const response = await fetch(url, options);
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`DataForSEO API request failed with status ${response.status}: ${errorText}`);
        
        // Handle specific error codes
        if (response.status === 404) {
          console.warn("Resource not found (404). This might be normal for some endpoints like backlinks for new domains.");
          // Special handling for backlinks endpoint which might return 404 for new domains
          if (endpoint.includes('backlinks')) {
            return {
              status_code: 20000,
              status_message: "No data found for this domain",
              tasks: [{
                result: []
              }]
            };
          }
        }
        
        // Enhanced error message with more details
        const errorMessage = `DataForSEO API request failed (${response.status} ${response.statusText})`;
        throw new Error(errorMessage);
      }
      
      // Try to parse JSON response, handle empty or malformed responses
      const text = await response.text();
      
      if (!text || text.trim() === '') {
        console.error('DataForSEO returned empty response');
        throw new Error('API returned empty response');
      }
      
      try {
        const json = JSON.parse(text);
        console.log(`DataForSEO response status code: ${json.status_code}`);
        
        if (json.status_code !== 20000) {
          // If API returned an error response
          console.error(`API returned error code ${json.status_code}: ${json.status_message || 'Unknown error'}`);
          
          // Create structured response - we'll handle this on the client
          return {
            status_code: json.status_code,
            status_message: json.status_message,
            error: true,
            message: json.status_message || 'API error'
          };
        }
        
        return json;
      } catch (parseError) {
        console.error(`Failed to parse DataForSEO response: ${text.substring(0, 100)}...`);
        throw new Error(`Failed to parse API response: ${parseError.message}`);
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    console.error(`Error making DataForSEO request to ${endpoint}:`, error);
    
    // Check if this is an abort/timeout error
    if (error.name === 'AbortError') {
      throw new Error(`Request to DataForSEO API timed out after ${timeoutMs/1000} seconds. The service may be experiencing delays.`);
    }
    
    throw error;
  }
}
