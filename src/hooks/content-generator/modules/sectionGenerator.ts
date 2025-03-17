
import { ContentBlock } from "@/services/keywords/types";
import { generateWithAI } from "@/services/keywords/generation/aiService";
import { parseContentToBlocks } from "@/services/keywords/generation/contentBlockService";
import { AIProvider } from "@/types/aiModels";
import { enhancePromptWithRAG } from "./ragEnhancer";
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate intro section content
 */
export async function generateIntroSection(
  title: string,
  keywords: string[],
  contentType: string,
  creativity: number,
  aiProvider: AIProvider,
  aiModel: string,
  ragEnabled: boolean
): Promise<{
  html: string;
  blocks: ContentBlock[];
  ragUsed: boolean;
}> {
  const introPrompt = `
Write an engaging introduction for a ${contentType} about "${title}". 
The content should be professional, informative, and optimized for SEO.
Include the main keywords: ${keywords.join(', ')}.
Explain what the article will cover and why it's important.
Keep it under 150 words and make it compelling.
`;

  const { enhancedPrompt, ragInfo } = await enhancePromptWithRAG(
    introPrompt,
    "Introduction",
    title,
    keywords,
    ragEnabled
  );
  
  const introContent = await generateWithAI(aiProvider, aiModel, enhancedPrompt, creativity);
  
  const html = `<p>${introContent}</p>\n\n`;
  const blocks = [{
    id: uuidv4(),
    type: 'paragraph',
    content: `<p>${introContent}</p>`,
    metadata: { section: 'introduction' }
  }];
  
  return {
    html,
    blocks,
    ragUsed: ragInfo !== null
  };
}

/**
 * Generate content for a specific section
 */
export async function generateSectionContent(
  sectionTitle: string,
  title: string,
  keywords: string[],
  contentType: string,
  creativity: number,
  aiProvider: AIProvider,
  aiModel: string,
  ragEnabled: boolean
): Promise<{
  html: string;
  blocks: ContentBlock[];
  ragUsed: boolean;
}> {
  const sectionPrompt = `
Write a detailed section for a ${contentType} about "${title}" with the heading "${sectionTitle}".
Include the keywords: ${keywords.join(', ')} naturally where appropriate.
The content should be informative, engaging, and provide value to the reader.
Include examples, statistics, or case studies if relevant to this section.
Format with appropriate paragraphs, bullet points, or numbered lists as needed.
Keep it between 200-300 words.
`;

  const { enhancedPrompt, ragInfo } = await enhancePromptWithRAG(
    sectionPrompt,
    sectionTitle,
    title,
    keywords,
    ragEnabled
  );
  
  const sectionContent = await generateWithAI(aiProvider, aiModel, enhancedPrompt, creativity);
  
  const sectionBlocks = parseContentToBlocks(sectionContent).map(block => ({
    ...block,
    id: uuidv4()
  }));
  
  return {
    html: `${sectionContent}\n\n`,
    blocks: sectionBlocks,
    ragUsed: ragInfo !== null
  };
}
