
import { enhanceContentWithRAG } from '@/utils/rag/contentRag';
import { createContentBrief, addContentPreferencesToBrief, addRagContextToBrief } from './contentBriefs';
import { callOpenAiApi, createSystemPrompt, createUserPrompt } from './openaiClient';
import { callGeminiApi, isGeminiConfigured } from './geminiClient';
import { GeneratedContent, RagResults } from './contentTypes';
import { GOOGLE_ADS_API_KEY } from '../apiConfig';
import { isGoogleAdsConfigured } from '../googleAds/googleAdsClient';

/**
 * Generate content with the provided parameters and options
 */
export const generateContent = async (
  domain: string,
  title: string,
  keywords: string[],
  contentType: string,
  creativityLevel: number,
  contentPreferences: string[] = [],
  ragEnabled: boolean = false,
  modelProvider: 'openai' | 'gemini' = 'openai'
): Promise<GeneratedContent> => {
  try {
    console.log(`Generating ${contentType} content for "${title}" with keywords: ${keywords.join(', ')}`);
    console.log(`Using model provider: ${modelProvider}`);
    
    // Only use RAG if it's enabled
    let ragResults: RagResults = {
      relevantKeywords: keywords,
      relatedTopics: [],
      contextualExamples: [],
      structuralRecommendations: []
    };
    
    // Only perform RAG enhancement if enabled
    if (ragEnabled) {
      ragResults = await enhanceContentWithRAG(title, keywords, contentType);
      console.log("Enhanced with RAG:", {
        keywordCount: ragResults.relevantKeywords.length,
        topicCount: ragResults.relatedTopics.length,
        exampleCount: ragResults.contextualExamples.length
      });
    } else {
      console.log("RAG enhancement disabled, using base keywords only");
    }
    
    const enhancedKeywords = ragResults.relevantKeywords;
    
    // Log that we're using Google Ads API for keyword data if applicable
    if (isGoogleAdsConfigured()) {
      console.log("Using Google Ads API for additional keyword insights");
      
      // In a real implementation, you would fetch additional data from Google Ads API here
      // and enhance the keywords/content brief
    } else if (GOOGLE_ADS_API_KEY) {
      console.log("Google Ads API key present but not fully configured");
    }
    
    const creativity = creativityLevel / 100; // Convert to 0-1 scale
    const temperature = 0.5 + (creativity * 0.5); // Range from 0.5 to 1.0
    
    // Create a content brief based on the type of content
    let contentBrief = createContentBrief(contentType as any, title, domain);
    
    // Add content preferences to the brief
    contentBrief = addContentPreferencesToBrief(contentBrief, contentPreferences);
    
    // Add RAG-enhanced context to the content brief only if RAG is enabled
    contentBrief = addRagContextToBrief(contentBrief, ragResults, ragEnabled);
    
    // Add RAG indicator
    const wasRagEnhanced = ragEnabled && ragResults.relevantKeywords.length > keywords.length;
    
    // Create prompts for AI model
    const systemPrompt = createSystemPrompt(domain);
    const userPrompt = createUserPrompt(
      contentBrief, 
      enhancedKeywords, 
      domain, 
      title, 
      contentType, 
      wasRagEnhanced
    );
    
    // Call the appropriate AI API based on the selected model provider
    let result;
    if (modelProvider === 'gemini' && isGeminiConfigured()) {
      console.log("Using Gemini API for content generation");
      result = await callGeminiApi(systemPrompt, userPrompt, temperature);
    } else {
      console.log("Using OpenAI API for content generation");
      result = await callOpenAiApi(systemPrompt, userPrompt, temperature);
    }
    
    return {
      title: result.title || title,
      metaDescription: result.metaDescription,
      outline: result.outline,
      content: result.content,
      ragEnhanced: result.ragEnhanced || wasRagEnhanced // Ensure this is always set (not undefined)
    };
  } catch (error) {
    console.error("Error generating content:", error);
    throw new Error(`Failed to generate content: ${(error as Error).message}`);
  }
};
