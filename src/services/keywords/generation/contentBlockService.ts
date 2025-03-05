
import { toast } from 'sonner';
import { ContentBlock, ContentOutline, GeneratedContent } from '../types';
import { generateParagraphContent } from './openAiService';

/**
 * Fills in content blocks with AI-generated content
 */
export const fillContentBlocks = async (
  content: GeneratedContent,
  outline: ContentOutline,
  keywords: string[],
  contentType: string,
  creativity: number = 50,
  preferences: string[] = []
): Promise<GeneratedContent> => {
  try {
    console.log("fillContentBlocks: Starting to fill content blocks with AI");
    // Now we'll actually generate the content with OpenAI
    const updatedBlocks = [...content.blocks];
    let promptHeader = `Generate high-quality content for a ${contentType} about "${content.title}" targeting these keywords: ${keywords.join(', ')}.\n`;
    promptHeader += `Creativity level: ${creativity}%.\n`;
    
    if (preferences.length > 0) {
      promptHeader += `Content preferences: ${preferences.join(', ')}.\n`;
    }
    
    // Generate content for each paragraph block
    for (let i = 0; i < updatedBlocks.length; i++) {
      const block = updatedBlocks[i];
      
      if (block.type === 'paragraph') {
        let contextHeading = '';
        
        // Find the preceding heading to provide context
        for (let j = i - 1; j >= 0; j--) {
          if (updatedBlocks[j].type.startsWith('heading')) {
            contextHeading = updatedBlocks[j].content.replace(/<\/?[^>]+(>|$)/g, ""); // Remove HTML tags
            break;
          }
        }
        
        let prompt = promptHeader;
        if (contextHeading) {
          prompt += `\nGenerate a detailed paragraph for the section "${contextHeading}".\n`;
          console.log(`Generating content for section: "${contextHeading}"`);
        }
        
        // Try to generate content
        try {
          const generatedContent = await generateParagraphContent(prompt, creativity);
          
          // Update the block with the generated content
          if (generatedContent && generatedContent.trim() !== '') {
            updatedBlocks[i] = {
              ...block,
              content: `<p>${generatedContent}</p>`
            };
            console.log(`Successfully generated content for ${contextHeading || 'section'}`);
          } else {
            console.warn("Empty content returned from AI generation");
            updatedBlocks[i] = {
              ...block,
              content: `<p>Content generation failed for this section. Please try regenerating or edit manually.</p>`
            };
          }
        } catch (genError) {
          console.error("Error generating paragraph content:", genError);
          updatedBlocks[i] = {
            ...block,
            content: `<p>Content generation failed for this section. Error: ${genError instanceof Error ? genError.message : "Unknown error"}</p>`
          };
        }
      }
    }
    
    // Update the content with the filled blocks
    return {
      ...content,
      blocks: updatedBlocks
    };
  } catch (error) {
    console.error("Error filling content blocks:", error);
    toast.error(`Content generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    return content;
  }
};
