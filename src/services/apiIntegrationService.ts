
import { supabase } from "@/integrations/supabase/client";

type ApiIntegrationType = 'openai' | 'dataforseo' | 'semrush' | 'ahrefs';

// In-memory cache for API keys
const apiKeysCache: Record<string, { key: string, expiresAt: number }> = {};

/**
 * Get an API key from the cache or Supabase
 */
export const getApiKey = async (type: ApiIntegrationType): Promise<string | null> => {
  // First check the cache
  const cachedItem = apiKeysCache[type];
  if (cachedItem && Date.now() < cachedItem.expiresAt) {
    return cachedItem.key;
  }
  
  try {
    // Check if user is authenticated
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      console.warn(`Cannot get API key for ${type}: User not authenticated`);
      return null;
    }
    
    // Fetch the API key from Supabase
    const { data, error } = await supabase
      .from('api_integrations')
      .select('api_key')
      .eq('user_id', userData.user.id)
      .eq('api_type', type)
      .single();
    
    if (error) {
      if (error.code !== 'PGRST116') { // Record not found error
        console.error(`Error fetching ${type} API key:`, error);
      }
      return null;
    }
    
    if (!data?.api_key) {
      return null;
    }
    
    // Cache the API key for 5 minutes
    apiKeysCache[type] = {
      key: data.api_key,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
    };
    
    return data.api_key;
  } catch (error) {
    console.error(`Error getting ${type} API key:`, error);
    return null;
  }
};

/**
 * Save an API integration key to Supabase
 */
export const saveApiKey = async (type: ApiIntegrationType, key: string): Promise<boolean> => {
  try {
    // Check if user is authenticated
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      console.warn(`Cannot save API key for ${type}: User not authenticated`);
      return false;
    }
    
    // Check if an entry already exists
    const { data: existingData, error: existingError } = await supabase
      .from('api_integrations')
      .select('id')
      .eq('user_id', userData.user.id)
      .eq('api_type', type)
      .single();
    
    if (existingError && existingError.code !== 'PGRST116') { // Record not found error is OK
      console.error(`Error checking existing ${type} API key:`, existingError);
      return false;
    }
    
    let result;
    
    if (existingData?.id) {
      // Update existing entry
      result = await supabase
        .from('api_integrations')
        .update({ api_key: key, updated_at: new Date().toISOString() })
        .eq('id', existingData.id);
    } else {
      // Insert new entry
      result = await supabase
        .from('api_integrations')
        .insert({
          user_id: userData.user.id,
          api_type: type,
          api_key: key,
        });
    }
    
    if (result.error) {
      console.error(`Error saving ${type} API key:`, result.error);
      return false;
    }
    
    // Update the cache
    apiKeysCache[type] = {
      key,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
    };
    
    return true;
  } catch (error) {
    console.error(`Error saving ${type} API key:`, error);
    return false;
  }
};

/**
 * Check if an API key is configured
 */
export const isApiConfigured = async (type: ApiIntegrationType): Promise<boolean> => {
  const key = await getApiKey(type);
  return !!key;
};

/**
 * Remove an API key from Supabase
 */
export const removeApiKey = async (type: ApiIntegrationType): Promise<boolean> => {
  try {
    // Check if user is authenticated
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      console.warn(`Cannot remove API key for ${type}: User not authenticated`);
      return false;
    }
    
    // Delete the entry
    const { error } = await supabase
      .from('api_integrations')
      .delete()
      .eq('user_id', userData.user.id)
      .eq('api_type', type);
    
    if (error) {
      console.error(`Error removing ${type} API key:`, error);
      return false;
    }
    
    // Remove from cache
    delete apiKeysCache[type];
    
    return true;
  } catch (error) {
    console.error(`Error removing ${type} API key:`, error);
    return false;
  }
};
