
import { ContentBlock, ContentOutline, GeneratedContent } from '../types';

/**
 * Generates standard content using just OpenAI (no RAG)
 */
export const generateStandardContent = async (
  title: string,
  outline: ContentOutline,
  keywords: string[],
  contentType: string,
  creativity: number = 50,
  preferences: string[] = [],
  fillContentFn: (
    content: GeneratedContent,
    outline: ContentOutline,
    keywords: string[],
    contentType: string,
    creativity?: number,
    preferences?: string[]
  ) => Promise<GeneratedContent>
): Promise<GeneratedContent> => {
  console.log("generateStandardContent: Starting generation for", title);
  const metaDescription = `${title} - Comprehensive guide covering ${keywords.slice(0, 3).join(', ')}`;
  
  // Initialize empty content blocks
  const initialBlocks: ContentBlock[] = [
    {
      id: `block-title-${Date.now()}`,
      type: 'heading1',
      content: `<h1>${title}</h1>`
    },
    {
      id: `block-intro-${Date.now()}`,
      type: 'paragraph',
      content: `<p>This is an introduction paragraph that will be generated with AI.</p>`
    }
  ];
  
  // Add heading blocks based on the outline
  outline.headings.forEach((heading, index) => {
    initialBlocks.push({
      id: `block-h2-${index}-${Date.now()}`,
      type: 'heading2',
      content: `<h2>${heading}</h2>`
    });
    
    // Add a placeholder paragraph after each heading
    initialBlocks.push({
      id: `block-p-${index}-${Date.now()}`,
      type: 'paragraph',
      content: `<p>Content for the "${heading}" section will be generated with AI.</p>`
    });
  });
  
  // Add FAQ section if requested in preferences
  if (preferences.includes('Add FAQ section')) {
    initialBlocks.push({
      id: `block-faq-heading-${Date.now()}`,
      type: 'heading2',
      content: `<h2>Frequently Asked Questions</h2>`
    });
    
    outline.faqs.forEach((faq, index) => {
      initialBlocks.push({
        id: `block-faq-q-${index}-${Date.now()}`,
        type: 'heading3',
        content: `<h3>${faq.question}</h3>`
      });
      
      initialBlocks.push({
        id: `block-faq-a-${index}-${Date.now()}`,
        type: 'paragraph',
        content: `<p>${faq.answer}</p>`
      });
    });
  }
  
  // Add conclusion
  initialBlocks.push({
    id: `block-conclusion-heading-${Date.now()}`,
    type: 'heading2',
    content: `<h2>Conclusion</h2>`
  });
  
  initialBlocks.push({
    id: `block-conclusion-${Date.now()}`,
    type: 'paragraph',
    content: `<p>Conclusion will be generated with AI.</p>`
  });
  
  const content: GeneratedContent = {
    title: title,
    metaDescription: metaDescription,
    outline: outline.headings,
    blocks: initialBlocks,
    keywords: keywords,
    contentType: contentType,
    generationMethod: 'standard'
  };
  
  // Fill in the content blocks with AI-generated content
  return await fillContentFn(
    content,
    outline, 
    keywords,
    contentType,
    creativity,
    preferences
  );
};
