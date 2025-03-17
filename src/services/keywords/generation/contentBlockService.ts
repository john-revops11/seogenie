
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
        // Add more mappings as needed
        
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
 * Converts content blocks to a custom block format for specialized output
 */
export function convertToCustomBlocks(blocks: ContentBlock[]): string {
  let customBlockContent = '';
  
  blocks.forEach((block) => {
    switch (block.type) {
      case 'heading1':
        const h1Content = block.content.replace(/<h1>(.*?)<\/h1>/gs, '$1');
        customBlockContent += `<!-- custom-block:heading {"level":1} -->\n# ${h1Content}\n<!-- /custom-block:heading -->\n\n`;
        break;
      case 'heading2':
        const h2Content = block.content.replace(/<h2>(.*?)<\/h2>/gs, '$1');
        customBlockContent += `<!-- custom-block:heading {"level":2} -->\n## ${h2Content}\n<!-- /custom-block:heading -->\n\n`;
        break;
      case 'heading3':
        const h3Content = block.content.replace(/<h3>(.*?)<\/h3>/gs, '$1');
        customBlockContent += `<!-- custom-block:heading {"level":3} -->\n### ${h3Content}\n<!-- /custom-block:heading -->\n\n`;
        break;
      case 'paragraph':
        const pContent = block.content.replace(/<p>(.*?)<\/p>/gs, '$1')
          .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
          .replace(/<em>(.*?)<\/em>/g, '*$1*')
          .replace(/<.*?>/g, ''); // Remove any remaining HTML tags
        customBlockContent += `<!-- custom-block:paragraph -->\n${pContent}\n<!-- /custom-block:paragraph -->\n\n`;
        break;
      case 'list':
        let listContent = block.content;
        if (listContent.includes('<ul>')) {
          listContent = listContent.replace(/<ul>(.*?)<\/ul>/gs, '$1')
            .replace(/<li>(.*?)<\/li>/gs, '- $1\n')
            .replace(/<.*?>/g, ''); // Remove any remaining HTML tags
          customBlockContent += `<!-- custom-block:list {"type":"bullet"} -->\n${listContent}<!-- /custom-block:list -->\n\n`;
        }
        break;
      case 'orderedList':
        let orderedListContent = block.content;
        if (orderedListContent.includes('<ol>')) {
          const listItems = orderedListContent.match(/<li>(.*?)<\/li>/gs);
          let numberedList = '';
          if (listItems) {
            listItems.forEach((item, index) => {
              const content = item.replace(/<li>(.*?)<\/li>/s, '$1');
              numberedList += `${index + 1}. ${content}\n`;
            });
          }
          customBlockContent += `<!-- custom-block:list {"type":"numbered"} -->\n${numberedList}<!-- /custom-block:list -->\n\n`;
        }
        break;
      case 'quote':
        const quoteContent = block.content.replace(/<blockquote>(.*?)<\/blockquote>/gs, '$1')
          .replace(/<.*?>/g, ''); // Remove any remaining HTML tags
        customBlockContent += `<!-- custom-block:quote -->\n${quoteContent}\n<!-- /custom-block:quote -->\n\n`;
        break;
      default:
        // Handle any other block types as raw content
        customBlockContent += `<!-- custom-block:raw -->\n${block.content}\n<!-- /custom-block:raw -->\n\n`;
    }
  });
  
  return customBlockContent;
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
