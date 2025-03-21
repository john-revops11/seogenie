
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getDataForSeoCredentials } from "./auth";

/**
 * Tests if the DataForSEO API is working by making a simple request
 */
export async function testDataForSeoConnection(): Promise<boolean> {
  try {
    console.log("Testing DataForSEO connection...");
    
    // Get credentials to check if they're properly configured
    const { login, password } = getDataForSeoCredentials();
    
    if (!login || !password || login === "armin@revologyanalytics.com") {
      console.warn("Using default DataForSEO credentials. Consider setting your own in Settings.");
    }
    
    // Make a simple API call to test the connection
    const { data, error } = await supabase.functions.invoke('dataforseo', {
      body: {
        action: 'domain_overview',
        domain: 'example.com',
        location_code: 2840
      }
    });
    
    if (error) {
      console.error("DataForSEO connection test failed:", error);
      
      // Provide more specific error messages based on the error type
      let errorMessage = error.message || 'Unknown error';
      
      if (errorMessage.includes('429')) {
        errorMessage = 'Rate limit exceeded. Too many requests to DataForSEO API.';
      } else if (errorMessage.includes('401') || errorMessage.includes('403')) {
        errorMessage = 'Authentication failed. Check your DataForSEO API credentials in Settings.';
      } else if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
        errorMessage = 'Request timed out. The DataForSEO API may be experiencing delays.';
      } else if (errorMessage.includes('network')) {
        errorMessage = 'Network error. Check your internet connection.';
      }
      
      toast.error(`DataForSEO connection test failed: ${errorMessage}`);
      return false;
    }
    
    if (!data || !data.success) {
      console.error("DataForSEO API returned an error:", data?.error || "Unknown error");
      
      let errorMessage = data?.error || 'Unknown error';
      
      // Try to provide more specific error messages
      if (errorMessage.includes('credentials')) {
        errorMessage = 'Invalid API credentials. Check your settings.';
      }
      
      toast.error(`DataForSEO API error: ${errorMessage}`);
      return false;
    }
    
    if (!verifyDataForSeoResponse(data)) {
      console.warn("DataForSEO API returned fallback or sample data");
      toast.warning("Connected to DataForSEO, but receiving fallback data");
      return true; // Still consider it connected, but warn the user
    }
    
    console.log("DataForSEO connection test successful");
    toast.success("DataForSEO connection verified");
    return true;
  } catch (error) {
    console.error("Error testing DataForSEO connection:", error);
    toast.error(`Error testing DataForSEO connection: ${error instanceof Error ? error.message : "Unknown error"}`);
    return false;
  }
}

/**
 * Verify if we're getting real data from DataForSEO and not fallback data
 */
export function verifyDataForSeoResponse(data: any): boolean {
  // Check if this is likely to be sample/fallback data
  if (!data) return false;
  
  // Real DataForSEO responses often have these properties
  const hasRealDataProperties = 
    (data.tasks && Array.isArray(data.tasks)) ||
    (data.status_code && data.status_message) ||
    (data.results && Array.isArray(data.results) && data.results.length > 0 && 
     (data.results[0].rank_group !== undefined || 
      data.results[0].domain_rank !== undefined ||
      data.results[0].search_volume !== undefined));
  
  // Check if the data has real values instead of zeroes or placeholders
  const hasRealValues = 
    (data.results && Array.isArray(data.results) && data.results.length > 0 && 
     (data.results.some((r: any) => r.domain_rank > 0 || r.search_volume > 0))) ||
    (data.tasks && data.tasks[0] && data.tasks[0].result && 
     (data.tasks[0].result.some((r: any) => 
       r.domain_rank > 0 || 
       r.backlinks_count > 0 || 
       (r.items && r.items.length > 0)
     )));
  
  return hasRealDataProperties && hasRealValues;
}

/**
 * More comprehensive test for DataForSEO API that checks multiple endpoints
 */
export async function runComprehensiveDataForSeoTest(): Promise<{ 
  overall: boolean; 
  details: Record<string, boolean>;
  message?: string;
}> {
  const results: Record<string, boolean> = {};
  let message = "";
  
  try {
    console.log("Running comprehensive DataForSEO API test...");
    
    // Test domain overview endpoint
    const { data: overviewData, error: overviewError } = await supabase.functions.invoke('dataforseo', {
      body: {
        action: 'domain_overview',
        domain: 'amazon.com', // Use a well-known domain that should have data
        location_code: 2840
      }
    });
    
    results.overview = !overviewError && overviewData?.success;
    
    // Test keyword volume endpoint
    const { data: keywordData, error: keywordError } = await supabase.functions.invoke('dataforseokeywords', {
      body: {
        action: 'keyword_suggestions',
        keyword: 'seo tools',
        location_code: 2840,
        limit: 10
      }
    });
    
    results.keywords = !keywordError && keywordData?.success;
    
    // Check if we're using real data or fallback data
    const usingRealData = 
      (overviewData && verifyDataForSeoResponse(overviewData)) || 
      (keywordData && keywordData.results && keywordData.results.length > 0);
    
    results.usingRealData = usingRealData;
    
    const overallSuccess = Object.values(results).some(r => r === true);
    
    if (!overallSuccess) {
      message = "Failed to connect to DataForSEO API. Check your credentials in Settings.";
    } else if (!usingRealData) {
      message = "Connected to DataForSEO API, but receiving fallback data. Check your plan or account status.";
    } else {
      message = "Successfully connected to DataForSEO API and receiving real data.";
    }
    
    return {
      overall: overallSuccess,
      details: results,
      message
    };
  } catch (error) {
    console.error("Error in comprehensive DataForSEO test:", error);
    return {
      overall: false,
      details: results,
      message: `Test failed: ${error instanceof Error ? error.message : "Unknown error"}`
    };
  }
}
