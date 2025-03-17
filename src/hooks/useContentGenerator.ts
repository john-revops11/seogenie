
import { useEffect } from "react";
import { GeneratedContent } from "@/services/keywords/types";
import { AIProvider } from "@/types/aiModels";
import { useContentGeneratorState, StepType } from "./content-generator/useContentGeneratorState";
import { useTopicActions } from "./content-generator/useTopicActions";
import { useContentActions } from "./content-generator/useContentActions";
import { useKeywordActions } from "./content-generator/useKeywordActions";
import { isPineconeConfigured } from "@/services/vector/pineconeService";

// Export as default instead of a named export
export default function useContentGenerator(domain: string = "", allKeywords: string[] = []) {
  // Get state and dispatch from useContentGeneratorState
  const [state, dispatch] = useContentGeneratorState();
  
  // Extract properties from state for easier access
  const {
    step,
    contentType,
    selectedTemplateId,
    title,
    keywords,
    creativity,
    ragEnabled,
    isGenerating,
    generatedContent,
    contentHtml,
    aiProvider,
    aiModel,
    wordCountOption,
    selectedSubheadings
  } = state;

  // Setup action hooks
  const {
    handleGenerateTopics,
    handleRegenerateTopics,
    handleSelectTopic,
    handleDeleteTopic,
    handleAddCustomTopic
  } = useTopicActions(
    domain, 
    (isLoading) => dispatch({ type: 'SET_IS_LOADING_TOPICS', payload: isLoading }),
    (topics) => dispatch({ type: 'SET_TOPICS', payload: topics }),
    (suggestions) => dispatch({ type: 'SET_TITLE_SUGGESTIONS', payload: suggestions }),
    (topic) => dispatch({ type: 'SET_SELECTED_TOPIC', payload: topic })
  );

  const {
    handleGenerateContent,
    handleSelectTitle,
    handleContentPreferenceToggle,
    handleRagToggle,
    handleContentTypeChange,
    handleCreativityChange,
    handleWordCountChange
  } = useContentActions(
    (isGen) => dispatch({ type: 'SET_IS_GENERATING', payload: isGen }), 
    (content) => dispatch({ type: 'SET_GENERATED_CONTENT', payload: content }), 
    (data) => dispatch({ type: 'SET_CONTENT_DATA', payload: data }), 
    (step: number) => dispatch({ type: 'SET_STEP', payload: step as StepType })
  );

  const { handleGenerateFromKeyword } = useKeywordActions(
    (keywords) => dispatch({ type: 'SET_KEYWORDS', payload: keywords })
  );

  // Listen for the custom event to handle keyword selection from other components
  useEffect(() => {
    const handleGenerateFromKeywordEvent = (event: CustomEvent) => {
      const { primaryKeyword, relatedKeywords } = event.detail;
      if (primaryKeyword) {
        const keywordsToUse = [primaryKeyword];
        if (relatedKeywords && Array.isArray(relatedKeywords)) {
          keywordsToUse.push(...relatedKeywords.slice(0, 2)); // Add up to 2 related keywords
        }
        dispatch({ type: 'SET_KEYWORDS', payload: keywordsToUse });
        handleGenerateTopics(keywordsToUse, contentType); // Automatically generate topics for selected keywords
      }
    };

    window.addEventListener('generate-content-from-keyword', handleGenerateFromKeywordEvent as EventListener);
    
    return () => {
      window.removeEventListener('generate-content-from-keyword', handleGenerateFromKeywordEvent as EventListener);
    };
  }, [contentType]);

  // Helper functions that use dispatch
  const setActiveStep = (step: StepType) => dispatch({ type: 'SET_STEP', payload: step });
  const setContentType = (type: string) => dispatch({ type: 'SET_CONTENT_TYPE', payload: type });
  const setSelectedTemplateId = (id: string) => dispatch({ type: 'SET_TEMPLATE_ID', payload: id });
  const setTitle = (title: string) => dispatch({ type: 'SET_TITLE', payload: title });
  const setSelectedKeywords = (keywords: string[]) => dispatch({ type: 'SET_KEYWORDS', payload: keywords });
  const setCreativity = (value: number) => dispatch({ type: 'SET_CREATIVITY', payload: value });
  const setRagEnabled = (enabled: boolean) => dispatch({ type: 'SET_RAG_ENABLED', payload: enabled });
  const setAIProvider = (provider: AIProvider) => dispatch({ type: 'SET_AI_PROVIDER', payload: provider });
  const setAIModel = (model: string) => dispatch({ type: 'SET_AI_MODEL', payload: model });
  
  // Helper function to toggle content preferences properly
  const toggleContentPreference = (preference: string) => {
    const toggleFunction = handleContentPreferenceToggle(
      (prefs) => dispatch({ type: 'SET_CONTENT_PREFERENCES', payload: prefs }), 
      preference
    );
    toggleFunction(state.contentPreferences || []);
  };

  // Helper function to toggle RAG properly
  const toggleRag = () => {
    const ragToggleFunction = handleRagToggle(setRagEnabled);
    ragToggleFunction(ragEnabled);
  };

  return {
    // State
    activeStep: step,
    contentType,
    selectedTemplateId,
    title,
    selectedKeywords: keywords,
    creativity,
    contentPreferences: state.contentPreferences || [],
    wordCountOption,
    generatedContent,
    generatedContentData: state.contentData,
    isGenerating,
    isLoadingTopics: state.isLoadingTopics || false,
    topics: state.topics || [],
    titleSuggestions: state.titleSuggestions || {},
    selectedTopic: state.selectedTopic || "",
    ragEnabled,
    aiProvider,
    aiModel,
    
    // Actions and setters
    setActiveStep,
    setContentType,
    setSelectedTemplateId,
    setTitle,
    setSelectedKeywords,
    setCreativity,
    setGeneratedContent: (content: GeneratedContent | null) => dispatch({ type: 'SET_GENERATED_CONTENT', payload: content }),
    setGeneratedContentData: (data: any) => dispatch({ type: 'SET_CONTENT_DATA', payload: data }),
    setSelectedTopic: (topic: string) => dispatch({ type: 'SET_SELECTED_TOPIC', payload: topic }),
    setRagEnabled,
    setAIProvider,
    setAIModel,
    
    // Complex action handlers
    handleGenerateTopics: () => handleGenerateTopics(keywords, contentType),
    handleRegenerateTopics: () => handleRegenerateTopics(keywords, contentType),
    handleSelectTopic,
    handleSelectTitle: (selectedTitle: string) => handleSelectTitle(setTitle, selectedTitle),
    handleDeleteTopic: (topic: string) => handleDeleteTopic(state.topics || [], state.selectedTopic || "", topic),
    handleContentTypeChange: (type: string) => handleContentTypeChange(setContentType, type),
    handleCreativityChange: (value: number) => handleCreativityChange(setCreativity, value),
    handleWordCountChange: (value: string) => handleWordCountChange(
      (option) => dispatch({ type: 'SET_WORD_COUNT_OPTION', payload: option }), 
      value
    ),
    handleContentPreferenceToggle: toggleContentPreference,
    handleRagToggle: toggleRag,
    handleGenerateContent: () => handleGenerateContent(
      title,
      keywords,
      contentType,
      state.contentPreferences || [],
      ragEnabled,
      aiProvider,
      aiModel,
      creativity,
      wordCountOption,
      selectedSubheadings
    ),
    handleAddCustomTopic: (topic: string) => 
      handleAddCustomTopic(state.topics || [], keywords, contentType, topic),
    handleGenerateFromKeyword
  };
}

export type { StepType };
