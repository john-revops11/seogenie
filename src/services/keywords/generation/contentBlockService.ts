
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
      - Use proper HTML formatting:
        * <h1> for main title
        * <h2> for main section headings
        * <h3> for subsection headings
        * <p> for paragraphs
        * <strong> or <b> for bold text
        * <ul> with <li> items for bullet lists
        * <ol> with <li> items for numbered lists
      - Keep paragraphs concise (3-4 sentences max)
      - Add proper spacing between elements
      - Use bold text for emphasis on key terms and concepts
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
      - Use proper heading hierarchy (H1 > H2 > H3)
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
            prompt += `\nWrite a concise, informative introduction paragraph (50-100 words) that clearly sets the context, purpose, and key takeaways of the article about "${content.title}". Use <p> tags and <strong> tags for important terms.\n`;
          } 
          else if (contextHeading.toLowerCase().includes('conclusion')) {
            prompt += `\nWrite a concise conclusion paragraph that reinforces key insights from the article and recommends actionable next steps on the topic "${content.title}". Use <p> tags and <strong> tags for important points.\n`;
          }
          else if (contextHeading.toLowerCase().includes('case stud') || contextHeading.toLowerCase().includes('example')) {
            prompt += `\nProvide a clearly formatted, relevant case study or practical example demonstrating how "${content.title}" has been applied effectively in a real-world scenario. Format with proper HTML tags including <p>, <strong>, and use <h3> tags for any subheadings within this section.\n`;
          }
          else if (contextHeading.toLowerCase().includes('best practice')) {
            prompt += `\nGenerate a comprehensive list of best practices for "${content.title}", formatted as a proper HTML bulleted list (<ul> with <li> items) with actionable recommendations. Add a brief introduction paragraph before the list with <p> tags.\n`;
          }
          else if (block.type === 'list') {
            // Determine if it should be a bulleted or numbered list
            const shouldBeNumbered = contextHeading.toLowerCase().includes('step') || 
                                   contextHeading.toLowerCase().includes('process') || 
                                   contextHeading.toLowerCase().includes('method');
            
            prompt += `\nCreate a ${shouldBeNumbered ? '<ol>' : '<ul>'} list of key points related to "${contextHeading}". Each item should be in <li> tags and provide meaningful, detailed information directly related to the topic. Add brief explanatory text before the list using <p> tags.\n`;
          }
          else {
            prompt += `\nGenerate a detailed section for "${contextHeading}" with proper HTML formatting. Use <p> tags for paragraphs, <strong> tags for emphasis, and appropriate use of other HTML elements as needed.\n`;
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
            // Check if the content already includes HTML tags
            const hasHtmlTags = /<[a-z][\s\S]*>/i.test(generatedContent);
            
            if (block.type === 'paragraph') {
              updatedBlocks[i] = {
                ...block,
                content: hasHtmlTags ? generatedContent : `<p>${generatedContent}</p>`
              };
            } else if (block.type === 'list') {
              // Determine if we need an ordered or unordered list based on context
              const isOrdered = contextHeading.toLowerCase().includes('step') || 
                              contextHeading.toLowerCase().includes('process') || 
                              contextHeading.toLowerCase().includes('method');
              
              // If content already has HTML list, use it directly
              if (hasHtmlTags && (generatedContent.includes('<ul>') || generatedContent.includes('<ol>'))) {
                updatedBlocks[i] = {
                  ...block,
                  content: generatedContent
                };
              } else {
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
