
import { retrieveSimilarDocuments, createEmbedding } from './pineconeService';
import { toast } from 'sonner';

/**
 * Enhances a content prompt with retrieved context using RAG
 */
export const enhanceWithRAG = async (
  prompt: string,
  sectionTitle: string,
  contentTitle: string,
  keywords: string[]
): Promise<string> => {
  try {
    // Create a query combining the section title, content title, and keywords
    const queryText = `${sectionTitle} ${contentTitle} ${keywords.join(' ')}`;
    
    // Retrieve similar documents from Pinecone
    const similarDocuments = await retrieveSimilarDocuments(queryText, 5);
    
    if (similarDocuments.length === 0) {
      return prompt; // No enhancement if no similar documents found
    }
    
    // Extract relevant text from the retrieved documents
    const relevantTexts = similarDocuments
      .map(doc => doc.metadata.text || "")
      .filter(text => text.length > 0)
      .join("\n\n")
      .substring(0, 3000); // Limit context size
    
    // Enhance the original prompt with the retrieved context
    return `${prompt}\n\nUse the following reference information to enhance your response:\n${relevantTexts}`;
  } catch (error) {
    console.error("Error enhancing content with RAG:", error);
    // Return the original prompt if enhancement fails
    return prompt;
  }
};

/**
 * Utility function to check if a string is sufficiently different from another
 */
export const isContentSignificantlyDifferent = (
  original: string,
  enhanced: string,
  threshold: number = 1.5
): boolean => {
  if (!original || !enhanced) return false;
  
  // Calculate length ratio
  const lengthRatio = enhanced.length / original.length;
  
  // Check if the enhanced content is at least threshold times longer
  return lengthRatio >= threshold;
};
