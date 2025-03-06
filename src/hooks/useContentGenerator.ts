// Update this file to modify the useContentGenerator hook
// Add support for different AI providers and models

import { useState, useEffect, useCallback } from "react";
import { getApiKey } from "@/services/keywords/apiConfig";
import { toast } from "sonner";
import { generateContentOutline } from "@/services/vector/ragService";
import { generateTitleSuggestions } from "@/services/keywords/generation/titleGenerator";
import { generateTopicSuggestions } from "@/utils/topicGenerator";
import { generateWithAI } from "@/services/keywords/generation/aiService";
import { AIProvider } from "@/types/aiModels";
import { GeneratedContent, ContentBlock } from "@/services/keywords/types";
import { generateAITopics } from "@/utils/aiTopicGenerator";

export type StepType = 1 | 2 | 3 | 4;

// Temporary internal type to maintain compatibility with existing code
interface GeneratedContentInternal {
  title: string;
  metaDescription: string;
  outline: string[];
  content: string;
}

// Export as default instead of a named export
export default function useContentGenerator(domain: string = "", allKeywords: string[] = []) {
  const [activeStep, setActiveStep] = useState<StepType>(1);
  const [contentType, setContentType] = useState("blog");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [title, setTitle] = useState("");
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(allKeywords.slice(0, 3));
  const [creativity, setCreativity] = useState(50);
  const [contentPreferences, setContentPreferences] = useState<string[]>([]);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContentInternal | null>(null);
  const [generatedContentData, setGeneratedContentData] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [topics, setTopics] = useState<string[]>([]);
  const [titleSuggestions, setTitleSuggestions] = useState<{ [topic: string]: string[] }>({});
  const [selectedTopic, setSelectedTopic] = useState("");
  const [ragEnabled, setRagEnabled] = useState(false);
  const [aiProvider, setAIProvider] = useState<AIProvider>("openai");
  const [aiModel, setAIModel] = useState("gpt-4o-mini");

  // Reset title when topic changes
  useEffect(() => {
    if (selectedTopic && titleSuggestions[selectedTopic]?.[0]) {
      setTitle(titleSuggestions[selectedTopic][0]);
    } else {
      setTitle("");
    }
  }, [selectedTopic]);

  // Generate topics based on selected keywords with AI fallback mechanism
  const handleGenerateTopics = useCallback(async () => {
    if (selectedKeywords.length === 0) {
      toast.error("Please select at least one keyword");
      return;
    }

    setIsLoadingTopics(true);
    
    try {
      // First attempt with OpenAI
      const openaiKey = getApiKey('openai');
      
      let generatedTopics: string[] = [];
      let usedProvider = 'openai';
      
      if (openaiKey) {
        try {
          // Try to generate topics with OpenAI
          generatedTopics = await generateAITopics('openai', domain, selectedKeywords, contentType);
          toast.success("Generated topics using OpenAI");
        } catch (openaiError) {
          console.error("OpenAI topics generation failed:", openaiError);
          
          // Fallback to Gemini if OpenAI fails
          const geminiKey = getApiKey('gemini');
          
          if (geminiKey) {
            try {
              generatedTopics = await generateAITopics('gemini', domain, selectedKeywords, contentType);
              usedProvider = 'gemini';
              toast.success("Generated topics using Gemini AI (fallback)");
            } catch (geminiError) {
              console.error("Gemini topics generation failed:", geminiError);
              // If both AI services fail, fall back to the rule-based generator
              generatedTopics = await generateTopicSuggestions(domain, [], null, selectedKeywords);
              usedProvider = 'rule-based';
              toast.info("Using rule-based topic generation (fallback)");
            }
          } else {
            // No Gemini key, fall back to rule-based
            generatedTopics = await generateTopicSuggestions(domain, [], null, selectedKeywords);
            usedProvider = 'rule-based';
            toast.info("Using rule-based topic generation (fallback)");
          }
        }
      } else {
        // No OpenAI key, try Gemini directly
        const geminiKey = getApiKey('gemini');
        
        if (geminiKey) {
          try {
            generatedTopics = await generateAITopics('gemini', domain, selectedKeywords, contentType);
            usedProvider = 'gemini';
            toast.success("Generated topics using Gemini AI");
          } catch (geminiError) {
            console.error("Gemini topics generation failed:", geminiError);
            // Fallback to rule-based
            generatedTopics = await generateTopicSuggestions(domain, [], null, selectedKeywords);
            usedProvider = 'rule-based';
            toast.info("Using rule-based topic generation (fallback)");
          }
        } else {
          // No AI keys configured, use rule-based
          generatedTopics = await generateTopicSuggestions(domain, [], null, selectedKeywords);
          usedProvider = 'rule-based';
          toast.info("Using rule-based topic generation (no AI keys configured)");
        }
      }
      
      // Set the generated topics
      setTopics(generatedTopics);

      // Generate title suggestions for each topic
      const suggestions: { [topic: string]: string[] } = {};
      for (const topic of generatedTopics) {
        try {
          // Try to generate titles with the same provider that succeeded for topics
          if (usedProvider === 'openai' || usedProvider === 'gemini') {
            suggestions[topic] = await generateTitlesWithAI(usedProvider, topic, selectedKeywords, contentType);
          } else {
            // Fall back to the rule-based approach if AI failed
            suggestions[topic] = generateTitleSuggestions(topic, selectedKeywords, contentType);
          }
        } catch (titleError) {
          console.error(`Failed to generate titles for topic "${topic}":`, titleError);
          // Fallback to rule-based title generation if AI fails
          suggestions[topic] = generateTitleSuggestions(topic, selectedKeywords, contentType);
        }
      }
      
      setTitleSuggestions(suggestions);

      if (generatedTopics.length > 0) {
        setSelectedTopic(generatedTopics[0]);
      }
    } catch (error) {
      console.error("Error generating topics:", error);
      toast.error("Failed to generate topics");
    } finally {
      setIsLoadingTopics(false);
    }
  }, [contentType, domain, selectedKeywords]);

  // Helper function to generate titles with AI
  const generateTitlesWithAI = async (
    provider: AIProvider,
    topic: string,
    keywords: string[],
    contentType: string
  ): Promise<string[]> => {
    const prompt = `Generate 5 SEO-optimized title suggestions for a ${contentType} about "${topic}" that incorporates these keywords: ${keywords.join(", ")}. 
    Format the output as a simple list of titles, one per line. Include the current year where appropriate.`;
    
    const titlesText = await generateWithAI(provider, provider === 'openai' ? 'gpt-4o-mini' : 'gemini-pro', prompt, 50);
    
    // Parse the response into individual titles
    return titlesText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^\d+\.\s*/, '')) // Remove leading numbers like "1. "
      .slice(0, 5); // Ensure we have at most 5 titles
  };

  // Handle regenerating topics
  const handleRegenerateTopics = () => {
    handleGenerateTopics();
  };

  // Generate content based on all parameters
  const handleGenerateContent = async () => {
    if (!title) {
      toast.error("Please provide a title");
      return;
    }

    const apiKey = getApiKey(aiProvider);
    if (!apiKey) {
      toast.error(`${aiProvider === 'openai' ? 'OpenAI' : 'Gemini AI'} API key is not configured`);
      return;
    }

    setIsGenerating(true);
    setGeneratedContent(null);

    try {
      toast.info("Generating content outline...");
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
        
        let blockContent;
        
        if (ragEnabled) {
          // Use standard AI generation for RAG-enabled content for now
          blockContent = await generateWithAI(aiProvider, aiModel, prompt, creativity);
        } else {
          // Use the selected AI provider and model
          blockContent = await generateWithAI(aiProvider, aiModel, prompt, creativity);
        }
        
        // Add paragraph block
        contentBlocks.push({
          id: `block-p-${Date.now()}-${heading}`,
          type: 'paragraph',
          content: `<p>${blockContent}</p>`
        });
      }

      // Generate meta description
      const metaPrompt = `Write a compelling meta description (150 characters max) for an article titled "${title}" about ${selectedKeywords.join(", ")}.`;
      const metaDescription = await generateWithAI(aiProvider, aiModel, metaPrompt, 30);

      // Create a properly typed GeneratedContent object
      const contentData: GeneratedContent = {
        title,
        metaDescription,
        outline: outline.headings,
        blocks: contentBlocks,
        keywords: selectedKeywords,
        contentType: contentType,
        generationMethod: ragEnabled ? 'rag' : 'standard'
      };

      setGeneratedContentData(contentData);

      // Convert blocks to HTML string for the existing interface
      const contentHtml = contentBlocks.map(block => block.content).join('\n');

      setGeneratedContent({
        title,
        metaDescription,
        outline: outline.headings,
        content: contentHtml
      });

      // Move to final step
      setActiveStep(4);
      toast.success("Content generated successfully!");
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error(`Failed to generate content: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate from a keyword directly
  const handleGenerateFromKeyword = (keyword: string) => {
    if (keyword) {
      setSelectedKeywords([keyword]);
      toast.info(`Selected keyword: ${keyword}`);
    }
  };

  // Handle selecting a topic
  const handleSelectTopic = (topic: string) => {
    setSelectedTopic(topic);
  };

  // Handle selecting a title
  const handleSelectTitle = (title: string) => {
    setTitle(title);
  };

  // Handle deleting a topic
  const handleDeleteTopic = (topic: string) => {
    if (topics.length <= 1) {
      toast.error("Cannot delete the only topic");
      return;
    }
    
    const newTopics = topics.filter(t => t !== topic);
    setTopics(newTopics);
    
    if (selectedTopic === topic) {
      setSelectedTopic(newTopics[0]);
    }
  };

  // Toggle content preference
  const handleContentPreferenceToggle = (preference: string) => {
    setContentPreferences(prev => 
      prev.includes(preference) 
        ? prev.filter(p => p !== preference) 
        : [...prev, preference]
    );
  };

  // Add custom topic
  const handleAddCustomTopic = (topic: string) => {
    if (!topic.trim()) return;
    
    if (topics.includes(topic)) {
      toast.info("This topic already exists");
      return;
    }
    
    setTopics(prev => [topic, ...prev]);
    setSelectedTopic(topic);
    
    // Generate title suggestions for the new topic
    const titles = generateTitleSuggestions(topic, selectedKeywords, contentType);
    setTitleSuggestions(prev => ({
      ...prev,
      [topic]: titles
    }));
  };

  // Toggle RAG
  const handleRagToggle = () => {
    setRagEnabled(prev => !prev);
  };

  // Handle content type change
  const handleContentTypeChange = (type: string) => {
    setContentType(type);
  };

  // Handle creativity change
  const handleCreativityChange = (value: number) => {
    setCreativity(value);
  };

  return {
    // State
    activeStep,
    contentType,
    selectedTemplateId,
    title,
    selectedKeywords,
    creativity,
    contentPreferences,
    generatedContent,
    generatedContentData,
    isGenerating,
    isLoadingTopics,
    topics,
    titleSuggestions,
    selectedTopic,
    ragEnabled,
    aiProvider,
    aiModel,
    
    // State setters
    setGeneratedContent,
    setGeneratedContentData,
    setSelectedKeywords,
    
    // Actions
    setActiveStep,
    setContentType,
    setSelectedTemplateId,
    setTitle,
    setCreativity,
    setSelectedTopic,
    setRagEnabled,
    setAIProvider,
    setAIModel,
    handleGenerateTopics,
    handleRegenerateTopics,
    handleSelectTopic,
    handleSelectTitle,
    handleDeleteTopic,
    handleContentTypeChange,
    handleCreativityChange,
    handleContentPreferenceToggle,
    handleRagToggle,
    handleGenerateContent,
    handleAddCustomTopic,
    handleGenerateFromKeyword
  };
}
