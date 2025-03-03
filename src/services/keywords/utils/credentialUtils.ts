
/**
 * Utilities for credential validation
 */

import { DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD, OPENAI_API_KEY } from '../apiConfig';

// Validate DataForSEO credentials to ensure they're properly formatted
export function validateDataForSEOCredentials(): boolean {
  if (!DATAFORSEO_LOGIN || typeof DATAFORSEO_LOGIN !== 'string' || DATAFORSEO_LOGIN.trim() === '') {
    console.error("DataForSEO login is missing or invalid");
    return false;
  }
  
  if (!DATAFORSEO_PASSWORD || typeof DATAFORSEO_PASSWORD !== 'string' || DATAFORSEO_PASSWORD.trim() === '') {
    console.error("DataForSEO password is missing or invalid");
    return false;
  }
  
  return true;
}

// Validate OpenAI API key to ensure it's properly formatted
export function validateOpenAIKey(): boolean {
  if (!OPENAI_API_KEY || typeof OPENAI_API_KEY !== 'string' || OPENAI_API_KEY.trim() === "") {
    console.error("OPENAI_API_KEY is not set or invalid");
    return false;
  }
  
  // Basic format validation for OpenAI API keys
  const openAIKeyPattern = /^sk-[a-zA-Z0-9]{48,}$/;
  if (!openAIKeyPattern.test(OPENAI_API_KEY.trim())) {
    console.error("OPENAI_API_KEY format appears invalid");
    return false;
  }
  
  return true;
}

// Helper function to convert difficulty number to competition label
export function getCompetitionLabel(difficulty: number): string {
  if (difficulty < 30) return "low";
  if (difficulty < 60) return "medium";
  return "high";
}
