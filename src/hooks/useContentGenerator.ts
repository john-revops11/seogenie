
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { GeneratedContent } from "@/services/keywords/types";
import { AIProvider } from "@/types/aiModels";
import { generateTopicsAndTitles } from "./content-generator/topicGenerator";
import { generateContent } from "./content-generator/contentGenerator";

// Import the title generator function
import { generateTitleSuggestions } from "@/services/keywords/generation/titleGenerator";

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

  // Generate topics based on selected keywords
  const handleGenerateTopics = useCallback(async () => {
    if (selectedKeywords.length === 0) {
      toast.error("Please select at least one keyword");
      return;
    }

    setIsLoadingTopics(true);
    
    try {
      // Generate topics and titles
      const { topics: generatedTopics, titleSuggestions: suggestions } = 
        await generateTopicsAndTitles(domain, selectedKeywords, contentType);
      
      // Update state with generated data
      setTopics(generatedTopics);
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

    setIsGenerating(true);
    setGeneratedContent(null);

    try {
      // Generate content
      const contentData = await generateContent(
        title,
        selectedKeywords,
        contentType,
        contentPreferences,
        ragEnabled,
        aiProvider,
        aiModel,
        creativity
      );

      // Update state with generated content
      setGeneratedContentData(contentData);

      // Convert blocks to HTML string for the existing interface
      const contentHtml = contentData.blocks.map(block => block.content).join('\n');

      setGeneratedContent({
        title,
        metaDescription: contentData.metaDescription,
        outline: contentData.outline,
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
