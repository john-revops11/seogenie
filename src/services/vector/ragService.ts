
import { enhanceWithRAG } from './contentEnhancer';
import { enhanceContentWithRAG, indexContentForRAG } from '@/utils/rag/contentRag';
import { GeneratedContent, ContentOutline } from '@/services/keywords/types';
import { isPineconeConfigured, testPineconeConnection } from './pineconeService';
import { toast } from 'sonner';

/**
 * Generates content using RAG-enhanced approach
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
    
    // Generate placeholder structure for the content
    const placeholderBlocks = outline.headings.map(heading => ({
      type: 'heading',
      content: `<h2>${heading}</h2>`,
      metadata: { heading }
    }));
    
    // Create RAG info object
    const ragInfo = {
      enabled: true,
      usedOpenAIEmbeddings: true,
      model: 'text-embedding-3-small'
    };
    
    // Generate the content using RAG-enhanced approach
    return {
      title: title,
      metaDescription: `${title} - Comprehensive guide about ${keywords.slice(0, 3).join(', ')}`,
      outline: outline.headings,
      blocks: placeholderBlocks,
      keywords: keywords,
      contentType: contentType,
      generationMethod: 'rag',
      content: "", // This will be filled by the calling service
      ragInfo
    };
  } catch (error) {
    console.error("Error in RAG content generation:", error);
    toast.error(`RAG generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    return null;
  }
};

/**
 * Generates a content outline using RAG to improve structure
 */
export const generateContentOutline = async (
  title: string,
  keywords: string[] = [],
  contentType: string = 'blog'
): Promise<ContentOutline> => {
  try {
    // First, try to enhance with RAG
    const enhancedData = await enhanceContentWithRAG(title, keywords, contentType);
    
    // Generate basic headings based on content type
    let headings: string[] = [];
    
    // Use topic recommendations from RAG if available
    if (enhancedData.relatedTopics.length > 0) {
      // Filter topics to more likely be appropriate headings
      const potentialHeadings = enhancedData.relatedTopics
        .filter(topic => topic.length > 5 && topic.length < 60)
        .slice(0, 4);
      
      if (potentialHeadings.length > 0) {
        headings = [
          "Introduction",
          ...potentialHeadings,
          "Conclusion"
        ];
      }
    }
    
    // Fall back to default headings if RAG didn't provide enough
    if (headings.length < 3) {
      switch (contentType) {
        case 'blog':
          headings = [
            "Introduction", 
            `What is ${title}?`,
            "Key Benefits",
            "How to Implement",
            "Best Practices",
            "Conclusion"
          ];
          break;
        case 'white-paper':
          headings = [
            "Executive Summary", 
            "Introduction",
            "Problem Statement",
            "Methodology",
            "Findings",
            "Recommendations",
            "Conclusion"
          ];
          break;
        case 'case-study':
          headings = [
            "Client Background", 
            "Challenge",
            "Solution Approach",
            "Implementation",
            "Results",
            "Client Testimonial",
            "Conclusion"
          ];
          break;
        default:
          headings = [
            "Introduction", 
            "Background",
            "Main Points",
            "Analysis",
            "Conclusion"
          ];
      }
    }
    
    // Create enhanced FAQs using keywords and topics
    const faqQuestions = generateFAQs(title, keywords, enhancedData.relatedTopics);
    
    return {
      headings,
      faqs: faqQuestions,
      wordCountTarget: getWordCountTarget(contentType),
      keywordDensity: 2.0, // 2% keyword density
      structureNotes: enhancedData.structuralRecommendations
    };
  } catch (error) {
    console.error("Error generating RAG content outline:", error);
    
    // Fall back to default outline if RAG fails
    return {
      headings: [
        "Introduction", 
        `What is ${title}?`,
        "Key Benefits",
        "How to Implement",
        "Best Practices",
        "Conclusion"
      ],
      faqs: generateFAQs(title, keywords, []),
      wordCountTarget: getWordCountTarget(contentType),
      keywordDensity: 2.0
    };
  }
};

/**
 * Generates FAQs based on title, keywords and related topics
 */
const generateFAQs = (
  title: string, 
  keywords: string[], 
  relatedTopics: string[]
): string[] => {
  const basicQuestions = [
    `What is ${title}?`,
    `Why is ${title} important?`,
    `How to implement ${title}?`,
    `What are the benefits of ${title}?`
  ];
  
  // Generate additional questions from keywords
  const keywordQuestions = keywords
    .filter(keyword => keyword !== title && keyword.length > 3)
    .map(keyword => `How does ${title} relate to ${keyword}?`)
    .slice(0, 2);
  
  // Generate questions from related topics
  const topicQuestions = relatedTopics
    .filter(topic => topic !== title && topic.length > 5 && topic.length < 50)
    .map(topic => `What is the connection between ${title} and ${topic}?`)
    .slice(0, 2);
  
  return [...basicQuestions, ...keywordQuestions, ...topicQuestions].slice(0, 6);
};

/**
 * Determines appropriate word count based on content type
 */
const getWordCountTarget = (contentType: string): number => {
  switch (contentType) {
    case 'blog':
      return 1200;
    case 'white-paper':
      return 2500;
    case 'case-study':
      return 1800;
    default:
      return 1000;
  }
};

/**
 * Re-export RAG-related functions for easier access
 */
export {
  enhanceWithRAG,
  enhanceContentWithRAG,
  indexContentForRAG
};
