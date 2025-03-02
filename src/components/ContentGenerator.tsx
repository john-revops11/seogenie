
import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GeneratorForm } from "./content-generator/GeneratorForm";
import TopicGenerationHandler from "./content-generator/TopicGenerationHandler";
import GeneratedContent from "./content-generator/GeneratedContent";
import { useContentGenerator } from "@/hooks/useContentGenerator";
import { isPineconeConfigured } from "@/services/vector/pineconeService";
import { toast } from "sonner";

interface ContentGeneratorProps {
  domain: string;
  allKeywords: string[];
}

const ContentGenerator: React.FC<ContentGeneratorProps> = ({ domain, allKeywords }) => {
  // Check if Pinecone config was updated
  useEffect(() => {
    // This effect will run whenever the component mounts or re-renders
    const pineconeConfigured = isPineconeConfigured();
    console.log("Pinecone configuration status:", pineconeConfigured);
  }, []);

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

  // Listen for generate-content-from-keyword event
  useEffect(() => {
    const handleEvent = (event: CustomEvent<{ primaryKeyword: string, relatedKeywords: string[] }>) => {
      const { primaryKeyword, relatedKeywords } = event.detail;
      console.log("Received event to generate content from keyword:", primaryKeyword, relatedKeywords);
      handleGenerateFromKeyword(primaryKeyword, relatedKeywords);
    };

    window.addEventListener('generate-content-from-keyword', handleEvent as EventListener);
    
    return () => {
      window.removeEventListener('generate-content-from-keyword', handleEvent as EventListener);
    };
  }, [handleGenerateFromKeyword]);

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
