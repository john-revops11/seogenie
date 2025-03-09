
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

/**
 * Generates content outlines based on a title and keywords
 */
export const generateContentOutline = async (
  title: string,
  keywords: string[],
  contentType: string
): Promise<ContentOutline> => {
  // Create a structure based on the Revology Analytics framework
  const headings = [
    "Introduction",
    // Problem section
    "The Problem",
    `Challenges in ${title.split(' ').slice(0, 3).join(' ')}`,
    "Industry Pain Points",
    // Process section
    "The Process",
    `Revology Analytics' Approach to ${title.split(' ').slice(0, 3).join(' ')}`,
    "Methodology and Implementation",
    // Payoff section
    "The Payoff",
    "Results and Benefits",
    "Success Stories and Case Studies",
    // Proposition section
    "Next Steps",
    "Conclusion"
  ];
  
  const faqs = [
    {
      question: `What are the biggest challenges in ${title}?`,
      answer: "This will be generated with AI"
    },
    {
      question: `How does Revology Analytics approach ${title.split(' ').slice(0, 3).join(' ')}?`,
      answer: "This will be generated with AI"
    },
    {
      question: `What ROI can businesses expect from implementing solutions for ${title.split(' ').slice(0, 4).join(' ')}?`,
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
    const relevantDocs = await retrieveSimilarDocuments(combinedQuery, 10);
    
    if (relevantDocs.length === 0) {
      console.log("No relevant documents found for RAG enhancement");
      return prompt;
    }
    
    // Extract context from the retrieved documents
    const context = relevantDocs
      .map(doc => doc.metadata.text || "")
      .join("\n\n");
    
    // Enhanced prompt with the retrieved context and specialized Revology Analytics framework instructions
    const enhancedPrompt = `
      ${prompt}
      
      REFERENCE MATERIAL:
      ${context}
      
      SPECIALIZED INSTRUCTIONS:
      
      You are an advanced AI content generator for Revology Analytics, focusing on distribution, manufacturing, and retail industries.
      
      Please follow the "Comprehensive Article Framework Tailored for Revology Analytics":
      
      1. PROBLEM SECTION:
         - Identify the core challenge or pain point that "${heading}" addresses
         - Make it relevant to distribution, manufacturing, or retail audiences
         - Use the reference material to ground your description in real facts
      
      2. PROCESS SECTION:
         - Present Revology Analytics' approach or methodology for addressing this challenge
         - Include concrete steps, frameworks, or strategic considerations
         - Reference specific methodologies or techniques mentioned in the reference material
      
      3. PAYOFF SECTION:
         - Illustrate the transformations and benefits clients can expect
         - Include specific metrics, ROI improvements, or success stories from the reference material
         - Focus on business outcomes and value creation
      
      4. PROPOSITION SECTION:
         - End with a clear call to action that motivates the reader
         - Suggest next steps for engaging with Revology Analytics on this topic
      
      Ensure all content:
      - Is optimized for SEO using the keywords: ${keywords.join(', ')}
      - Has a professional yet approachable tone
      - Uses active voice and concise paragraphs
      - Is factually accurate and based on the reference material
      - Addresses "${heading}" within the broader context of "${title}"
    `;
    
    return enhancedPrompt;
  } catch (error) {
    console.error("Error enhancing with RAG:", error);
    return prompt; // Return the original prompt if RAG enhancement fails
  }
};
