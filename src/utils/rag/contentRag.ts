
/**
 * Content Retrieval Augmented Generation (RAG) system
 * Enhances content generation with retrieved context from vector database
 */

import { retrieveSimilarDocuments, isPineconeConfigured } from '@/services/vector/pineconeService';
import { extractKeywordsFromDocuments } from './extractors/keywordExtractor';
import { extractTopicsFromDocuments } from './extractors/topicExtractor';
import { extractExamplesFromDocuments } from './extractors/exampleExtractor';
import { getStructuralRecommendations, getCaseStudyRecommendations } from './structureRecommender';
import { isRagEnhancedContent } from './contentDetector';

interface RagResult {
  relevantKeywords: string[];
  relatedTopics: string[];
  contextualExamples: string[];
  structuralRecommendations: string[];
}

/**
 * Enhances content generation with retrieved context using RAG approach
 */
export const enhanceContentWithRAG = async (
  title: string,
  baseKeywords: string[],
  contentType: string
): Promise<RagResult> => {
  const defaultResult: RagResult = {
    relevantKeywords: baseKeywords,
    relatedTopics: [],
    contextualExamples: [],
    structuralRecommendations: []
  };
  
  // If Pinecone is not configured, return base keywords
  if (!isPineconeConfigured()) {
    console.log("Pinecone not configured, using base keywords only");
    return defaultResult;
  }
  
  try {
    // Create a comprehensive query combining title and keywords
    const query = `${title} ${baseKeywords.join(' ')}`;
    
    // Retrieve similar documents from Pinecone
    const similarDocuments = await retrieveSimilarDocuments(query, 5, { 
      contentType: contentType 
    });
    
    if (similarDocuments.length === 0) {
      console.log("No similar documents found, using base keywords only");
      return defaultResult;
    }
    
    // Extract relevant information from the retrieved documents
    const relevantKeywords = [
      ...baseKeywords,
      ...extractKeywordsFromDocuments(similarDocuments)
    ];
    
    // Remove duplicates and ensure uniqueness
    const uniqueKeywords = Array.from(new Set(relevantKeywords));
    
    // Get structural recommendations based on content type and similar documents
    let structuralRecommendations = getStructuralRecommendations(contentType, similarDocuments);
    
    // Add special case-study specific recommendations if needed
    if (contentType === 'case-study') {
      structuralRecommendations = [
        ...structuralRecommendations,
        ...getCaseStudyRecommendations()
      ];
    }
    
    return {
      relevantKeywords: uniqueKeywords,
      relatedTopics: extractTopicsFromDocuments(similarDocuments),
      contextualExamples: extractExamplesFromDocuments(similarDocuments),
      structuralRecommendations: structuralRecommendations
    };
  } catch (error) {
    console.error("Error enhancing content with RAG:", error);
    return defaultResult;
  }
};

// Export the content detection function
export { isRagEnhancedContent };
