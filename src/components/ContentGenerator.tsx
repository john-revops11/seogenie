
import { useState, useEffect } from "react";
import TopicGenerationHandler from "./content-generator/TopicGenerationHandler";
import useContentGenerator from "@/hooks/useContentGenerator";
import ContentGeneratorStepOne from "./content-generator/ContentGeneratorStepOne";
import ContentGeneratorStepTwo from "./content-generator/ContentGeneratorStepTwo";
import ContentGeneratorStepThree from "./content-generator/ContentGeneratorStepThree";
import ContentGeneratorStepFour from "./content-generator/ContentGeneratorStepFour";
import ContentHistory from "./content-generator/ContentHistory";
import { keywordGapsCache } from "./keyword-gaps/KeywordGapUtils";
import { toast } from "sonner";
import { useContentHistory } from "@/hooks/content-generator/useContentHistory";
import ContentGeneratorLayout from "./content-generator/ContentGeneratorLayout";
import ContentGeneratorRightPanel from "./content-generator/ContentGeneratorRightPanel";
import KeywordEventHandler from "./content-generator/KeywordEventHandler";

interface ContentGeneratorProps {
  domain: string;
  allKeywords: string[];
}

const ContentGenerator: React.FC<ContentGeneratorProps> = ({ domain, allKeywords }) => {
  const [activeTab, setActiveTab] = useState<"generator" | "history">("generator");
  
  const {
    // State
    topics,
    titleSuggestions,
    selectedTopic,
    title,
    contentType,
    creativity,
    contentPreferences,
    wordCountOption,
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
    handleWordCountChange,
    handleRagToggle,
    handleGenerateContent,
    handleAddCustomTopic,
    setAIProvider,
    setAIModel
  } = useContentGenerator(domain, allKeywords);

  const { saveToHistory } = useContentHistory();

  // Sync selected keywords from cache when component mounts
  useEffect(() => {
    const cachedKeywords = keywordGapsCache.selectedKeywords || [];
    if (cachedKeywords.length > 0) {
      console.log("Loaded selected keywords from cache:", cachedKeywords);
      setSelectedKeywords(cachedKeywords);
    } else if (allKeywords && allKeywords.length > 0) {
      // Take up to 3 keywords from allKeywords if no cached keywords
      const initialKeywords = allKeywords.slice(0, 3);
      console.log("Initializing with keywords from props:", initialKeywords);
      setSelectedKeywords(initialKeywords);
    }
  }, []);

  // Add function to handle keyword removal
  const handleRemoveKeyword = (keyword: string) => {
    const updatedKeywords = selectedKeywords.filter(k => k !== keyword);
    setSelectedKeywords(updatedKeywords);
    // Also update the cache
    keywordGapsCache.selectedKeywords = updatedKeywords;
    console.log("Removed keyword:", keyword, "Updated keywords:", updatedKeywords);
    
    if (updatedKeywords.length === 0) {
      toast.warning("No keywords selected. Topics may not be as SEO-optimized.");
    }
  };

  // Handle content data update with proper type conversion
  const handleContentDataUpdate = (contentData: any) => {
    // Safely update generatedContentData with the incoming data
    setGeneratedContentData(contentData);
    
    // Convert blocks to HTML string
    const contentHtml = contentData.blocks.map((block: any) => block.content).join('\n');
    
    // Update the generatedContent with the new format
    setGeneratedContent({
      title: contentData.title,
      metaDescription: contentData.metaDescription,
      outline: contentData.outline,
      content: contentHtml
    });
    
    // Save to history
    if (contentData.title && contentData.blocks.length > 0) {
      // Add aiProvider and aiModel to contentData before saving
      const contentToSave = {
        ...contentData,
        aiProvider,
        aiModel,
        wordCountOption
      };
      saveToHistory(contentToSave);
    }
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
            wordCountOption={wordCountOption}
            isLoadingTopics={isLoadingTopics}
            isGenerating={isGenerating}
            ragEnabled={ragEnabled}
            onTopicSelect={handleSelectTopic}
            onTitleSelect={handleSelectTitle}
            onTopicDelete={handleDeleteTopic}
            onContentTypeChange={handleContentTypeChange}
            onCreativityChange={handleCreativityChange}
            onContentPreferenceToggle={handleContentPreferenceToggle}
            onWordCountChange={handleWordCountChange}
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
            wordCountOption={wordCountOption}
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

  // Determine if we should show the right panel with editor and preview
  const shouldShowRightPanel = activeStep === 4 || (generatedContent && activeTab === "generator");

  return (
    <div className="w-full">
      <TopicGenerationHandler onGenerateFromKeyword={handleGenerateFromKeyword} />
      <KeywordEventHandler 
        onGenerateFromKeyword={handleGenerateFromKeyword}
        setSelectedKeywords={setSelectedKeywords}
        handleGenerateTopics={handleGenerateTopics}
      />
      
      <ContentGeneratorLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        generatorContent={renderStepContent()}
        historyContent={<ContentHistory />}
        editorContent={
          activeStep === 4 && generatedContentData ? (
            <ContentGeneratorRightPanel
              showEditor={activeStep === 4}
              generatedContent={generatedContent}
              generatedContentData={generatedContentData}
              contentType={contentType}
              onContentUpdate={handleContentDataUpdate}
            />
          ) : null
        }
        previewContent={
          generatedContent && activeTab === "generator" && activeStep !== 4 ? (
            <ContentGeneratorRightPanel
              showEditor={false}
              generatedContent={generatedContent}
              generatedContentData={generatedContentData}
              contentType={contentType}
              onContentUpdate={handleContentDataUpdate}
            />
          ) : null
        }
        shouldShowRightPanel={shouldShowRightPanel}
      />
    </div>
  );
};

export default ContentGenerator;
