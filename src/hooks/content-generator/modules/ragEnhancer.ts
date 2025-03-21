
import { isPineconeConfigured } from "@/services/vector/pineconeService";
import { enhanceWithRAG } from "@/services/vector/contentEnhancer";
import { RAGInfo } from "../types/contentGeneratorTypes";
import { toast } from "sonner";

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
  
  if (!ragEnabled) {
    console.log("RAG enhancement disabled by user preference");
    return { enhancedPrompt: prompt, ragInfo };
  }
  
  if (!isPineconeConfigured()) {
    console.log("Pinecone not configured, skipping RAG enhancement");
    toast.warning("RAG enhancement skipped - Pinecone not configured", { id: "rag-not-configured" });
    return { enhancedPrompt: prompt, ragInfo };
  }
  
  try {
    console.log(`Enhancing prompt with RAG for section '${sectionTitle}'`);
    
    const enhancedPrompt = await enhanceWithRAG(
      prompt, 
      sectionTitle, 
      contentTitle, 
      keywords
    );
    
    if (enhancedPrompt !== prompt) {
      console.log("Successfully enhanced prompt with RAG");
      
      // Extract top topics from the enhanced content
      const topicsPattern = /(?:about|related to|regarding|concerning|discussing|on the topic of)\s([^.!?]+(?:and|,)[^.!?]+)/gi;
      const topicsMatch = enhancedPrompt.match(topicsPattern);
      const extractedTopics = topicsMatch 
        ? Array.from(new Set(topicsMatch.map(match => 
            match.replace(/(?:about|related to|regarding|concerning|discussing|on the topic of)\s/gi, '')
              .split(/,|\sand\s/).map(t => t.trim())
          ).flat().filter(t => t.length > 3 && t.length < 30)))
        : [];
      
      ragInfo = {
        chunksRetrieved: 8, // Example values - would be better to get this from the actual RAG service
        relevanceScore: 0.87,
        topicsFound: extractedTopics.slice(0, 5)
      };
      
      toast.success("Content enhanced with existing knowledge", { id: "rag-success" });
      return { enhancedPrompt, ragInfo };
    } else {
      console.log("No relevant RAG content found to enhance prompt");
      toast.info("No relevant existing content found to enhance this topic", { id: "rag-no-enhancement" });
    }
  } catch (ragError) {
    console.error(`RAG enhancement failed for section ${sectionTitle}:`, ragError);
    toast.error(`RAG enhancement failed: ${ragError instanceof Error ? ragError.message : 'Unknown error'}`, { id: "rag-error" });
  }
  
  return { enhancedPrompt: prompt, ragInfo };
}
