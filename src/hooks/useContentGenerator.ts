
import { useEffect } from "react";
import { GeneratedContent } from "@/services/keywords/types";
import { AIProvider } from "@/types/aiModels";
import { useContentGeneratorState, StepType } from "./content-generator/useContentGeneratorState";
import { useTopicActions } from "./content-generator/useTopicActions";
import { useContentActions } from "./content-generator/useContentActions";
import { useKeywordActions } from "./content-generator/useKeywordActions";

// Export as default instead of a named export
export default function useContentGenerator(domain: string = "", allKeywords: string[] = []) {
  const {
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
  } = useContentGeneratorState(domain, allKeywords);

  const {
    handleGenerateTopics,
    handleRegenerateTopics,
    handleSelectTopic,
    handleDeleteTopic,
    handleAddCustomTopic
  } = useTopicActions(domain, setIsLoadingTopics, setTopics, setTitleSuggestions, setSelectedTopic);

  const {
    handleGenerateContent,
    handleSelectTitle,
    handleContentPreferenceToggle,
    handleRagToggle,
    handleContentTypeChange,
    handleCreativityChange
  } = useContentActions(
    setIsGenerating, 
    setGeneratedContent, 
    setGeneratedContentData, 
    (step: number) => setActiveStep(step as StepType)
  );

  const { handleGenerateFromKeyword } = useKeywordActions(setSelectedKeywords);

  // Listen for the custom event to handle keyword selection from other components
  useEffect(() => {
    const handleGenerateFromKeywordEvent = (event: CustomEvent) => {
      const { primaryKeyword, relatedKeywords } = event.detail;
      if (primaryKeyword) {
        const keywordsToUse = [primaryKeyword];
        if (relatedKeywords && Array.isArray(relatedKeywords)) {
          keywordsToUse.push(...relatedKeywords.slice(0, 2)); // Add up to 2 related keywords
        }
        setSelectedKeywords(keywordsToUse);
        handleGenerateTopics(keywordsToUse, contentType); // Automatically generate topics for selected keywords
      }
    };

    window.addEventListener('generate-content-from-keyword', handleGenerateFromKeywordEvent as EventListener);
    
    return () => {
      window.removeEventListener('generate-content-from-keyword', handleGenerateFromKeywordEvent as EventListener);
    };
  }, [contentType]);

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
    handleGenerateTopics: () => handleGenerateTopics(selectedKeywords, contentType),
    handleRegenerateTopics: () => handleRegenerateTopics(selectedKeywords, contentType),
    handleSelectTopic,
    handleSelectTitle: (selectedTitle: string) => handleSelectTitle(setTitle, selectedTitle),
    handleDeleteTopic: (topic: string) => handleDeleteTopic(topics, selectedTopic, topic),
    handleContentTypeChange: (type: string) => handleContentTypeChange(setContentType, type),
    handleCreativityChange: (value: number) => handleCreativityChange(setCreativity, value),
    handleContentPreferenceToggle: (preference: string) => 
      handleContentPreferenceToggle(setContentPreferences, preference),
    handleRagToggle: () => handleRagToggle(setRagEnabled),
    handleGenerateContent: () => handleGenerateContent(
      title,
      selectedKeywords,
      contentType,
      contentPreferences,
      ragEnabled,
      aiProvider,
      aiModel,
      creativity
    ),
    handleAddCustomTopic: (topic: string) => 
      handleAddCustomTopic(topics, selectedKeywords, contentType, topic),
    handleGenerateFromKeyword
  };
}

export type { StepType };
