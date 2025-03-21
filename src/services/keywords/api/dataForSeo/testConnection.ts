
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Tests if the DataForSEO API is working by making a simple request
 */
export async function testDataForSeoConnection(): Promise<boolean> {
  try {
    console.log("Testing DataForSEO connection...");
    
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
      toast.error(`DataForSEO connection test failed: ${error.message}`);
      return false;
    }
    
    if (!data || !data.success) {
      console.error("DataForSEO API returned an error:", data?.error || "Unknown error");
      toast.error(`DataForSEO API returned an error: ${data?.error || "Unknown error"}`);
      return false;
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
  
  return hasRealDataProperties;
}
