import { retrieveSimilarDocuments, isPineconeConfigured } from '@/services/vector/pineconeService';

interface RagResult {
  relevantKeywords: string[];
  relatedTopics: string[];
  contextualExamples: string[];
  structuralRecommendations: string[];
}

/**
 * Extracts keywords from a list of documents
 */
const extractKeywordsFromDocuments = (documents: Array<{
  id: string;
  score: number;
  metadata: Record<string, any>;
}>): string[] => {
  const keywordSet = new Set<string>();
  
  documents.forEach(doc => {
    // Extract keywords from metadata if available
    if (doc.metadata.keywords && Array.isArray(doc.metadata.keywords)) {
      doc.metadata.keywords.forEach((keyword: string) => keywordSet.add(keyword));
    }
    
    // Extract from tags if available
    if (doc.metadata.tags && Array.isArray(doc.metadata.tags)) {
      doc.metadata.tags.forEach((tag: string) => keywordSet.add(tag));
    }
  });
  
  return Array.from(keywordSet);
};

/**
 * Extracts topics from a list of documents
 */
const extractTopicsFromDocuments = (documents: Array<{
  id: string;
  score: number;
  metadata: Record<string, any>;
}>): string[] => {
  const topicSet = new Set<string>();
  
  documents.forEach(doc => {
    if (doc.metadata.topics && Array.isArray(doc.metadata.topics)) {
      doc.metadata.topics.forEach((topic: string) => topicSet.add(topic));
    }
    
    // Also consider title as a topic
    if (doc.metadata.title) {
      topicSet.add(doc.metadata.title);
    }
  });
  
  return Array.from(topicSet);
};

/**
 * Extracts examples from retrieved documents
 */
const extractExamplesFromDocuments = (documents: Array<{
  id: string;
  score: number;
  metadata: Record<string, any>;
}>): string[] => {
  const examples: string[] = [];
  
  documents.forEach(doc => {
    if (doc.metadata.examples && Array.isArray(doc.metadata.examples)) {
      examples.push(...doc.metadata.examples);
    }
    
    // Extract a snippet from the text as an example
    if (doc.metadata.text && typeof doc.metadata.text === 'string') {
      const snippets = doc.metadata.text.split('. ').filter((s: string) => s.length > 30);
      if (snippets.length > 0) {
        examples.push(snippets[0] + '.');
      }
    }
  });
  
  return examples.slice(0, 5); // Limit to 5 examples
};

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
    
    // Add special structural recommendations for case studies
    let structuralRecommendations = getStructuralRecommendations(contentType, similarDocuments);
    
    if (contentType === 'case-study') {
      structuralRecommendations = [
        ...structuralRecommendations,
        'Use a clear two-column layout for the client background section',
        'Structure the situation section in a grid layout with four key challenges',
        'Number the action steps from 1 to 4 for clarity',
        'Present results in distinct sections with clear headings for each outcome area'
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

/**
 * Detects if content was generated using RAG enhancement
 */
export const isRagEnhancedContent = (content: string): boolean => {
  // Check for specific structural patterns often found in RAG-enhanced content
  const hasStructuredHeadings = (content.match(/<h[1-3]/g) || []).length > 3;
  const hasCitations = content.includes("according to") || content.includes("research shows");
  const hasDataPoints = content.includes("%") || content.match(/\d+(\.\d+)?%/) !== null;
  
  return hasStructuredHeadings && (hasCitations || hasDataPoints);
};

/**
 * Generates content structure recommendations based on retrieved documents
 */
const getStructuralRecommendations = (
  contentType: string,
  documents: Array<{
    id: string;
    score: number;
    metadata: Record<string, any>;
  }>
): string[] => {
  const recommendations: string[] = [];
  
  // Default recommendations based on content type
  switch (contentType) {
    case 'blog':
      recommendations.push(
        'Use a clear and concise introduction',
        'Include 3-5 main sections with H2 headings',
        'Add relevant examples in each section',
        'Conclude with actionable takeaways'
      );
      break;
    case 'white-paper':
      recommendations.push(
        'Start with an executive summary',
        'Include problem statement, methodology, and findings sections',
        'Use data visualizations to support key points',
        'End with recommendations and next steps'
      );
      break;
    case 'case-study':
      recommendations.push(
        'Begin with client background and challenge',
        'Describe the solution implementation',
        'Present results with specific metrics',
        'Include testimonials if available'
      );
      break;
    default:
      recommendations.push(
        'Use a logical structure with clear headings',
        'Include an introduction and conclusion',
        'Support claims with evidence and examples'
      );
  }
  
  // Add any structural recommendations from similar documents
  documents.forEach(doc => {
    if (doc.metadata.structuralRecommendations && 
        Array.isArray(doc.metadata.structuralRecommendations)) {
      recommendations.push(...doc.metadata.structuralRecommendations);
    }
  });
  
  // Return unique recommendations
  return Array.from(new Set(recommendations));
};
