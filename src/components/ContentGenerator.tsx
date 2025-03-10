
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TopicGenerationHandler from "./content-generator/TopicGenerationHandler";
import GeneratedContent from "./content-generator/GeneratedContent";
import useContentGenerator from "@/hooks/useContentGenerator";
import ContentGeneratorStepOne from "./content-generator/ContentGeneratorStepOne";
import ContentGeneratorStepTwo from "./content-generator/ContentGeneratorStepTwo";
import ContentGeneratorStepThree from "./content-generator/ContentGeneratorStepThree";
import ContentGeneratorStepFour from "./content-generator/ContentGeneratorStepFour";
import ContentHistory from "./content-generator/ContentHistory";
import { GeneratedContent as GeneratedContentType } from "@/services/keywords/types";
import { useEffect, useState } from "react";
import { keywordGapsCache } from "./keyword-gaps/KeywordGapUtils";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, History } from "lucide-react";
import { useContentHistory } from "@/hooks/content-generator/useContentHistory";

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
        console.log("Setting keywords from event:", keywordsToUse);
        // Update cache with the new keywords
        keywordGapsCache.selectedKeywords = keywordsToUse;
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
    
    // Save to history
    if (contentData.title && contentData.blocks.length > 0) {
      // Add aiProvider and aiModel to contentData before saving
      const contentToSave = {
        ...contentData,
        aiProvider,
        aiModel
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
    <div className="w-full">
      <TopicGenerationHandler onGenerateFromKeyword={handleGenerateFromKeyword} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>AI Content Generator</CardTitle>
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "generator" | "history")} className="ml-auto">
                  <TabsList>
                    <TabsTrigger value="generator" className="flex items-center">
                      <FileText className="mr-2 h-4 w-4" />
                      Generator
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex items-center">
                      <History className="mr-2 h-4 w-4" />
                      History
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              {activeTab === "generator" ? (
                renderStepContent()
              ) : (
                <ContentHistory />
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Generated Content Panel - Always visible on desktop, only when content exists on mobile */}
        {(generatedContent || activeStep === 4) && activeTab === "generator" && (
          <div className="space-y-4">
            {activeStep === 4 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  {generatedContent && (
                    <GeneratedContent 
                      generatedContent={generatedContent} 
                      contentType={contentType} 
                    />
                  )}
                </CardContent>
              </Card>
            ) : (
              <GeneratedContent 
                generatedContent={generatedContent} 
                contentType={contentType} 
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentGenerator;
