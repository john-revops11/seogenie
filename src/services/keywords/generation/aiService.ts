
import { AIProvider } from '@/types/aiModels';
import { generateParagraphContent } from './openAiService';
import { generateParagraphWithGemini } from './geminiService';

/**
 * Unified AI content generation service that selects the appropriate
 * service based on the provider
 */
export const generateWithAI = async (
  provider: AIProvider,
  model: string,
  prompt: string,
  creativity: number
): Promise<string> => {
  console.log(`Generating content with ${provider} model ${model}, creativity: ${creativity}`);
  
  try {
    switch (provider) {
      case 'openai':
        return await generateParagraphContent(prompt, creativity);
      case 'gemini':
        return await generateParagraphWithGemini(prompt, creativity);
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  } catch (error) {
    console.error(`AI generation error:`, error);
    throw error;
  }
};
