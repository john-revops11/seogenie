
import { isPineconeConfigured } from './pineconeConfig';
import { testPineconeConnection } from './pineconeConnection';
import { retrieveSimilarDocuments } from './vectorOperations';
import { toast } from 'sonner';
import { ContentOutline, GeneratedContent } from '../keywords/types';

/**
 * Enhances content generation with Retrieval Augmented Generation (RAG)
 */
export const generateContentWithRAG = async (
  title: string,
  outline: ContentOutline,
  keywords: string[],
  contentType: string,
  creativity: number = 50
): Promise<GeneratedContent | null> => {
  if (!isPineconeConfigured()) {
    toast.error("Pinecone is not configured for RAG-enhanced generation");
    return null;
  }
  
  try {
    // Test Pinecone connection
    const testResult = await testPineconeConnection();
    if (!testResult.success) {
      toast.error(`Pinecone connection failed: ${testResult.message}`);
      return null;
    }
    
    // Create a combined query from title, headings, and keywords
    const queryText = `${title} ${outline.headings.join(' ')} ${keywords.join(' ')}`;
    
    // Retrieve relevant documents from Pinecone
    const retrievedDocs = await retrieveSimilarDocuments(queryText, 10, {
      contentType: contentType
    });
    
    if (retrievedDocs.length === 0) {
      toast.warning("No relevant documents found in knowledge base. Falling back to standard generation");
      return null;
    }
    
    // Extract relevant text chunks from the retrieved documents
    const relevantChunks = retrievedDocs.map(doc => {
      return {
        text: doc.metadata.text || "",
        score: doc.score
      };
    });
    
    // Create an enhanced context from the retrieved chunks
    const enhancedContext = relevantChunks
      .map(chunk => chunk.text)
      .join("\n\n")
      .substring(0, 4000); // Limit context size
    
    // Log retrieval information for auditing
    console.log(`RAG: Retrieved ${retrievedDocs.length} chunks with an average score of ${
      relevantChunks.reduce((sum, chunk) => sum + chunk.score, 0) / relevantChunks.length
    }`);
    
    // Generate the content using OpenAI with the enhanced context
    // This is a placeholder - the actual implementation will be in the contentGenerationService
    return {
      title: title,
      metaDescription: `${title} - Learn about ${keywords.slice(0, 3).join(', ')}`,
      outline: outline.headings,
      blocks: [], // These will be filled by the OpenAI service
      keywords: keywords,
      contentType: contentType,
      generationMethod: 'rag',
      ragInfo: {
        chunksRetrieved: retrievedDocs.length,
        relevanceScore: retrievedDocs.length > 0 ? 
          retrievedDocs.reduce((sum, doc) => sum + doc.score, 0) / retrievedDocs.length : 
          0
      }
    };
  } catch (error) {
    console.error("Error in RAG content generation:", error);
    toast.error(`RAG generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    return null;
  }
};
