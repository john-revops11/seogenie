
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GeneratedContent } from "@/services/keywords/types";
import ContentGeneratorSteps from "./ContentGeneratorSteps";
import { useContentTemplates } from "@/hooks/content-generator/contentTemplates";
import ContentGeneratorStateManager from "./state/ContentGeneratorStateManager";
import ContentGeneratorStepRenderer from "./steps/ContentGeneratorStepRenderer";
import ContentGeneratorBackgroundWorker from "./workers/ContentGeneratorBackgroundWorker";

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
  const { templates } = useContentTemplates();
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Content Generator</CardTitle>
      </CardHeader>
      <CardContent>
        <ContentGeneratorStateManager
          domain={domain}
          selectedKeywords={selectedKeywords}
          initialTitle={initialTitle}
          saveToHistory={saveToHistory}
        >
          {({ state, dispatch, handleContentGenerated, setBackgroundGenerationActive, backgroundGenerationActive }) => (
            <>
              <ContentGeneratorSteps step={state.step} stepLabels={["Content Type", "Content Details", "Subheadings", "AI Settings", "Preview"]} />
              
              <form onSubmit={(e) => e.preventDefault()}>
                <ContentGeneratorStepRenderer 
                  step={state.step}
                  state={state}
                  dispatch={dispatch}
                  domain={domain}
                  templates={templates}
                  saveToHistory={saveToHistory}
                />
                
                {/* Only initialize the background worker when needed */}
                {state.isGenerating && (
                  <ContentGeneratorBackgroundWorker
                    isGenerating={state.isGenerating}
                    domain={domain}
                    contentGeneratorState={state}
                    onContentGenerated={handleContentGenerated}
                    onSetBackgroundActive={setBackgroundGenerationActive}
                  />
                )}
              </form>
            </>
          )}
        </ContentGeneratorStateManager>
      </CardContent>
    </Card>
  );
};

export default ContentGeneratorContainer;
