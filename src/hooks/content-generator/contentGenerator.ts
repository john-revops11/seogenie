
import { AIProvider, getPrimaryModelForProvider } from "@/types/aiModels";
import { toast } from "sonner";
import { GeneratedContent, ContentBlock } from "@/services/keywords/types";
import { generateContentOutline } from "@/services/vector/ragService";
import { generateWithAI } from "@/services/keywords/generation/aiService";
import { isAIProviderConfigured } from "./aiModels";

/**
 * Generates content based on provided parameters
 */
export const generateContent = async ({
  domain,
  keywords: selectedKeywords,
  contentType,
  title,
  creativity,
  contentPreferences,
  templateId: selectedTemplateId,
  aiProvider,
  aiModel,
  ragEnabled
}: {
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
}): Promise<{
  content: string;
  generatedContent: GeneratedContent;
}> => {
  if (!title) {
    throw new Error("Please provide a title");
  }

  // Check API configuration
  if (!isAIProviderConfigured(aiProvider)) {
    throw new Error(`${aiProvider === 'openai' ? 'OpenAI' : 'Gemini AI'} API key is not configured`);
  }

  // Ensure we have a valid model, fallback to primary if needed
  const modelToUse = aiModel || getPrimaryModelForProvider(aiProvider)?.id || 'gpt-4o';

  toast.info("Generating content outline...");
  
  // Generate content outline with headings
  const outline = await generateContentOutline(
    title,
    selectedKeywords,
    contentType
  );

  toast.info("Generating content blocks...");
  
  // Create proper ContentBlock array with correct types
  const contentBlocks: ContentBlock[] = [];
  
  // Add title heading block
  contentBlocks.push({
    id: `block-title-${Date.now()}`,
    type: 'heading1',
    content: `<h1>${title}</h1>`
  });
  
  // Generate each content block
  for (const heading of outline.headings) {
    // Add heading block
    contentBlocks.push({
      id: `block-h2-${Date.now()}-${heading}`,
      type: 'heading2',
      content: `<h2>${heading}</h2>`
    });
    
    let prompt = `Write a detailed section for an article titled "${title}" focusing on the section heading "${heading}". `;
    prompt += `Incorporate these keywords naturally: ${selectedKeywords.join(", ")}. `;
    prompt += `The content type is ${contentType}. `;
    
    if (contentPreferences.length > 0) {
      prompt += `Follow these style preferences: ${contentPreferences.join(", ")}. `;
    }
    
    // Generate content for this section
    const blockContent = await generateWithAI(aiProvider, modelToUse, prompt, creativity);
    
    // Add paragraph block
    contentBlocks.push({
      id: `block-p-${Date.now()}-${heading}`,
      type: 'paragraph',
      content: `<p>${blockContent}</p>`
    });
  }

  // Generate meta description
  const metaPrompt = `Write a compelling meta description (150 characters max) for an article titled "${title}" about ${selectedKeywords.join(", ")}.`;
  const metaDescription = await generateWithAI(aiProvider, modelToUse, metaPrompt, 30);

  // Create a properly typed GeneratedContent object
  const generatedContent: GeneratedContent = {
    title,
    metaDescription,
    outline: outline.headings,
    blocks: contentBlocks,
    keywords: selectedKeywords,
    contentType: contentType,
    generationMethod: ragEnabled ? 'rag' : 'standard',
    aiProvider,
    aiModel: modelToUse
  };
  
  // Convert blocks to content string
  const contentString = contentBlocks.map(block => block.content).join('\n');

  return {
    content: contentString,
    generatedContent
  };
};
