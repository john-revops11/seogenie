
import React from "react";
import { GeneratorForm } from "./GeneratorForm";
import ContentTypeSelector from "./ContentTypeSelector";

interface ContentGeneratorStepOneProps {
  topics: string[];
  titleSuggestions: {[topic: string]: string[]};
  selectedTopic: string;
  selectedKeywords: string[];
  title: string;
  contentType: string;
  creativity: number;
  contentPreferences: string[];
  isLoadingTopics: boolean;
  isGenerating: boolean;
  ragEnabled: boolean;
  onTopicSelect: (topic: string) => void;
  onTitleSelect: (title: string) => void;
  onTopicDelete: (topic: string) => void;
  onContentTypeChange: (value: string) => void;
  onCreativityChange: (value: number) => void;
  onContentPreferenceToggle: (preference: string) => void;
  onGenerateTopics: () => void;
  onRegenerateTopics: () => void;
  onGenerateContent: () => void;
  onCustomTopicAdd: (topic: string) => void;
  onRagToggle: (enabled: boolean) => void;
  onContinue: () => void;
}

const ContentGeneratorStepOne: React.FC<ContentGeneratorStepOneProps> = ({
  topics,
  titleSuggestions,
  selectedTopic,
  selectedKeywords,
  title,
  contentType,
  creativity,
  contentPreferences,
  isLoadingTopics,
  isGenerating,
  ragEnabled,
  onTopicSelect,
  onTitleSelect,
  onTopicDelete,
  onContentTypeChange,
  onCreativityChange,
  onContentPreferenceToggle,
  onGenerateTopics,
  onRegenerateTopics,
  onCustomTopicAdd,
  onRagToggle,
  onContinue
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Step 1: Select Content Type</h3>
      <ContentTypeSelector 
        value={contentType}
        onChange={onContentTypeChange}
      />
      
      <div className="space-y-2 pt-4">
        <GeneratorForm
          topics={topics}
          titleSuggestions={titleSuggestions}
          selectedTopic={selectedTopic}
          selectedKeywords={selectedKeywords}
          title={title}
          contentType={contentType}
          creativity={creativity}
          contentPreferences={contentPreferences}
          isLoadingTopics={isLoadingTopics}
          isGenerating={isGenerating}
          onTopicSelect={onTopicSelect}
          onTitleSelect={onTitleSelect}
          onTopicDelete={onTopicDelete}
          onContentTypeChange={onContentTypeChange}
          onCreativityChange={onCreativityChange}
          onContentPreferenceToggle={onContentPreferenceToggle}
          onGenerateTopics={onGenerateTopics}
          onRegenerateTopics={onRegenerateTopics}
          onGenerateContent={onContinue}
          onCustomTopicAdd={onCustomTopicAdd}
          ragEnabled={ragEnabled}
          onRagToggle={onRagToggle}
        />
      </div>
    </div>
  );
};

export default ContentGeneratorStepOne;
