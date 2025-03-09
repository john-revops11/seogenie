
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
  // Base structure for SEO-optimized article
  const headings = [
    "Introduction",
    `What is ${title.split(' ').slice(0, 3).join(' ')}?`,
    `Key Benefits of ${title.split(' ').slice(0, 3).join(' ')}`,
    "Strategic Implementation Approaches",
    "Common Challenges and Solutions",
    "Case Studies and Real-World Examples",
    "Best Practices and Recommendations",
    "Conclusion"
  ];
  
  const faqs = [
    {
      question: `What are the most important aspects of ${title}?`,
      answer: "This will be generated with AI"
    },
    {
      question: `How can I implement ${title.split(' ').slice(0, 3).join(' ')} effectively?`,
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
  const combinedQuery = `${title} ${heading} ${keywords.join(' ')}`;
  
  try {
    // Check if Pinecone is configured
    if (!isPineconeConfigured()) {
      console.log("Pinecone not configured for RAG enhancement");
      // Return original prompt to allow fallback to standard generation
      return prompt;
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
    
    // Enhanced prompt with the retrieved context and specialized SEO + revenue growth management instructions
    const enhancedPrompt = `
      ${prompt}
      
      REFERENCE MATERIAL:
      ${context}
      
      SPECIALIZED INSTRUCTIONS:
      1. You are an advanced AI assistant with expertise in both SEO content creation and revenue growth management consulting.
      2. Create content that:
         - Incorporates the reference material provided above into your output
         - Is optimized for SEO using the keywords: ${keywords.join(', ')}
         - Includes revenue growth management insights where appropriate
         - Presents information in a clear, organized format
         - Uses a professional, approachable tone
      3. Focus on accuracy and relevance:
         - Use the reference material as your primary factual basis
         - Do not invent details not found in the reference material
         - If there is conflicting information, highlight or reconcile it
      4. Structure content with:
         - Well-formatted headings, paragraphs, and lists
         - Clear organization that flows logically
         - Appropriate HTML formatting
      5. Ensure all content directly addresses the topic "${heading}" within the broader context of "${title}"
    `;
    
    return enhancedPrompt;
  } catch (error) {
    console.error("Error enhancing with RAG:", error);
    return prompt; // Return the original prompt if RAG enhancement fails
  }
};
