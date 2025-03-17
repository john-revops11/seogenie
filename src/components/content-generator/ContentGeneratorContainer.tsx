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
import { generateContent } from "@/hooks/content-generator/contentGenerator";

interface ContentGeneratorContainerProps {
  domain: string;
  selectedKeywords?: string[];
  initialTitle?: string;
}

const ContentGeneratorContainer: React.FC<ContentGeneratorContainerProps> = ({
  domain,
  selectedKeywords = [],
  initialTitle = ""
}) => {
  const [state, dispatch, applyRestoredState] = useContentGeneratorState();
  const { templates } = useContentTemplates();
  const { contentPreferences, selectedPreferences, togglePreference } = useContentPreferences();
  
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
      case 4:
        return (
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
              
              try {
                const { generateContent } = await import("@/hooks/content-generator/contentGenerator");
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
                
                dispatch({ type: 'SET_CONTENT_HTML', payload: result.content });
                dispatch({ type: 'SET_GENERATED_CONTENT', payload: result.generatedContent });
                
                toast.success("Content generated successfully!");
                dispatch({ type: 'SET_STEP', payload: 5 });
              } catch (error) {
                console.error("Error generating content:", error);
                toast.error(`Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`);
              } finally {
                dispatch({ type: 'SET_IS_GENERATING', payload: false });
              }
            }}
            onBack={() => dispatch({ type: 'SET_STEP', payload: 3 })}
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Content Generator</CardTitle>
      </CardHeader>
      <CardContent>
        <ContentGeneratorSteps step={state.step} stepLabels={stepLabels} />
        <form onSubmit={(e) => e.preventDefault()}>
          {renderStepContent()}
        </form>
      </CardContent>
    </Card>
  );
};

export default ContentGeneratorContainer;
