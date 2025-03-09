
import { isPineconeConfigured, retrieveSimilarDocuments } from './pineconeService';

/**
 * Simple function to enhance content with RAG
 * Provides information from the knowledge base without enforcing a specific response structure
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
    
    // Retrieve documents from Pinecone (or any vector database)
    const relevantDocs = await retrieveSimilarDocuments(combinedQuery, 10);
    
    if (relevantDocs.length === 0) {
      console.log("No relevant documents found for RAG enhancement");
      return prompt;
    }
    
    // Extract context from the retrieved documents
    const context = relevantDocs
      .map(doc => doc.metadata.text || "")
      .join("\n\n");
    
    // Enhanced prompt with the retrieved context, but without the structured framework
    const enhancedPrompt = `
      ${prompt}
      
      REFERENCE MATERIAL:
      ${context}
      
      IMPORTANT:
      - Use the reference material to help provide accurate information when responding
      - Respond naturally and conversationally as a pricing and revenue consultant
      - You don't need to follow any specific structure in your responses
      - Focus on providing helpful insights and answering the user's questions directly
      - Use your knowledge about pricing strategies and revenue optimization, supplemented by the reference material
    `;
    
    return enhancedPrompt;
  } catch (error) {
    console.error("Error enhancing with RAG:", error);
    return prompt; // Return the original prompt if RAG enhancement fails
  }
};
