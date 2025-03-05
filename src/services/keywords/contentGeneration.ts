
import { toast } from "sonner";
import { 
  generateFullContent, 
  generateTitleSuggestions, 
  getContentTemplates 
} from "./contentGenerationService";
import { 
  generateContentOutline 
} from "../vector/ragService";
import { ContentOutline, GeneratedContent } from "./types";

/**
 * Comprehensive content generation function
 */
export const generateContent = async (
  domain: string,
  title: string,
  keywords: string[] = [],
  contentType: string = "blog",
  creativity: number = 50,
  preferences: string[] = [],
  useRag: boolean = false
): Promise<{
  title: string;
  metaDescription: string;
  outline: string[];
  content: string;
}> => {
  if (!title) {
    throw new Error("Title is required for content generation");
  }
  
  if (keywords.length === 0) {
    throw new Error("At least one keyword is required for content generation");
  }
  
  try {
    console.log("generateContent: Starting with title:", title);
    console.log("generateContent: Keywords:", keywords);
    console.log("generateContent: Content type:", contentType);
    console.log("generateContent: Domain:", domain);
    console.log("generateContent: Creativity:", creativity);
    console.log("generateContent: Preferences:", preferences);
    console.log("generateContent: Use RAG:", useRag);
    
    toast.info("Generating content outline...", { id: "content-gen" });
    
    // Generate content outline with headings and FAQs
    const outline: ContentOutline = await generateContentOutline(
      title,
      keywords,
      contentType
    );
    
    console.log("generateContent: Generated outline:", outline);
    toast.info("Creating content blocks...", { id: "content-gen" });
    
    // Generate the full content with blocks
    const result = await generateFullContent(
      title,
      outline,
      keywords,
      contentType,
      creativity,
      preferences,
      useRag
    );
    
    if (!result) {
      throw new Error("Failed to generate content");
    }
    
    console.log("generateContent: Generated content result:", result);
    toast.success("Content generation completed!", { id: "content-gen" });
    
    // Convert blocks to HTML string for the existing interface
    const contentHtml = result.blocks.map(block => block.content).join('\n');
    
    return {
      title: result.title,
      metaDescription: result.metaDescription,
      outline: result.outline,
      content: contentHtml
    };
  } catch (error) {
    console.error("Error in generateContent:", error);
    toast.error(`Content generation failed: ${error instanceof Error ? error.message : "Unknown error"}`, { id: "content-gen" });
    throw error;
  }
};

/**
 * Function to get content templates for a given content type
 */
export const getAvailableContentTemplates = (contentType: string) => {
  return getContentTemplates(contentType);
};

/**
 * Function to generate title suggestions
 */
export const getSuggestedTitles = (
  primaryKeyword: string,
  relatedKeywords: string[] = [],
  contentType: string = 'blog'
) => {
  return generateTitleSuggestions(primaryKeyword, relatedKeywords, contentType);
};
