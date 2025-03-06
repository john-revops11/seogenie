
// Update this file to modify the useContentGenerator hook
// Add support for different AI providers and models

import { useState, useEffect } from "react";
import { getApiKey } from "@/services/keywords/apiConfig";
import { toast } from "sonner";
import { generateContent } from "@/services/keywords/contentGenerationService";
import { generateContentOutline } from "@/services/keywords/generation/contentStructureService";
import { getTopicTitles } from "@/services/keywords/generation/titleGenerator";
import { getFileNamesFromTopics } from "@/utils/topicGenerator";
import { generateWithAI } from "@/services/keywords/generation/aiService";
import { enhanceWithRAG } from "@/services/vector/ragService";
import { AIProvider } from "@/types/aiModels";

type GeneratedContentType = {
  title: string;
  metaDescription: string;
  outline: string[];
  blocks: { heading: string; content: string }[];
};

export type StepType = 1 | 2 | 3 | 4;

export default function useContentGenerator() {
  const [step, setStep] = useState<StepType>(1);
  const [contentType, setContentType] = useState("blog");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [title, setTitle] = useState("");
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [creativity, setCreativity] = useState(50);
  const [contentPreferences, setContentPreferences] = useState<string[]>([]);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContentType | null>(null);
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

  // Generate topics based on selected keywords
  const generateTopics = async () => {
    if (selectedKeywords.length === 0) {
      toast.error("Please select at least one keyword");
      return;
    }

    setIsLoadingTopics(true);
    try {
      const generatedTopics = await getFileNamesFromTopics(selectedKeywords);
      setTopics(generatedTopics);

      // Generate title suggestions for each topic
      const suggestions: { [topic: string]: string[] } = {};
      for (const topic of generatedTopics) {
        const titles = await getTopicTitles(topic, selectedKeywords);
        suggestions[topic] = titles;
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
  };

  // Generate content based on all parameters
  const generateContentForTopic = async () => {
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
        contentType,
        contentPreferences
      );

      toast.info("Generating content blocks...");
      
      const blocks = [];
      
      // Generate each content block
      for (const heading of outline) {
        let prompt = `Write a detailed section for an article titled "${title}" focusing on the section heading "${heading}". `;
        prompt += `Incorporate these keywords naturally: ${selectedKeywords.join(", ")}. `;
        prompt += `The content type is ${contentType}. `;
        
        if (contentPreferences.length > 0) {
          prompt += `Follow these style preferences: ${contentPreferences.join(", ")}. `;
        }
        
        let blockContent;
        
        if (ragEnabled) {
          // Use RAG to enhance the content
          blockContent = await enhanceWithRAG(prompt, heading, title, selectedKeywords);
        } else {
          // Use the selected AI provider and model
          blockContent = await generateWithAI(aiProvider, aiModel, prompt, creativity);
        }
        
        blocks.push({
          heading,
          content: blockContent
        });
      }

      // Generate meta description
      const metaPrompt = `Write a compelling meta description (150 characters max) for an article titled "${title}" about ${selectedKeywords.join(", ")}.`;
      const metaDescription = await generateWithAI(aiProvider, aiModel, metaPrompt, 30);

      setGeneratedContent({
        title,
        metaDescription,
        outline,
        blocks
      });

      // Move to final step
      setStep(4);
      toast.success("Content generated successfully!");
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error(`Failed to generate content: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleContentPreference = (preference: string) => {
    setContentPreferences(prev => 
      prev.includes(preference) 
        ? prev.filter(p => p !== preference) 
        : [...prev, preference]
    );
  };

  const addCustomTopic = (topic: string) => {
    if (!topic.trim()) return;
    
    if (topics.includes(topic)) {
      toast.info("This topic already exists");
      return;
    }
    
    setTopics(prev => [topic, ...prev]);
    setSelectedTopic(topic);
    
    // Generate title suggestions for the new topic
    getTopicTitles(topic, selectedKeywords).then(titles => {
      setTitleSuggestions(prev => ({
        ...prev,
        [topic]: titles
      }));
    });
  };

  return {
    step,
    setStep,
    contentType,
    setContentType,
    selectedTemplateId,
    setSelectedTemplateId,
    title,
    setTitle,
    selectedKeywords,
    setSelectedKeywords,
    creativity,
    setCreativity,
    contentPreferences,
    generatedContent,
    setGeneratedContent,
    isGenerating,
    isLoadingTopics,
    topics,
    titleSuggestions,
    selectedTopic,
    setSelectedTopic,
    generateTopics,
    generateContentForTopic,
    toggleContentPreference,
    addCustomTopic,
    ragEnabled,
    setRagEnabled,
    aiProvider,
    setAIProvider,
    aiModel,
    setAIModel
  };
}
