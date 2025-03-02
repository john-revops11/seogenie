
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GeneratorForm } from "./content-generator/GeneratorForm";
import TopicGenerationHandler from "./content-generator/TopicGenerationHandler";
import GeneratedContent from "./content-generator/GeneratedContent";
import { useContentGenerator } from "@/hooks/useContentGenerator";

interface ContentGeneratorProps {
  domain: string;
  allKeywords: string[];
}

const ContentGenerator: React.FC<ContentGeneratorProps> = ({ domain, allKeywords }) => {
  const {
    topics,
    titleSuggestions,
    selectedTopic,
    title,
    contentType,
    creativity,
    contentPreferences,
    generatedContent,
    isLoadingTopics,
    isGenerating,
    ragEnabled,
    selectedKeywords,
    handleGenerateFromKeyword,
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
    handleAddCustomTopic
  } = useContentGenerator({ domain, allKeywords });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <TopicGenerationHandler onGenerateFromKeyword={handleGenerateFromKeyword} />
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>AI Content Generator</CardTitle>
          </CardHeader>
          <CardContent>
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
              onTopicSelect={handleSelectTopic}
              onTitleSelect={handleSelectTitle}
              onTopicDelete={handleDeleteTopic}
              onContentTypeChange={handleContentTypeChange}
              onCreativityChange={handleCreativityChange}
              onContentPreferenceToggle={handleContentPreferenceToggle}
              onGenerateTopics={handleGenerateTopics}
              onRegenerateTopics={handleRegenerateTopics}
              onGenerateContent={handleGenerateContent}
              onCustomTopicAdd={handleAddCustomTopic}
              ragEnabled={ragEnabled}
              onRagToggle={handleRagToggle}
            />
          </CardContent>
        </Card>
      </div>
      
      {generatedContent && (
        <div className="space-y-4">
          <GeneratedContent 
            generatedContent={generatedContent} 
            contentType={contentType} 
          />
        </div>
      )}
    </div>
  );
};

export default ContentGenerator;
