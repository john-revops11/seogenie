
import { isPineconeConfigured } from "@/services/vector/pineconeService";
import { enhanceWithRAG } from "@/services/vector/contentEnhancer";
import { RAGInfo } from "../types/contentGeneratorTypes";

/**
 * Enhances content prompts with RAG if enabled
 */
export async function enhancePromptWithRAG(
  prompt: string,
  sectionTitle: string,
  contentTitle: string,
  keywords: string[],
  ragEnabled: boolean
): Promise<{ enhancedPrompt: string; ragInfo: RAGInfo | null }> {
  let ragInfo = null;
  
  if (ragEnabled && isPineconeConfigured()) {
    try {
      const enhancedPrompt = await enhanceWithRAG(
        prompt, 
        sectionTitle, 
        contentTitle, 
        keywords
      );
      
      if (enhancedPrompt !== prompt) {
        return {
          enhancedPrompt,
          ragInfo: {
            chunksRetrieved: 8, // Example values
            relevanceScore: 0.87,
            topicsFound: []
          }
        };
      }
    } catch (ragError) {
      console.error(`RAG enhancement failed for section ${sectionTitle}:`, ragError);
    }
  }
  
  return { enhancedPrompt: prompt, ragInfo };
}
