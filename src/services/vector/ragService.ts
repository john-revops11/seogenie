
import { createEmbedding, isPineconeConfigured, retrieveSimilarDocuments, testPineconeConnection } from './pineconeService';
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
    const retrievedDocs = await retrieveSimilarDocuments(queryText, 5, {
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

/**
 * Generates content outlines based on a title and keywords
 */
export const generateContentOutline = async (
  title: string,
  keywords: string[],
  contentType: string
): Promise<ContentOutline> => {
  // Logic to generate an outline based on the title and keywords
  // This could use RAG to find related topics for better outlines
  
  const headings = [
    "Introduction",
    `What is ${title.split(' ').slice(0, 3).join(' ')}?`,
    `Benefits of ${title.split(' ').slice(0, 3).join(' ')}`,
    "Key Strategies",
    "Implementation Steps",
    "Case Studies",
    "Best Practices",
    "Conclusion"
  ];
  
  const faqs = [
    {
      question: `What are the most important aspects of ${title}?`,
      answer: "This will be generated with AI"
    },
    {
      question: `How can I implement ${title.split(' ').slice(0, 3).join(' ')} in my business?`,
      answer: "This will be generated with AI"
    },
    {
      question: `What are common mistakes to avoid with ${title.split(' ').slice(0, 4).join(' ')}?`,
      answer: "This will be generated with AI"
    }
  ];
  
  return {
    title,
    headings,
    faqs
  };
};

/**
 * Simple function to enhance content with RAG
 */
export const enhanceWithRAG = async (
  prompt: string,
  heading: string,
  title: string, 
  keywords: string[]
): Promise<string> => {
  // For now, just returning a placeholder implementation
  // In a real implementation, this would use RAG to enhance the content
  const combinedQuery = `${title} ${heading} ${keywords.join(' ')}`;
  
  try {
    // Check if Pinecone is configured
    if (!isPineconeConfigured()) {
      console.log("Pinecone not configured for RAG enhancement");
      // Return null to allow fallback to standard generation
      return `Content for ${heading} (RAG not available)`;
    }
    
    // Retrieve documents from Pinecone (or any vector database)
    const relevantDocs = await retrieveSimilarDocuments(combinedQuery, 3);
    
    if (relevantDocs.length === 0) {
      console.log("No relevant documents found for RAG enhancement");
      return prompt;
    }
    
    // Extract context from the retrieved documents
    const context = relevantDocs
      .map(doc => doc.metadata.text || "")
      .join("\n\n");
    
    // Enhanced prompt with the retrieved context
    const enhancedPrompt = `
      ${prompt}
      
      Use the following context to enhance your response:
      ${context}
    `;
    
    return enhancedPrompt;
  } catch (error) {
    console.error("Error enhancing with RAG:", error);
    return prompt; // Return the original prompt if RAG enhancement fails
  }
};
