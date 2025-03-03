
import { OPENAI_API_KEY, GEMINI_API_KEY } from "@/services/keywords/apiConfig";

/**
 * Check which AI models are available based on API key configuration
 */
export const getAvailableAiModels = () => {
  const models = {
    openai: OPENAI_API_KEY && OPENAI_API_KEY.length > 0,
    gemini: GEMINI_API_KEY && GEMINI_API_KEY.length > 0
  };
  
  return models;
};

/**
 * Get the default AI model based on available keys
 */
export const getDefaultAiModel = (): 'openai' | 'gemini' => {
  const models = getAvailableAiModels();
  
  // Check if there's a saved preference in localStorage
  const savedPreference = localStorage.getItem('selectedAiProvider') as 'openai' | 'gemini' | null;
  if (savedPreference && models[savedPreference]) {
    return savedPreference;
  }
  
  // If Gemini is available and OpenAI is not, use Gemini
  if (models.gemini && !models.openai) {
    return 'gemini';
  }
  
  // Default to OpenAI
  return 'openai';
};

/**
 * Update the system health status with AI model availability
 */
export const updateAiModelStatus = () => {
  const models = getAvailableAiModels();
  
  const apiEnabledStates = JSON.parse(localStorage.getItem('apiEnabledStates') || '{}');
  
  if (models.openai) {
    apiEnabledStates.openai = true;
  }
  
  if (models.gemini) {
    apiEnabledStates.gemini = true;
  }
  
  localStorage.setItem('apiEnabledStates', JSON.stringify(apiEnabledStates));
  
  return models;
};
