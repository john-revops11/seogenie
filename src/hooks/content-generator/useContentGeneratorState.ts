import { useState, useEffect } from "react";
import { toast } from "sonner";
import { GeneratedContent } from "@/services/keywords/types";
import { AIProvider, getPrimaryModelForProvider } from "@/types/aiModels";
import { isPineconeConfigured } from "@/services/vector/pineconeService";

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
  
  // Check if Pinecone is configured and enable RAG by default if it is
  const [ragEnabled, setRagEnabled] = useState(isPineconeConfigured());
  
  // AI provider settings - default to OpenAI
  const [aiProvider, setAIProvider] = useState<AIProvider>("openai");
  
  // Get primary model for the selected provider as default
  const primaryModel = getPrimaryModelForProvider(aiProvider);
  const [aiModel, setAIModel] = useState(primaryModel?.id || "gpt-4o");
  
  // Content and generation state
  const [generatedContent, setGeneratedContent] = useState<GeneratedContentInternal | null>(null);
  const [generatedContentData, setGeneratedContentData] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  
  // Topic and title state
  const [topics, setTopics] = useState<string[]>([]);
  const [titleSuggestions, setTitleSuggestions] = useState<{ [topic: string]: string[] }>({});
  const [selectedTopic, setSelectedTopic] = useState("");

  // Update AI model when provider changes
  useEffect(() => {
    const primaryModel = getPrimaryModelForProvider(aiProvider);
    if (primaryModel) {
      setAIModel(primaryModel.id);
    }
  }, [aiProvider]);

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

  // Update RAG setting when Pinecone configuration changes
  useEffect(() => {
    const checkPineconeStatus = () => {
      const pineconeReady = isPineconeConfigured();
      setRagEnabled(prevRagEnabled => {
        // Only set to true if it was previously false and Pinecone is now ready
        if (!prevRagEnabled && pineconeReady) {
          console.log("Pinecone detected, enabling RAG by default");
          return true;
        }
        return prevRagEnabled;
      });
    };

    // Check on mount
    checkPineconeStatus();

    // Listen for API change events that might indicate Pinecone was configured
    const handleApiChange = (event: CustomEvent) => {
      const { apiId } = event.detail;
      if (apiId === "pinecone") {
        console.log("Pinecone API configuration changed, checking status");
        checkPineconeStatus();
      }
    };

    // Add event listener for API changes
    window.addEventListener('api-integration-change', handleApiChange as EventListener);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('api-integration-change', handleApiChange as EventListener);
    };
  }, []);

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
