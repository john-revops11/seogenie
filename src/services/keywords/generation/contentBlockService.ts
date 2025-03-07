
import { toast } from 'sonner';
import { ContentBlock, ContentOutline, GeneratedContent } from '../types';
import { generateParagraphContent } from './openAiService';
import { enhanceWithRAG } from '../../vector/ragService';

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
    
    // Structure-related guidelines
    const structureGuidelines = `
      Structure Guidelines:
      - Keep paragraphs concise (3-4 sentences max)
      - Use H2 for main sections and H3 for subsections
      - Format lists appropriately:
        * Use bulleted lists for features, benefits, key points
        * Use numbered lists for sequential steps or processes
      - Each section should flow logically to the next
      - Naturally incorporate keywords without keyword stuffing
    `;
    
    // SEO guidelines
    const seoGuidelines = `
      SEO Guidelines:
      - Naturally incorporate these keywords: ${keywords.join(', ')}
      - Include relevant semantic terms related to the main topic
      - Ensure content is factual and up-to-date
      - Maintain readability and user engagement
    `;
    
    // Combined prompt header with all guidelines
    let promptHeader = `Generate high-quality, SEO-optimized content for a ${contentType} about "${content.title}".\n`;
    promptHeader += structureGuidelines + '\n';
    promptHeader += seoGuidelines + '\n';
    promptHeader += `Creativity level: ${creativity}%.\n`;
    
    if (preferences.length > 0) {
      promptHeader += `Content preferences: ${preferences.join(', ')}.\n`;
    }
    
    const isRagEnabled = content.generationMethod === 'rag';
    
    // Generate content for each paragraph block
    for (let i = 0; i < updatedBlocks.length; i++) {
      const block = updatedBlocks[i];
      
      if (block.type === 'paragraph' || block.type === 'list') {
        let contextHeading = '';
        let parentHeadingType = '';
        
        // Find the preceding heading to provide context
        for (let j = i - 1; j >= 0; j--) {
          if (updatedBlocks[j].type.startsWith('heading')) {
            contextHeading = updatedBlocks[j].content.replace(/<\/?[^>]+(>|$)/g, ""); // Remove HTML tags
            parentHeadingType = updatedBlocks[j].type;
            break;
          }
        }
        
        let prompt = promptHeader;
        
        if (contextHeading) {
          // Customize prompt based on the heading context
          if (contextHeading.toLowerCase().includes('introduction')) {
            prompt += `\nWrite a concise, informative introduction paragraph (50-100 words) that clearly sets the context, purpose, and key takeaways of the article about "${content.title}".\n`;
          } 
          else if (contextHeading.toLowerCase().includes('conclusion')) {
            prompt += `\nWrite a concise conclusion paragraph that reinforces key insights from the article and recommends actionable next steps on the topic "${content.title}".\n`;
          }
          else if (contextHeading.toLowerCase().includes('case stud') || contextHeading.toLowerCase().includes('example')) {
            prompt += `\nProvide a clearly formatted, relevant case study or practical example demonstrating how "${content.title}" has been applied effectively in a real-world scenario.\n`;
          }
          else if (contextHeading.toLowerCase().includes('best practice')) {
            prompt += `\nGenerate a comprehensive list of best practices for "${content.title}", formatted as a bulleted list with actionable recommendations.\n`;
          }
          else if (block.type === 'list') {
            // Determine if it should be a bulleted or numbered list
            const shouldBeNumbered = contextHeading.toLowerCase().includes('step') || 
                                   contextHeading.toLowerCase().includes('process') || 
                                   contextHeading.toLowerCase().includes('method');
            
            prompt += `\nCreate a ${shouldBeNumbered ? 'numbered' : 'bulleted'} list of key points related to "${contextHeading}". Each item should be meaningful and directly related to the topic.\n`;
          }
          else {
            prompt += `\nGenerate a detailed section for "${contextHeading}".\n`;
            if (parentHeadingType === 'heading3') {
              prompt += `This is a subsection that provides deeper details about a specific aspect of the main topic.\n`;
            }
          }
          
          console.log(`Generating content for section: "${contextHeading}"`);
        }
        
        // Enhance with RAG if enabled
        if (isRagEnabled) {
          try {
            prompt = await enhanceWithRAG(prompt, contextHeading || 'general', content.title, keywords);
          } catch (ragError) {
            console.error("Error enhancing with RAG:", ragError);
            // Continue without RAG enhancement if it fails
          }
        }
        
        // Try to generate content
        try {
          const generatedContent = await generateParagraphContent(prompt, creativity);
          
          // Update the block with the generated content
          if (generatedContent && generatedContent.trim() !== '') {
            if (block.type === 'paragraph') {
              updatedBlocks[i] = {
                ...block,
                content: `<p>${generatedContent}</p>`
              };
            } else if (block.type === 'list') {
              // Determine if we need an ordered or unordered list based on context
              const isOrdered = contextHeading.toLowerCase().includes('step') || 
                              contextHeading.toLowerCase().includes('process') || 
                              contextHeading.toLowerCase().includes('method');
              
              // Parse the content to properly format as a list
              const listItems = generatedContent
                .split(/\n|•|-|\d+\./)
                .filter(item => item.trim() !== '')
                .map(item => `<li>${item.trim()}</li>`)
                .join('\n');
              
              updatedBlocks[i] = {
                ...block,
                content: isOrdered ? `<ol>${listItems}</ol>` : `<ul>${listItems}</ul>`
              };
            }
            
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

