
import { AUTH_HEADER } from "./config.ts";

// Helper function to make DataForSEO API requests using fetch
export async function makeDataForSEORequest(endpoint: string, method: string, data: any = null) {
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
    
    const response = await fetch(url, options);
    
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
          message: `DataForSEO API endpoint not found or no data available for this domain. This often happens with less established domains or incorrect formats.`,
          details: {
            ...errorDetails,
            recommendation: "Try using a more established domain or check if you're using the correct endpoint."
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
    throw error;
  }
}
