
import { AIProvider, getPrimaryModelForProvider } from "@/types/aiModels";
import { toast } from "sonner";
import { GeneratedContent, ContentBlock } from "@/services/keywords/types";
import { generateContentOutline } from "@/services/vector/ragService";
import { generateWithAI } from "@/services/keywords/generation/aiService";
import { isAIProviderConfigured } from "./aiModels";
import { WORD_COUNT_OPTIONS } from "@/components/content-generator/WordCountSelector";
import { convertToCustomBlocks } from "@/services/keywords/generation/contentBlockService";

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
  ragEnabled,
  wordCountOption = "standard",
  customSubheadings = []
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
  wordCountOption?: string;
  customSubheadings?: string[];
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

  try {
    // Get word count range from selected option
    const wordCountOption1 = WORD_COUNT_OPTIONS.find(option => option.value === wordCountOption) || WORD_COUNT_OPTIONS[1]; // Default to standard
    const minWordCount = wordCountOption1.min;
    const maxWordCount = wordCountOption1.max;

    // Ensure we have a valid model, fallback to primary if needed
    const primaryModel = getPrimaryModelForProvider(aiProvider);
    const modelToUse = aiModel || (primaryModel?.id || (aiProvider === 'openai' ? 'gpt-4o' : 'gemini-1.5-pro'));

    // If custom subheadings provided, use them; otherwise generate an outline
    let outline;
    if (customSubheadings && customSubheadings.length > 0) {
      toast.info("Using selected subheadings...");
      outline = {
        title,
        headings: customSubheadings,
        faqs: []
      };
    } else {
      toast.info("Generating content outline...");
      outline = await generateContentOutline(
        title,
        selectedKeywords,
        contentType
      );
    }

    toast.info(`Generating content blocks (${minWordCount}-${maxWordCount} words)...`);
    
    // Create proper ContentBlock array with correct types
    const contentBlocks: ContentBlock[] = [];
    
    // Add title heading block
    contentBlocks.push({
      id: `block-title-${Date.now()}`,
      type: 'heading1',
      content: `<h1>${title}</h1>`
    });
    
    // Calculate approximate words per section to hit target word count
    const targetSectionWords = Math.floor((minWordCount + maxWordCount) / 2 / outline.headings.length);
    
    // Generate each content block
    for (const heading of outline.headings) {
      // Add heading block
      contentBlocks.push({
        id: `block-h2-${Date.now()}-${heading}`,
        type: 'heading2',
        content: `<h2>${heading}</h2>`
      });
      
      let prompt = `Write a detailed section for an article titled "${title}" focusing on the section heading "${heading}". `;
      prompt += `The content should be approximately ${targetSectionWords} words. `;
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

    // Convert blocks to content string
    const contentString = contentBlocks.map(block => block.content).join('\n');
    
    // Generate custom blocks format
    const customBlocksContent = convertToCustomBlocks(contentBlocks);

    // Create a properly typed GeneratedContent object
    const generatedContent: GeneratedContent = {
      title,
      metaDescription,
      outline: outline.headings,
      content: contentString,
      blocks: contentBlocks,
      keywords: selectedKeywords,
      contentType: contentType,
      generationMethod: ragEnabled ? 'rag' : 'standard',
      aiProvider,
      aiModel: modelToUse,
      wordCountOption,
      customBlocksContent,
      wordCount: {
        min: minWordCount,
        max: maxWordCount,
        target: Math.floor((minWordCount + maxWordCount) / 2)
      }
    };
    
    return {
      content: contentString,
      generatedContent
    };
  } catch (error) {
    console.error("Error in content generation:", error);
    throw error; // Re-throw the error to be handled by the calling function
  }
};
