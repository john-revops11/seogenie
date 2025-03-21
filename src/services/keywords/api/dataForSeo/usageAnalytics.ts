
import { supabase } from "@/integrations/supabase/client";
import { tableExists } from './base/apiClient';

// Get the estimated cost of DataForSEO API usage
export const getDataForSEOUsageCost = async (userId?: string): Promise<{ totalCost: number, requestCount: number } | null> => {
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id;
  }
  
  if (!userId) return null;
  
  // Check if the api_usage table exists
  const apiUsageTableExists = await tableExists('api_usage');
  if (!apiUsageTableExists) {
    return { totalCost: 0, requestCount: 0 };
  }
  
  try {
    const { data, error } = await supabase.rpc(
      'get_dataforseo_usage',
      { p_user_id: userId }
    );
    
    if (error || !data) {
      console.error('Error fetching API usage:', error);
      return null;
    }
    
    return {
      totalCost: data.total_cost || 0,
      requestCount: data.request_count || 0
    };
  } catch (e) {
    console.error("Error accessing API usage data:", e);
    return { totalCost: 0, requestCount: 0 };
  }
};
