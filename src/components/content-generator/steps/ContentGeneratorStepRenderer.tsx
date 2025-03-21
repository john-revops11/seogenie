
import React from "react";
import { StepType } from "@/hooks/content-generator/useContentGeneratorState";
import ContentGeneratorStepOne from "../ContentGeneratorStepOne";
import ContentGeneratorStepTwo from "../ContentGeneratorStepTwo";
import SubheadingRecommendations from "../SubheadingRecommendations";
import ContentGeneratorStepThree from "../ContentGeneratorStepThree";
import ContentPreview from "../ContentPreview";
import { GeneratedContent } from "@/services/keywords/types";
import { toast } from "sonner";

interface ContentGeneratorStepRendererProps {
  step: StepType;
  state: any;
  dispatch: (action: any) => void;
  domain: string;
  templates: any[];
  saveToHistory: (content: GeneratedContent) => Promise<void>;
}

const ContentGeneratorStepRenderer: React.FC<ContentGeneratorStepRendererProps> = ({
  step,
  state,
  dispatch,
  domain,
  templates,
  saveToHistory
}) => {
  const stepLabels = ["Content Type", "Content Details", "Subheadings", "AI Settings", "Preview"];

  switch (step) {
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
          contentPreferences={state.contentPreferences || []}
          selectedPreferences={state.contentPreferences || []}
          wordCountOption={state.wordCountOption}
          contentType={state.contentType}
          onTitleChange={(title) => dispatch({ type: 'SET_TITLE', payload: title })}
          onKeywordsChange={(keywords) => dispatch({ type: 'SET_KEYWORDS', payload: keywords })}
          onCreativityChange={(value) => dispatch({ type: 'SET_CREATIVITY', payload: value })}
          onRagToggle={(enabled) => dispatch({ type: 'SET_RAG_ENABLED', payload: enabled })}
          onTogglePreference={(preference) => {
            const currentPreferences = state.contentPreferences || [];
            const updatedPreferences = currentPreferences.includes(preference)
              ? currentPreferences.filter(p => p !== preference)
              : [...currentPreferences, preference];
            dispatch({ type: 'SET_CONTENT_PREFERENCES', payload: updatedPreferences });
          }}
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
          onGenerateContent={() => dispatch({ type: 'SET_IS_GENERATING', payload: true })}
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
          saveToHistory={saveToHistory}
        />
      );
    default:
      return null;
  }
};

export default ContentGeneratorStepRenderer;
