
import { ContentBlock, ContentOutline, GeneratedContent } from '../types';
import { convertToCustomBlocks } from './contentBlockService';

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
  
  // Generate meta description that includes primary keywords
  const metaDescription = `${title} - Comprehensive guide covering ${keywords.slice(0, 3).join(', ')}`;
  
  // Initialize content blocks with a structured approach
  const initialBlocks: ContentBlock[] = [
    // H1 Title
    {
      id: `block-h1-${Date.now()}`,
      type: 'heading1',
      content: `<h1>${title}</h1>`
    },
    // Introduction paragraph
    {
      id: `block-intro-${Date.now()}`,
      type: 'paragraph',
      content: `<p>This introduction will provide context, purpose, and key takeaways of the article in 50-100 words.</p>`
    }
  ];
  
  // Add H2 sections based on the outline
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
      content: `<p>Content for the "${heading}" section will be generated with AI, using structured paragraphs (3-4 sentences max).</p>`
    });
    
    // For some sections, add subheadings
    if (index % 2 === 0 && index < outline.headings.length - 1) {
      initialBlocks.push({
        id: `block-h3-${index}-${Date.now()}`,
        type: 'heading3',
        content: `<h3>Key aspects of ${heading}</h3>`
      });
      
      initialBlocks.push({
        id: `block-p-sub-${index}-${Date.now()}`,
        type: 'paragraph',
        content: `<p>This subsection will explore key aspects in detail.</p>`
      });
      
      // Add a list placeholder for appropriate sections
      initialBlocks.push({
        id: `block-list-${index}-${Date.now()}`,
        type: 'list',
        content: `<ul>
          <li>Key point 1 related to this subsection</li>
          <li>Key point 2 related to this subsection</li>
          <li>Key point 3 related to this subsection</li>
        </ul>`
      });
    }
  });
  
  // Ensure we have a case study section
  const hasCaseStudySection = outline.headings.some(heading => 
    heading.toLowerCase().includes('case') || 
    heading.toLowerCase().includes('example'));
  
  if (!hasCaseStudySection) {
    initialBlocks.push({
      id: `block-case-study-heading-${Date.now()}`,
      type: 'heading2',
      content: `<h2>Case Studies and Real-World Examples</h2>`
    });
    
    initialBlocks.push({
      id: `block-case-study-${Date.now()}`,
      type: 'paragraph',
      content: `<p>This section will include at least one clearly formatted, relevant case study demonstrating the topic's real-world application and effectiveness.</p>`
    });
  }
  
  // Ensure we have a best practices section
  const hasBestPracticesSection = outline.headings.some(heading => 
    heading.toLowerCase().includes('best practice') || 
    heading.toLowerCase().includes('tips') ||
    heading.toLowerCase().includes('recommendation'));
  
  if (!hasBestPracticesSection) {
    initialBlocks.push({
      id: `block-best-practices-heading-${Date.now()}`,
      type: 'heading2',
      content: `<h2>Best Practices</h2>`
    });
    
    initialBlocks.push({
      id: `block-best-practices-${Date.now()}`,
      type: 'paragraph',
      content: `<p>Follow these best practices to maximize results:</p>`
    });
    
    initialBlocks.push({
      id: `block-best-practices-list-${Date.now()}`,
      type: 'list',
      content: `<ul>
        <li>Best practice 1</li>
        <li>Best practice 2</li>
        <li>Best practice 3</li>
        <li>Best practice 4</li>
      </ul>`
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
    content: `<p>The conclusion will provide a concise summary reinforcing key insights and recommending actionable next steps.</p>`
  });
  
  // Generate initial content string from blocks
  const initialContent = initialBlocks.map(block => block.content).join('\n');
  
  // Generate custom blocks format
  const customBlocksContent = convertToCustomBlocks(initialBlocks);
  
  const content: GeneratedContent = {
    title: title,
    metaDescription: metaDescription,
    outline: outline.headings,
    blocks: initialBlocks,
    keywords: keywords,
    contentType: contentType,
    generationMethod: 'standard',
    content: initialContent, // Add the content property
    customBlocksContent // Add the custom blocks format
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
