
import { isPineconeConfigured, retrieveSimilarDocuments, testPineconeConnection } from './pineconeService';
import { toast } from 'sonner';

/**
 * Enhances content with Retrieval Augmented Generation (RAG)
 * Provides information from the knowledge base to improve content quality
 */
export const enhanceWithRAG = async (
  prompt: string,
  heading: string,
  title: string, 
  keywords: string[]
): Promise<string> => {
  const combinedQuery = `${title} ${heading} ${keywords.join(' ')}`;
  
  try {
    // Check if Pinecone is configured
    if (!isPineconeConfigured()) {
      console.log("Pinecone not configured for RAG enhancement");
      // Return original prompt to allow fallback to standard generation
      return prompt;
    }
    
    // Test Pinecone connection
    const testResult = await testPineconeConnection();
    if (!testResult.success) {
      console.error("Pinecone connection test failed:", testResult.message);
      return prompt;
    }
    
    // Retrieve documents from Pinecone vector database
    const relevantDocs = await retrieveSimilarDocuments(combinedQuery, 5);
    
    if (relevantDocs.length === 0) {
      console.log("No relevant documents found for RAG enhancement");
      return prompt;
    }
    
    // Extract context from the retrieved documents
    const context = relevantDocs
      .map(doc => doc.metadata.text || "")
      .join("\n\n");
    
    // Calculate average relevance score
    const avgScore = relevantDocs.reduce((sum, doc) => sum + doc.score, 0) / relevantDocs.length;
    
    // Extract topics from metadata if available
    const topics = Array.from(new Set(
      relevantDocs
        .filter(doc => doc.metadata.topics && Array.isArray(doc.metadata.topics))
        .flatMap(doc => doc.metadata.topics)
    ));
    
    // Log RAG info for monitoring
    console.info("RAG enhancement info:", {
      chunksRetrieved: relevantDocs.length,
      avgScore,
      topics
    });
    
    // Enhanced prompt with the retrieved context
    const enhancedPrompt = `
${prompt}

REFERENCE CONTEXT FROM KNOWLEDGE BASE:
${context}

INSTRUCTIONS FOR USING REFERENCE CONTEXT:
1. Use the reference context to enhance factual accuracy and domain knowledge
2. Incorporate relevant information, statistics, and examples from the context
3. Maintain the professional tone and structure requested in the original prompt
4. Only use information from the context that is relevant to the topic
5. Do not directly quote large sections from the context - synthesize and integrate naturally
6. If the context contains contradictory information, use the most recent or authoritative source
`;
    
    console.log(`RAG enhancement: Retrieved ${relevantDocs.length} documents with avg score ${avgScore.toFixed(3)}`);
    
    return enhancedPrompt;
  } catch (error) {
    console.error("Error enhancing with RAG:", error);
    toast.error(`RAG enhancement failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    return prompt;
  }
};

/**
 * Creates a comprehensive context from retrieved documents
 */
export const createComprehensiveContext = (documents: Array<{
  id: string;
  score: number;
  metadata: Record<string, any>;
}>): string => {
  if (!documents || documents.length === 0) {
    return "";
  }

  // Sort documents by relevance score (highest first)
  const sortedDocs = [...documents].sort((a, b) => b.score - a.score);
  
  // Extract and format the context
  const contextParts = sortedDocs.map((doc, index) => {
    const text = doc.metadata.text || "";
    const source = doc.metadata.source || "Unknown source";
    const score = doc.score.toFixed(3);
    
    return `Document ${index + 1} [relevance: ${score}] from ${source}:\n${text}`;
  });

  return contextParts.join("\n\n");
};
