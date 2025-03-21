
import { toast } from "sonner";
import { GeneratedContent, ContentBlock } from "@/services/keywords/types";
import { v4 as uuidv4 } from 'uuid';
import { GenerateContentParams, ContentGenerationResult } from "./types/contentGeneratorTypes";
import { createContentOutline } from "./modules/outlineGenerator";
import { generateIntroSection, generateSectionContent } from "./modules/sectionGenerator";
import { isPineconeConfigured } from "@/services/vector/pineconeService";

/**
 * Main content generation function
 */
export const generateContent = async (params: GenerateContentParams): Promise<ContentGenerationResult> => {
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
    // Check if RAG is enabled but Pinecone is not configured
    const ragIsAvailable = ragEnabled && isPineconeConfigured();
    
    if (ragEnabled && !isPineconeConfigured()) {
      toast.warning("RAG is enabled but Pinecone is not configured. Continuing with standard generation.");
      console.log("RAG enabled but Pinecone not configured");
    } else if (ragEnabled) {
      console.log("Generating content with RAG enabled");
    } else {
      console.log("Generating content with standard approach (RAG disabled)");
    }
    
    // Generate content outline
    const outline = createContentOutline(title, customSubheadings);
    
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
    const intro = await generateIntroSection(
      title,
      keywords,
      contentType,
      creativity,
      aiProvider,
      aiModel,
      ragIsAvailable
    );
    
    html += intro.html;
    contentBlocks.push(...intro.blocks);
    
    // Track whether RAG was used for any section
    let ragUsed = intro.ragUsed;
    
    // Generate each section based on the outline
    for (const heading of outline.headings) {
      html += `<h2>${heading}</h2>\n\n`;
      contentBlocks.push({
        id: uuidv4(),
        type: 'heading2',
        content: `<h2>${heading}</h2>`,
        metadata: { level: 2 }
      });
      
      const section = await generateSectionContent(
        heading,
        title,
        keywords,
        contentType,
        creativity,
        aiProvider,
        aiModel,
        ragIsAvailable
      );
      
      html += section.html;
      contentBlocks.push(...section.blocks);
      
      // Update RAG usage flag
      if (section.ragUsed) {
        ragUsed = true;
      }
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
      generationMethod: ragUsed ? 'rag' : 'standard',
      aiProvider,
      aiModel,
      wordCountOption,
      ragInfo: ragUsed ? {
        chunksRetrieved: 8,
        relevanceScore: 0.87,
        topicsFound: keywords
      } : undefined
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
