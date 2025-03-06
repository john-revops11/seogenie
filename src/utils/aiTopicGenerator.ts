
import { AIProvider } from "@/types/aiModels";
import { getApiKey } from "@/services/keywords/apiConfig";
import { generateWithAI } from "@/services/keywords/generation/aiService";

/**
 * Generates topic suggestions using AI (OpenAI or Gemini)
 */
export const generateAITopics = async (
  provider: AIProvider,
  domain: string,
  keywords: string[],
  contentType: string
): Promise<string[]> => {
  console.log(`Generating topics with ${provider} using keywords:`, keywords);
  
  // Check if API key is available
  const apiKey = getApiKey(provider);
  if (!apiKey) {
    throw new Error(`No API key configured for ${provider}`);
  }
  
  // Create the prompt for AI model
  const prompt = createTopicGenerationPrompt(domain, keywords, contentType);
  
  // Use the appropriate model based on provider
  const model = provider === 'openai' ? 'gpt-4o-mini' : 'gemini-pro';
  
  // Generate topics using the AI service
  try {
    const response = await generateWithAI(provider, model, prompt, 60);
    return parseTopicsFromResponse(response);
  } catch (error) {
    console.error(`Error generating topics with ${provider}:`, error);
    throw new Error(`Failed to generate topics with ${provider}: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Creates a detailed prompt for AI topic generation
 */
const createTopicGenerationPrompt = (
  domain: string,
  keywords: string[],
  contentType: string
): string => {
  const currentYear = new Date().getFullYear();
  
  return `Generate 8 SEO-optimized content topics for a ${contentType} that would rank well for the following keywords: ${keywords.join(", ")}.
  ${domain ? `The website domain is: ${domain}.` : ''}
  
  Guidelines for topic generation:
  1. Topics should be specific and actionable
  2. Include some topics with the current year (${currentYear}) for freshness
  3. Mix informational, transactional, and investigational search intent
  4. Some topics should naturally incorporate multiple keywords
  5. Include "how-to" and list-based topics (e.g., "10 Ways to...")
  6. Focus on topics with good search potential and relevance to the domain
  
  Format your response as a simple list with ONE TOPIC PER LINE, nothing else.
  Do not include numbers, bullets, or any formatting - just the plain text topics.`;
};

/**
 * Parses topics from AI response text
 */
const parseTopicsFromResponse = (response: string): string[] => {
  return response
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => line.replace(/^\d+\.\s*/, '')) // Remove leading numbers like "1. "
    .map(line => line.replace(/^[-•*]\s*/, '')) // Remove leading bullets like "- " or "• "
    .slice(0, 8); // Ensure we have at most 8 topics
};
