
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import ContentGeneratorSteps from "./ContentGeneratorSteps";
import ContentGeneratorStepOne from "./ContentGeneratorStepOne";
import ContentGeneratorStepTwo from "./ContentGeneratorStepTwo";
import ContentGeneratorStepThree from "./ContentGeneratorStepThree";
import ContentPreview from "./ContentPreview";
import SubheadingRecommendations from "./SubheadingRecommendations";
import { useContentTemplates } from "@/hooks/content-generator/contentTemplates";
import { useContentPreferences } from "@/hooks/content-generator/contentPreferences";
import { useContentGeneratorState } from "@/hooks/content-generator/useContentGeneratorState";
import { GeneratedContent } from "@/services/keywords/types";
import { supabase } from "@/integrations/supabase/client";

interface ContentGeneratorContainerProps {
  domain: string;
  selectedKeywords?: string[];
  initialTitle?: string;
  saveToHistory: (content: GeneratedContent) => Promise<void>;
}

const ContentGeneratorContainer: React.FC<ContentGeneratorContainerProps> = ({
  domain,
  selectedKeywords = [],
  initialTitle = "",
  saveToHistory
}) => {
  const [state, dispatch, applyRestoredState] = useContentGeneratorState();
  const { templates } = useContentTemplates();
  const { contentPreferences, selectedPreferences, togglePreference } = useContentPreferences();
  const [backgroundGenerationActive, setBackgroundGenerationActive] = useState(false);
  
  // Load state from localStorage on initial render
  useEffect(() => {
    const savedState = localStorage.getItem('contentGeneratorState');
    
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        // Only restore if we have generated content
        if (parsedState.generatedContent || parsedState.contentHtml) {
          applyRestoredState(parsedState);
          toast.info("Restored previously generated content");
          return; // Skip the reset if we restored state
        }
      } catch (error) {
        console.error("Error parsing saved content generator state:", error);
      }
    }
    
    // If no saved state or error, reset to initial state
    dispatch({ type: 'RESET_STATE' });
    
    if (selectedKeywords && selectedKeywords.length > 0) {
      dispatch({ type: 'SET_KEYWORDS', payload: selectedKeywords });
    }
    
    if (initialTitle && initialTitle.trim() !== "") {
      dispatch({ type: 'SET_TITLE', payload: initialTitle });
    }
  }, []);
  
  // Check for background generation on window focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && backgroundGenerationActive) {
        setBackgroundGenerationActive(false);
        toast.success("Content generation completed in background");
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [backgroundGenerationActive]);
  
  // Save state to localStorage whenever it changes
  useEffect(() => {
    // Only save state if we have generated content
    if (state.generatedContent || state.contentHtml) {
      const stateToSave = {
        ...state,
        isGenerating: false // Always save with isGenerating = false
      };
      localStorage.setItem('contentGeneratorState', JSON.stringify(stateToSave));
    }
  }, [state]);
  
  useEffect(() => {
    if (selectedKeywords && selectedKeywords.length > 0) {
      dispatch({ type: 'SET_KEYWORDS', payload: selectedKeywords });
    }
  }, [JSON.stringify(selectedKeywords)]);
  
  const stepLabels = ["Content Type", "Content Details", "Subheadings", "AI Settings", "Preview"];

  const renderStepContent = () => {
    switch (state.step) {
      case 1:
        return (
          <ContentGeneratorStepOne
            contentType={state.contentType}
            selectedTemplateId={state.selectedTemplateId}
            templates={templates}
            onContentTypeChange={(type) => dispatch({ type: 'SET_CONTENT_TYPE', payload: type })}
            onTemplateChange={(templateId) => dispatch({ type: 'SET_TEMPLATE_ID', payload: templateId })}
            onNext={() => {
              if (!state.contentType) {
                toast.error("Please select a content type");
                return;
              }
              dispatch({ type: 'SET_STEP', payload: 2 });
            }}
          />
        );
      case 2:
        return (
          <ContentGeneratorStepTwo
            title={state.title}
            keywords={state.keywords}
            creativity={state.creativity}
            ragEnabled={state.ragEnabled}
            contentPreferences={contentPreferences}
            selectedPreferences={selectedPreferences}
            wordCountOption={state.wordCountOption}
            contentType={state.contentType}
            onTitleChange={(title) => dispatch({ type: 'SET_TITLE', payload: title })}
            onKeywordsChange={(keywords) => dispatch({ type: 'SET_KEYWORDS', payload: keywords })}
            onCreativityChange={(value) => dispatch({ type: 'SET_CREATIVITY', payload: value })}
            onRagToggle={(enabled) => dispatch({ type: 'SET_RAG_ENABLED', payload: enabled })}
            onTogglePreference={togglePreference}
            onWordCountOptionChange={(option) => dispatch({ type: 'SET_WORD_COUNT_OPTION', payload: option })}
            onNext={() => {
              if (!state.title) {
                toast.error("Please enter a title");
                return;
              }
              
              if (state.keywords.length === 0) {
                toast.error("Please add at least one keyword");
                return;
              }
              
              dispatch({ type: 'SET_STEP', payload: 3 });
            }}
            onBack={() => dispatch({ type: 'SET_STEP', payload: 1 })}
          />
        );
      case 3:
        return (
          <SubheadingRecommendations
            title={state.title}
            keywords={state.keywords}
            contentType={state.contentType}
            onSubheadingsSelected={(subheadings) => {
              dispatch({ type: 'SET_SUBHEADINGS', payload: subheadings });
              dispatch({ type: 'SET_STEP', payload: 4 });
            }}
            onBack={() => dispatch({ type: 'SET_STEP', payload: 2 })}
          />
        );
      case 5:
        return (
          <ContentPreview
            content={state.contentHtml}
            generatedContent={state.generatedContent}
            onBack={() => dispatch({ type: 'SET_STEP', payload: 4 })}
            onRegenerateContent={async () => {
              dispatch({ type: 'SET_IS_GENERATING', payload: true });
              dispatch({ type: 'SET_STEP', payload: 4 });
              
              setTimeout(() => {
                dispatch({ type: 'SET_IS_GENERATING', payload: false });
              }, 500);
            }}
            isGenerating={state.isGenerating}
          />
        );
      default:
        return null;
    }
  };

  // Function to handle content generation success
  const handleContentGenerated = async (result) => {
    dispatch({ type: 'SET_CONTENT_HTML', payload: result.content });
    dispatch({ type: 'SET_GENERATED_CONTENT', payload: result.generatedContent });
    
    // Save the generated content to history in Supabase
    try {
      await saveToHistory(result.generatedContent);
    } catch (error) {
      console.error("Error saving to history:", error);
      // Continue even if saving to history fails - don't block the user
    }
    
    toast.success("Content generated successfully!");
    dispatch({ type: 'SET_STEP', payload: 5 });
    setBackgroundGenerationActive(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Content Generator</CardTitle>
      </CardHeader>
      <CardContent>
        <ContentGeneratorSteps step={state.step} stepLabels={stepLabels} />
        <form onSubmit={(e) => e.preventDefault()}>
          {state.step === 4 && (
            <ContentGeneratorStepThree
              contentType={state.contentType}
              selectedTemplateId={state.selectedTemplateId}
              title={state.title}
              selectedKeywords={state.keywords}
              creativity={state.creativity}
              ragEnabled={state.ragEnabled}
              isGenerating={state.isGenerating}
              aiProvider={state.aiProvider}
              aiModel={state.aiModel}
              wordCountOption={state.wordCountOption}
              customSubheadings={state.selectedSubheadings}
              onAIProviderChange={(provider) => dispatch({ type: 'SET_AI_PROVIDER', payload: provider })}
              onAIModelChange={(model) => dispatch({ type: 'SET_AI_MODEL', payload: model })}
              onGenerateContent={async () => {
                dispatch({ type: 'SET_IS_GENERATING', payload: true });
                setBackgroundGenerationActive(true);
                
                try {
                  const { generateContent } = await import("@/hooks/content-generator/contentGenerator");
                  // Create background worker to handle content generation
                  const worker = new Worker(
                    URL.createObjectURL(
                      new Blob([
                        `self.onmessage = async (e) => {
                          const { domain, keywords, contentType, title, creativity, contentPreferences, templateId, aiProvider, aiModel, ragEnabled, wordCountOption, customSubheadings } = e.data;
                          
                          try {
                            // Import would not work in a worker so we'll post a message to handle it in the main thread
                            self.postMessage({ type: 'status', status: 'generating' });
                          } catch (error) {
                            self.postMessage({ type: 'error', error: error.toString() });
                          }
                        }`
                      ], { type: 'application/javascript' })
                    )
                  );
                  
                  worker.onmessage = async (e) => {
                    if (e.data.type === 'status' && e.data.status === 'generating') {
                      // Perform generation in main thread since imports won't work in worker
                      try {
                        const result = await generateContent({
                          domain,
                          keywords: state.keywords,
                          contentType: state.contentType,
                          title: state.title,
                          creativity: state.creativity,
                          contentPreferences: selectedPreferences,
                          templateId: state.selectedTemplateId,
                          aiProvider: state.aiProvider,
                          aiModel: state.aiModel,
                          ragEnabled: state.ragEnabled,
                          wordCountOption: state.wordCountOption,
                          customSubheadings: state.selectedSubheadings
                        });
                        
                        // Use the handler to process the result
                        await handleContentGenerated(result);
                      } catch (error) {
                        console.error("Error generating content:", error);
                        toast.error(`Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`);
                        dispatch({ type: 'SET_IS_GENERATING', payload: false });
                        setBackgroundGenerationActive(false);
                      }
                      
                      worker.terminate();
                    } else if (e.data.type === 'error') {
                      console.error("Worker error:", e.data.error);
                      toast.error(`Failed to generate content: ${e.data.error}`);
                      dispatch({ type: 'SET_IS_GENERATING', payload: false });
                      setBackgroundGenerationActive(false);
                      worker.terminate();
                    }
                  };
                  
                  // Start the worker
                  worker.postMessage({
                    domain,
                    keywords: state.keywords,
                    contentType: state.contentType,
                    title: state.title,
                    creativity: state.creativity,
                    contentPreferences: selectedPreferences,
                    templateId: state.selectedTemplateId,
                    aiProvider: state.aiProvider,
                    aiModel: state.aiModel,
                    ragEnabled: state.ragEnabled,
                    wordCountOption: state.wordCountOption,
                    customSubheadings: state.selectedSubheadings
                  });
                  
                  // Notify the user that generation will continue in the background
                  if (document.hidden) {
                    toast.info("Content generation will continue in the background");
                  }
                } catch (error) {
                  console.error("Error generating content:", error);
                  toast.error(`Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`);
                  dispatch({ type: 'SET_IS_GENERATING', payload: false });
                  setBackgroundGenerationActive(false);
                }
              }}
              onBack={() => dispatch({ type: 'SET_STEP', payload: 3 })}
            />
          )}
          {state.step !== 4 && renderStepContent()}
        </form>
      </CardContent>
    </Card>
  );
};

export default ContentGeneratorContainer;
