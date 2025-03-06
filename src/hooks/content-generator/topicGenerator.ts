
import { AIProvider } from "@/types/aiModels";
import { toast } from "sonner";
import { generateAITopics } from "@/utils/aiTopicGenerator";
import { generateTopicSuggestions } from "@/utils/topicGenerator";
import { generateTitleSuggestions } from "@/services/keywords/generation/titleGenerator";
import { useAIWithFallback, generateTitlesWithAI } from "./aiModels";

/**
 * Generates topics and titles based on keywords
 */
export const generateTopicsAndTitles = async (
  domain: string,
  keywords: string[],
  contentType: string
): Promise<{
  topics: string[];
  titleSuggestions: { [topic: string]: string[] };
}> => {
  if (keywords.length === 0) {
    throw new Error("Please select at least one keyword");
  }
  
  // Try to generate topics with AI first
  try {
    // Generate topics with AI, with fallback mechanisms
    const topics = await useAIWithFallback('openai', 'topics generation', 
      async (provider: AIProvider) => {
        const generatedTopics = await generateAITopics(provider, domain, keywords, contentType);
        toast.success(`Generated topics using ${provider === 'openai' ? 'OpenAI' : 'Gemini AI'}`);
        return generatedTopics;
      }
    ).catch(async (error) => {
      // Fallback to rule-based generation if all AI attempts fail
      console.error("All AI topic generation attempts failed, falling back to rule-based", error);
      const fallbackTopics = await generateTopicSuggestions(domain, [], null, keywords);
      toast.info("Using rule-based topic generation (fallback)");
      return fallbackTopics;
    });
    
    // Generate title suggestions for each topic
    const suggestions: { [topic: string]: string[] } = {};
    for (const topic of topics) {
      try {
        // Try to generate titles with AI
        suggestions[topic] = await useAIWithFallback('openai', 'title generation', 
          async (provider: AIProvider) => {
            return await generateTitlesWithAI(provider, topic, keywords, contentType);
          }
        ).catch(() => {
          // Fallback to rule-based title generation
          return generateTitleSuggestions(topic, keywords, contentType);
        });
      } catch (titleError) {
        console.error(`Failed to generate titles for topic "${topic}":`, titleError);
        // Fallback to rule-based title generation
        suggestions[topic] = generateTitleSuggestions(topic, keywords, contentType);
      }
    }
    
    return { topics, titleSuggestions: suggestions };
  } catch (error) {
    console.error("Error generating topics:", error);
    toast.error("Failed to generate topics");
    throw error;
  }
};
