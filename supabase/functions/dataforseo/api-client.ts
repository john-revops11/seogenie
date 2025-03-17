
import { AUTH_HEADER } from "./config.ts";

// Helper function to make DataForSEO API requests using fetch
export async function makeDataForSEORequest(
  endpoint: string, 
  method: string, 
  data: any = null,
  timeoutMs: number = 30000 // Default 30 second timeout
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
      console.warn(`Request to ${endpoint} timed out after ${timeoutMs}ms`);
      controller.abort();
    }, timeoutMs);
    
    options.signal = controller.signal;
    
    const response = await fetch(url, options);
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`DataForSEO API request failed with status ${response.status}: ${errorText}`);
      
      // Enhanced error message with more details
      const errorMessage = `DataForSEO API request failed (${response.status} ${response.statusText})`;
      const errorDetails = {
        status: response.status,
        statusText: response.statusText,
        url: endpoint,
        method,
        responseText: errorText.substring(0, 200),
      };
      
      // Check for specific status codes to provide better error messages
      if (response.status === 404) {
        throw new Error(JSON.stringify({
          message: `DataForSEO API endpoint not found or no data available for this domain. Domain may not have enough data for analysis.`,
          details: {
            ...errorDetails,
            recommendation: "Try using a more established domain or check if you're using the correct endpoint."
          }
        }));
      }
      
      if (response.status === 401 || response.status === 403) {
        throw new Error(JSON.stringify({
          message: `DataForSEO API authentication failed. Please check your API credentials.`,
          details: {
            ...errorDetails,
            recommendation: "Verify your DataForSEO API credentials in the settings."
          }
        }));
      }
      
      if (response.status === 429) {
        throw new Error(JSON.stringify({
          message: `DataForSEO rate limit exceeded. Too many requests at once.`,
          details: {
            ...errorDetails,
            recommendation: "Wait a few moments and try again, or reduce the number of concurrent requests."
          }
        }));
      }
      
      throw new Error(JSON.stringify({
        message: errorMessage,
        details: errorDetails
      }));
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
        console.error(`API returned error code ${json.status_code}: ${json.status_message || 'Unknown error'}`);
        throw new Error(JSON.stringify({
          message: `DataForSEO API error: ${json.status_message || 'Unknown error'}`,
          details: {
            statusCode: json.status_code,
            statusMessage: json.status_message,
          }
        }));
      }
      
      return json;
    } catch (parseError) {
      console.error(`Failed to parse DataForSEO response: ${text.substring(0, 100)}...`);
      throw new Error(`Failed to parse API response: ${parseError.message}`);
    }
  } catch (error) {
    console.error(`Error making DataForSEO request to ${endpoint}:`, error);
    
    // Check if this is an abort/timeout error
    if (error.name === 'AbortError') {
      throw new Error(`Request to DataForSEO API timed out after ${timeoutMs}ms. The service may be experiencing delays.`);
    }
    
    throw error;
  }
}
