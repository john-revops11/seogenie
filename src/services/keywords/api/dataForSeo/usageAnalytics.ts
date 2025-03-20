
import { supabase } from "@/integrations/supabase/client";

// Get the estimated cost of DataForSEO API usage
export const getDataForSEOUsageCost = async (userId?: string): Promise<{ totalCost: number, requestCount: number } | null> => {
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id;
  }
  
  if (!userId) return null;
  
  try {
    const { data, error } = await supabase.rpc(
      'get_dataforseo_usage',
      { p_user_id: userId }
    );
    
    if (error || !data) {
      console.error('Error fetching API usage:', error);
      return { totalCost: 0, requestCount: 0 };
    }
    
    return {
      totalCost: data[0]?.total_cost || 0,
      requestCount: data[0]?.request_count || 0
    };
  } catch (e) {
    console.error("Error accessing API usage data:", e);
    return { totalCost: 0, requestCount: 0 };
  }
};
