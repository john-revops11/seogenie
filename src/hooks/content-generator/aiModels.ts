
import { AIProvider } from "@/types/aiModels";
import { generateWithAI } from "@/services/keywords/generation/aiService";
import { getApiKey } from "@/services/keywords/apiConfig";
import { toast } from "sonner";

/**
 * Generates titles with AI
 */
export const generateTitlesWithAI = async (
  provider: AIProvider,
  topic: string,
  keywords: string[],
  contentType: string
): Promise<string[]> => {
  const currentYear = new Date().getFullYear();
  const prompt = `Generate 5 SEO-optimized title suggestions for a ${contentType} about "${topic}" that incorporates these keywords: ${keywords.join(", ")}. 
  Format the output as a simple list of titles, one per line. Include the current year (${currentYear}) where appropriate.`;
  
  // Use the most efficient model for title generation
  const model = provider === 'openai' ? 'gpt-4o-mini' : 'gemini-1.5-flash';
  const titlesText = await generateWithAI(provider, model, prompt, 50);
  
  // Parse the response into individual titles
  return titlesText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => line.replace(/^\d+\.\s*/, '')) // Remove leading numbers like "1. "
    .slice(0, 5); // Ensure we have at most 5 titles
};

/**
 * Checks if the AI provider API key is configured
 */
export const isAIProviderConfigured = (provider: AIProvider): boolean => {
  const apiKey = getApiKey(provider);
  return !!apiKey;
};

/**
 * Attempts to use the preferred AI provider, with fallback logic
 */
export const useAIWithFallback = async (
  primaryProvider: AIProvider,
  action: string,
  callback: (provider: AIProvider) => Promise<any>
): Promise<any> => {
  // Try primary provider first
  const primaryKey = getApiKey(primaryProvider);
  
  if (primaryKey) {
    try {
      return await callback(primaryProvider);
    } catch (primaryError) {
      console.error(`${primaryProvider} ${action} failed:`, primaryError);
      
      // Fallback to the other provider
      const fallbackProvider: AIProvider = primaryProvider === 'openai' ? 'gemini' : 'openai';
      const fallbackKey = getApiKey(fallbackProvider);
      
      if (fallbackKey) {
        try {
          toast.info(`Using ${fallbackProvider} as fallback`);
          return await callback(fallbackProvider);
        } catch (fallbackError) {
          console.error(`${fallbackProvider} ${action} failed:`, fallbackError);
          throw new Error(`Both AI providers failed for ${action}`);
        }
      } else {
        throw new Error(`${primaryProvider} failed and no ${fallbackProvider} key is configured`);
      }
    }
  } else {
    // Primary provider not configured, try alternate provider
    const alternateProvider: AIProvider = primaryProvider === 'openai' ? 'gemini' : 'openai';
    const alternateKey = getApiKey(alternateProvider);
    
    if (alternateKey) {
      try {
        return await callback(alternateProvider);
      } catch (error) {
        console.error(`${alternateProvider} ${action} failed:`, error);
        throw error;
      }
    } else {
      throw new Error(`No AI provider keys configured`);
    }
  }
};
