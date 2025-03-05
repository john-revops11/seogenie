
import { toast } from 'sonner';
import { ContentOutline, GeneratedContent } from './types';
import { generateContentWithRAG } from '../vector/ragService';
import { isPineconeConfigured } from '../vector/pineconeService';
import { OPENAI_API_KEY } from './apiConfig';
import { generateTitleSuggestions } from './generation/titleGenerator';
import { getContentTemplates } from './generation/templateService';
import { fillContentBlocks } from './generation/contentBlockService';
import { generateStandardContent } from './generation/contentStructureService';

/**
 * Generates content using OpenAI, optionally enhanced with RAG
 */
export const generateFullContent = async (
  title: string,
  outline: ContentOutline,
  keywords: string[],
  contentType: string,
  creativity: number = 50,
  preferences: string[] = [],
  useRag: boolean = false
): Promise<GeneratedContent | null> => {
  try {
    // First try RAG if enabled and configured
    if (useRag && isPineconeConfigured()) {
      try {
        const ragContent = await generateContentWithRAG(
          title,
          outline,
          keywords,
          contentType,
          creativity
        );
        
        if (ragContent) {
          // Fill in the actual content blocks using OpenAI
          const filledContent = await fillContentBlocks(
            ragContent,
            outline,
            keywords,
            contentType,
            creativity,
            preferences
          );
          
          return filledContent;
        } else {
          toast.warning("RAG generation failed, falling back to standard generation");
        }
      } catch (ragError) {
        console.error("Error in RAG content generation:", ragError);
        toast.warning("RAG generation failed, falling back to standard generation");
      }
    }
    
    // Standard generation without RAG
    return await generateStandardContent(
      title,
      outline, 
      keywords,
      contentType,
      creativity,
      preferences,
      fillContentBlocks
    );
  } catch (error) {
    console.error("Error generating content:", error);
    toast.error(`Content generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    return null;
  }
};

// Re-export functions from their respective files
export { generateTitleSuggestions, getContentTemplates };
