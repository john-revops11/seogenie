
import { toast } from "sonner";
import { ContentOutline, GeneratedContent, ContentBlock } from "@/services/keywords/types";
import { 
  parseContentToBlocks, 
  formatBlocksToHtml 
} from "@/services/keywords/generation/contentBlockService";
import { AIProvider } from "@/types/aiModels";
import { generateWithAI } from "@/services/keywords/generation/aiService";
import { enhanceWithRAG } from "@/services/vector/ragService";
import { generateContentOutline } from "@/services/vector/ragService";
import { isPineconeConfigured } from "@/services/vector/pineconeService";
import { v4 as uuidv4 } from 'uuid';

interface GenerateContentParams {
  domain: string;
  keywords: string[];
  contentType: string;
  title: string;
  creativity: number;
  contentPreferences: string[];
  templateId: string;
  aiProvider: AIProvider;
  aiModel: string;
  ragEnabled: boolean;
  wordCountOption: string;
  customSubheadings?: string[];
}

export const generateContent = async (params: GenerateContentParams): Promise<{
  content: string;
  generatedContent: GeneratedContent;
}> => {
  const {
    domain,
    keywords,
    contentType,
    title,
    creativity,
    contentPreferences,
    templateId,
    aiProvider,
    aiModel,
    ragEnabled,
    wordCountOption,
    customSubheadings
  } = params;

  if (!title) {
    throw new Error("Title is required");
  }

  if (keywords.length === 0) {
    throw new Error("At least one keyword is required");
  }

  try {
    console.log(`Generating content with RAG ${ragEnabled ? 'enabled' : 'disabled'}`);
    
    // Use custom subheadings if provided, otherwise generate an outline
    let outline: ContentOutline;
    
    if (customSubheadings && customSubheadings.length > 0) {
      outline = {
        headings: customSubheadings,
        faqs: [],
        wordCountTarget: 1200,
        keywordDensity: 2.0
      };
    } else {
      // Generate content outline with RAG if enabled
      if (ragEnabled && isPineconeConfigured()) {
        outline = await generateContentOutline(title, keywords, contentType);
      } else {
        // Default outline without RAG
        outline = {
          headings: [
            "Introduction",
            `What is ${title}`,
            "Key Benefits",
            "How to Implement",
            "Best Practices",
            "Conclusion"
          ],
          faqs: [],
          wordCountTarget: 1200,
          keywordDensity: 2.0
        };
      }
    }
    
    // Create the content structure
    let html = `<h1>${title}</h1>\n\n`;
    const contentBlocks: ContentBlock[] = [
      {
        id: uuidv4(),
        type: 'heading1',
        content: `<h1>${title}</h1>`,
        metadata: { level: 1 }
      }
    ];
    
    // Generate introduction
    let introPrompt = `
Write an engaging introduction for a ${contentType} about "${title}". 
The content should be professional, informative, and optimized for SEO.
Include the main keywords: ${keywords.join(', ')}.
Explain what the article will cover and why it's important.
Keep it under 150 words and make it compelling.
`;

    // Apply RAG enhancement if enabled
    let ragInfo = null;
    if (ragEnabled && isPineconeConfigured()) {
      try {
        const enhancedResult = await enhanceWithRAG(introPrompt, "Introduction", title, keywords);
        introPrompt = enhancedResult.enhancedPrompt;
        ragInfo = {
          chunksRetrieved: enhancedResult.contextInfo.chunksRetrieved,
          relevanceScore: enhancedResult.contextInfo.avgScore,
          topicsFound: enhancedResult.contextInfo.topics || []
        };
      } catch (ragError) {
        console.error("RAG enhancement failed for intro, using standard generation:", ragError);
      }
    }
    
    // Generate the introduction with AI
    const introContent = await generateWithAI(aiProvider, aiModel, introPrompt, creativity);
    html += `<p>${introContent}</p>\n\n`;
    contentBlocks.push({
      id: uuidv4(),
      type: 'paragraph',
      content: `<p>${introContent}</p>`,
      metadata: { section: 'introduction' }
    });
    
    // Generate each section based on the outline
    for (const heading of outline.headings) {
      html += `<h2>${heading}</h2>\n\n`;
      contentBlocks.push({
        id: uuidv4(),
        type: 'heading2',
        content: `<h2>${heading}</h2>`,
        metadata: { level: 2 }
      });
      
      let sectionPrompt = `
Write a detailed section for a ${contentType} about "${title}" with the heading "${heading}".
Include the keywords: ${keywords.join(', ')} naturally where appropriate.
The content should be informative, engaging, and provide value to the reader.
Include examples, statistics, or case studies if relevant to this section.
Format with appropriate paragraphs, bullet points, or numbered lists as needed.
Keep it between 200-300 words.
`;

      // Apply RAG enhancement for this section if enabled
      if (ragEnabled && isPineconeConfigured()) {
        try {
          const enhancedResult = await enhanceWithRAG(sectionPrompt, heading, title, keywords);
          sectionPrompt = enhancedResult.enhancedPrompt;
        } catch (ragError) {
          console.error(`RAG enhancement failed for section ${heading}, using standard generation:`, ragError);
        }
      }
      
      // Generate the section content with AI
      const sectionContent = await generateWithAI(aiProvider, aiModel, sectionPrompt, creativity);
      html += `${sectionContent}\n\n`;
      
      // Parse the section content into blocks
      const sectionBlocks = parseContentToBlocks(sectionContent).map(block => ({
        ...block,
        id: uuidv4()
      }));
      
      contentBlocks.push(...sectionBlocks);
    }
    
    // Create the final generated content object
    const generatedContent: GeneratedContent = {
      title,
      metaDescription: `A comprehensive guide to ${title}, focusing on ${keywords.slice(0, 3).join(", ")}.`,
      outline: outline.headings,
      content: html,
      blocks: contentBlocks,
      keywords,
      contentType,
      generationMethod: ragEnabled ? 'rag' : 'standard',
      aiProvider,
      aiModel,
      wordCountOption,
      ragInfo
    };

    return {
      content: html,
      generatedContent
    };
  } catch (error) {
    console.error("Error generating content:", error);
    toast.error(`Failed to generate content: ${error instanceof Error ? error.message : "Unknown error"}`);
    throw error;
  }
};
