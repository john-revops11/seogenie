
import { OPENAI_API_KEY } from "@/services/keywords/apiConfig";

// Validate OpenAI key format (basic check)
export const validateOpenAIKey = (key: string): boolean => {
  if (!key) return false;
  
  // Check for standard OpenAI key format (sk-...)
  if (!key.startsWith('sk-')) return false;
  
  // Check for minimum length
  return key.length >= 40;
};

// Check if OpenAI is configured
export const isOpenAIConfigured = (): boolean => {
  return validateOpenAIKey(OPENAI_API_KEY);
};

// Get the appropriate AI model based on availability and user preference
export const getAIModel = (userPreference: string = 'gpt-4') => {
  // If OpenAI is configured, use requested model or default to GPT-4
  if (isOpenAIConfigured()) {
    return userPreference;
  }
  
  // No AI service is properly configured
  return null;
};

// Helper to determine if AI services are available
export const isAIAvailable = (): boolean => {
  return isOpenAIConfigured();
};
