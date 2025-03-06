import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TopicGenerationHandler from "./content-generator/TopicGenerationHandler";
import GeneratedContent from "./content-generator/GeneratedContent";
import useContentGenerator from "@/hooks/useContentGenerator";
import ContentGeneratorStepOne from "./content-generator/ContentGeneratorStepOne";
import ContentGeneratorStepTwo from "./content-generator/ContentGeneratorStepTwo";
import ContentGeneratorStepThree from "./content-generator/ContentGeneratorStepThree";
import ContentGeneratorStepFour from "./content-generator/ContentGeneratorStepFour";
import { GeneratedContent as GeneratedContentType } from "@/services/keywords/types";
import { useEffect } from "react";

interface ContentGeneratorProps {
  domain: string;
  allKeywords: string[];
}

const ContentGenerator: React.FC<ContentGeneratorProps> = ({ domain, allKeywords }) => {
  const {
    // State
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
    activeStep,
    selectedTemplateId,
    generatedContentData,
    selectedKeywords,
    aiProvider,
    aiModel,
    
    // State setters
    setGeneratedContent,
    setGeneratedContentData,
    setSelectedKeywords,
    
    // Actions
    setActiveStep,
    setSelectedTemplateId,
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
    handleAddCustomTopic,
    setAIProvider,
    setAIModel
  } = useContentGenerator(domain, allKeywords);

  // Update selected keywords when allKeywords prop changes
  useEffect(() => {
    if (allKeywords && allKeywords.length > 0) {
      // Take up to 3 keywords from allKeywords
      const initialKeywords = allKeywords.slice(0, 3);
      setSelectedKeywords(initialKeywords);
    }
  }, [allKeywords, setSelectedKeywords]);

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
        handleGenerateTopics(); // Automatically generate topics for selected keywords
      }
    };

    window.addEventListener('generate-content-from-keyword', handleGenerateFromKeywordEvent as EventListener);
    
    return () => {
      window.removeEventListener('generate-content-from-keyword', handleGenerateFromKeywordEvent as EventListener);
    };
  }, [handleGenerateTopics, setSelectedKeywords]);

  // Add function to handle keyword removal
  const handleRemoveKeyword = (keyword: string) => {
    setSelectedKeywords(selectedKeywords.filter(k => k !== keyword));
  };

  // Handle content data update with proper type conversion
  const handleContentDataUpdate = (contentData: GeneratedContentType) => {
    // Safely update generatedContentData with the incoming data
    setGeneratedContentData(contentData);
    
    // Convert blocks to HTML string
    const contentHtml = contentData.blocks.map(block => block.content).join('\n');
    
    // Update the generatedContent with the new format
    setGeneratedContent({
      title: contentData.title,
      metaDescription: contentData.metaDescription,
      outline: contentData.outline,
      content: contentHtml
    });
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return (
          <ContentGeneratorStepOne 
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
            ragEnabled={ragEnabled}
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
            onRagToggle={handleRagToggle}
            onContinue={() => setActiveStep(2)}
            onKeywordRemove={handleRemoveKeyword}
          />
        );
        
      case 2:
        return (
          <ContentGeneratorStepTwo 
            contentType={contentType}
            selectedTemplateId={selectedTemplateId}
            onSelectTemplate={setSelectedTemplateId}
            onBack={() => setActiveStep(1)}
            onContinue={() => setActiveStep(3)}
          />
        );
        
      case 3:
        return (
          <ContentGeneratorStepThree 
            contentType={contentType}
            selectedTemplateId={selectedTemplateId}
            title={title}
            selectedKeywords={selectedKeywords}
            creativity={creativity}
            ragEnabled={ragEnabled}
            isGenerating={isGenerating}
            aiProvider={aiProvider}
            aiModel={aiModel}
            onAIProviderChange={setAIProvider}
            onAIModelChange={setAIModel}
            onGenerateContent={handleGenerateContent}
            onBack={() => setActiveStep(2)}
          />
        );
        
      case 4:
        return (
          <ContentGeneratorStepFour 
            generatedContent={generatedContent}
            generatedContentData={generatedContentData}
            contentType={contentType}
            onContentUpdate={handleContentDataUpdate}
            onBack={() => setActiveStep(3)}
          />
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <TopicGenerationHandler onGenerateFromKeyword={handleGenerateFromKeyword} />
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>AI Content Generator</CardTitle>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>
      </div>
      
      {generatedContent && activeStep !== 4 && (
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
