
import { ContentBlock, ContentOutline, GeneratedContent } from "../types";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

/**
 * Parses HTML content into content blocks
 */
export function parseContentToBlocks(htmlContent: string): ContentBlock[] {
  if (!htmlContent) return [];

  try {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    const blocks: ContentBlock[] = [];
    
    Array.from(tempDiv.childNodes).forEach((node, index) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const tagName = element.tagName.toLowerCase();
        
        // Map HTML elements to block types
        let type: ContentBlock['type'] = 'paragraph';
        
        if (tagName === 'h1') type = 'heading1';
        else if (tagName === 'h2') type = 'heading2';
        else if (tagName === 'h3') type = 'heading3'; 
        else if (tagName === 'p') type = 'paragraph';
        else if (tagName === 'ul') type = 'list';
        else if (tagName === 'ol') type = 'orderedList';
        else if (tagName === 'blockquote') type = 'quote';
        
        blocks.push({
          id: uuidv4(),
          type,
          content: element.outerHTML
        });
      } else if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
        blocks.push({
          id: uuidv4(),
          type: 'paragraph',
          content: `<p>${node.textContent}</p>`
        });
      }
    });
    
    return blocks;
  } catch (error) {
    console.error("Error parsing content to blocks:", error);
    toast.error("Failed to parse content into blocks");
    return [];
  }
}

/**
 * Formats content blocks to a standardized HTML string
 */
export function formatBlocksToHtml(blocks: ContentBlock[]): string {
  if (!blocks || blocks.length === 0) return '';
  
  return blocks.map(block => block.content).join('\n');
}

/**
 * Converts HTML content string to structured content blocks
 */
export function convertHtmlToContentBlocks(
  content: string,
  title: string, 
  metaDescription: string, 
  outline: string[],
  keywords: string[] = [],
  contentType: string = 'blog'
): GeneratedContent {
  const blocks = parseContentToBlocks(content);
  
  return {
    title,
    metaDescription,
    outline,
    content,
    blocks,
    keywords,
    contentType,
    generationMethod: 'standard'
  };
}

/**
 * Fills content blocks with actual content from AI
 */
export async function fillContentBlocks(
  contentOutline: GeneratedContent,
  outline: ContentOutline,
  keywords: string[],
  contentType: string,
  creativity: number = 50,
  preferences: string[] = []
): Promise<GeneratedContent> {
  try {
    // This would normally call OpenAI to fill in the blocks
    // For now we'll return the existing content
    
    if (!contentOutline.blocks || contentOutline.blocks.length === 0) {
      // If no blocks exist yet, create them from the content
      const parsedBlocks = parseContentToBlocks(contentOutline.content);
      return {
        ...contentOutline,
        blocks: parsedBlocks
      };
    }
    
    return contentOutline;
  } catch (error) {
    console.error("Error filling content blocks:", error);
    toast.error("Failed to generate content blocks");
    
    // Return original content with empty blocks as fallback
    return {
      ...contentOutline,
      blocks: contentOutline.blocks || []
    };
  }
}

/**
 * Creates a structured outline for a new piece of content
 */
export function createContentOutline(
  title: string, 
  headings: string[],
  contentType: string = 'blog'
): ContentOutline {
  return {
    title,
    headings,
    metaDescription: `A comprehensive guide to ${title}`,
    outline: headings
  };
}
