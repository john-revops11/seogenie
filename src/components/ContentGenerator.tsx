
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TopicGenerationHandler from "./content-generator/TopicGenerationHandler";
import GeneratedContent from "./content-generator/GeneratedContent";
import { useContentGenerator } from "@/hooks/useContentGenerator";
import ContentGeneratorStepOne from "./content-generator/ContentGeneratorStepOne";
import ContentGeneratorStepTwo from "./content-generator/ContentGeneratorStepTwo";
import ContentGeneratorStepThree from "./content-generator/ContentGeneratorStepThree";
import ContentGeneratorStepFour from "./content-generator/ContentGeneratorStepFour";

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
    
    // State setters
    setGeneratedContent,
    setGeneratedContentData,
    
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
    handleAddCustomTopic
  } = useContentGenerator(domain, allKeywords);

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
            onContentUpdate={content => generatedContentData && setGeneratedContent(content)}
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
