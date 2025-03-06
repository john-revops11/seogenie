
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { GeneratedContent } from "@/services/keywords/types";
import { AIProvider } from "@/types/aiModels";

export type StepType = 1 | 2 | 3 | 4;

// Temporary internal type to maintain compatibility with existing code
export interface GeneratedContentInternal {
  title: string;
  metaDescription: string;
  outline: string[];
  content: string;
}

export function useContentGeneratorState(domain: string = "", allKeywords: string[] = []) {
  // Step management
  const [activeStep, setActiveStep] = useState<StepType>(1);
  
  // Content configuration
  const [contentType, setContentType] = useState("blog");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [title, setTitle] = useState("");
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(allKeywords.slice(0, 3));
  const [creativity, setCreativity] = useState(50);
  const [contentPreferences, setContentPreferences] = useState<string[]>([]);
  const [ragEnabled, setRagEnabled] = useState(false);
  
  // AI provider settings
  const [aiProvider, setAIProvider] = useState<AIProvider>("openai");
  const [aiModel, setAIModel] = useState("gpt-4o-mini");
  
  // Content and generation state
  const [generatedContent, setGeneratedContent] = useState<GeneratedContentInternal | null>(null);
  const [generatedContentData, setGeneratedContentData] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  
  // Topic and title state
  const [topics, setTopics] = useState<string[]>([]);
  const [titleSuggestions, setTitleSuggestions] = useState<{ [topic: string]: string[] }>({});
  const [selectedTopic, setSelectedTopic] = useState("");

  // Reset title when topic changes
  useEffect(() => {
    if (selectedTopic && titleSuggestions[selectedTopic]?.[0]) {
      setTitle(titleSuggestions[selectedTopic][0]);
    } else {
      setTitle("");
    }
  }, [selectedTopic, titleSuggestions]);

  // Update selected keywords when allKeywords prop changes
  useEffect(() => {
    if (allKeywords && allKeywords.length > 0) {
      // Take up to 3 keywords from allKeywords
      const initialKeywords = allKeywords.slice(0, 3);
      setSelectedKeywords(initialKeywords);
    }
  }, [allKeywords]);

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
    setActiveStep,
    setContentType,
    setSelectedTemplateId,
    setTitle,
    setSelectedKeywords,
    setCreativity,
    setContentPreferences,
    setGeneratedContent,
    setGeneratedContentData,
    setIsGenerating,
    setIsLoadingTopics,
    setTopics,
    setTitleSuggestions,
    setSelectedTopic,
    setRagEnabled,
    setAIProvider,
    setAIModel
  };
}
