
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { generateContent, getAvailableContentTemplates, getSuggestedTitles } from "@/services/keywords/contentGeneration";
import { generateTopicSuggestions } from "@/utils/topicGenerator";
import { GeneratorForm } from "./content-generator/GeneratorForm";
import TopicGenerationHandler from "./content-generator/TopicGenerationHandler";
import GeneratedContent from "./content-generator/GeneratedContent";
import ContentEditor from "./content-generator/ContentEditor";
import { useKeywordGaps } from "@/hooks/useKeywordGaps";
import { isPineconeConfigured } from "@/services/vector/pineconeService";
import ContentTypeSelector from "./content-generator/ContentTypeSelector";
import TemplateSelector from "./content-generator/TemplateSelector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneratedContent as GeneratedContentType } from "@/services/keywords/types";

interface ContentGeneratorProps {
  domain: string;
  allKeywords: string[];
}

const ContentGenerator: React.FC<ContentGeneratorProps> = ({ domain, allKeywords }) => {
  const [topics, setTopics] = useState<string[]>([]);
  const [titleSuggestions, setTitleSuggestions] = useState<{[topic: string]: string[]}>({});
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [contentType, setContentType] = useState<string>("blog");
  const [creativity, setCreativity] = useState<number>(50);
  const [contentPreferences, setContentPreferences] = useState<string[]>([]);
  const [generatedContent, setGeneratedContent] = useState<{
    title: string;
    metaDescription: string;
    outline: string[];
    content: string;
  } | null>(null);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [ragEnabled, setRagEnabled] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [generatedContentData, setGeneratedContentData] = useState<GeneratedContentType | null>(null);
  const { keywordGaps, seoRecommendations, selectedKeywords, handleSelectKeywords } = useKeywordGaps();

  useEffect(() => {
    if (isPineconeConfigured()) {
      toast.success("Pinecone RAG is available for enhanced content generation");
    }
  }, []);

  useEffect(() => {
    try {
      const savedPreferences = localStorage.getItem('contentPreferences');
      if (savedPreferences) {
        setContentPreferences(JSON.parse(savedPreferences));
      }
    } catch (error) {
      console.error("Error loading saved preferences:", error);
    }
  }, []);

  useEffect(() => {
    if (contentPreferences.length > 0) {
      localStorage.setItem('contentPreferences', JSON.stringify(contentPreferences));
    }
  }, [contentPreferences]);

  const handleGenerateFromKeyword = (primaryKeyword: string, relatedKeywords: string[]) => {
    const topicSuggestion = `${primaryKeyword} Guide: Best Practices and Strategies`;
    setTopics(prev => [...prev, topicSuggestion]);
    setSelectedTopic(topicSuggestion);
    
    const titleSuggestions = [
      `Ultimate Guide to ${primaryKeyword}: Everything You Need to Know`,
      `${primaryKeyword} in ${new Date().getFullYear()}: Trends and Insights`,
      `How to Master ${primaryKeyword} for Your Business`,
      `The Complete ${primaryKeyword} Playbook for Success`,
      `${primaryKeyword}: Expert Strategies and Tips`
    ];
    
    setTitleSuggestions(prev => ({ 
      ...prev, 
      [topicSuggestion]: titleSuggestions 
    }));
    
    setTitle(titleSuggestions[0]);
    
    handleSelectKeywords([primaryKeyword, ...relatedKeywords]);
    
    setActiveStep(1);
    
    console.log(`ContentGenerator: Received keyword "${primaryKeyword}" with related keywords:`, relatedKeywords);
  };

  const handleGenerateTopics = async () => {
    setIsLoadingTopics(true);
    try {
      const newTopics = generateTopicSuggestions(domain, keywordGaps, seoRecommendations, selectedKeywords);
      setTopics(newTopics);
      
      const newTitleSuggestions: {[topic: string]: string[]} = {};
      newTopics.forEach(topic => {
        newTitleSuggestions[topic] = [
          `The Ultimate Guide to ${topic}`,
          `How to Use ${topic} to Improve Your Business`,
          `Top ${topic} Strategies for Success`,
          `Everything You Need to Know About ${topic}`,
          `The Future of ${topic}: Trends and Predictions`
        ];
      });
      setTitleSuggestions(newTitleSuggestions);
      
      toast.success(`Generated ${newTopics.length} SEO topics`);
    } catch (error) {
      console.error("Error generating topics:", error);
      toast.error(`Failed to generate topics: ${(error as Error).message}`);
    } finally {
      setIsLoadingTopics(false);
    }
  };

  const handleRegenerateTopics = async () => {
    setIsLoadingTopics(true);
    try {
      const newTopics = generateTopicSuggestions(domain, keywordGaps, seoRecommendations, selectedKeywords);
      setTopics(newTopics);
      
      const newTitleSuggestions: {[topic: string]: string[]} = {};
      newTopics.forEach(topic => {
        newTitleSuggestions[topic] = [
          `The Ultimate Guide to ${topic}`,
          `How to Use ${topic} to Improve Your Business`,
          `Top ${topic} Strategies for Success`,
          `Everything You Need to Know About ${topic}`,
          `The Future of ${topic}: Trends and Predictions`
        ];
      });
      setTitleSuggestions(newTitleSuggestions);
      
      toast.success(`Refreshed SEO topics`);
    } catch (error) {
      console.error("Error regenerating topics:", error);
      toast.error(`Failed to refresh topics: ${(error as Error).message}`);
    } finally {
      setIsLoadingTopics(false);
    }
  };

  const handleSelectTopic = (topic: string) => {
    setSelectedTopic(topic);
    setTitle(titleSuggestions[topic]?.[0] || "");
  };

  const handleSelectTitle = (title: string) => {
    setTitle(title);
  };

  const handleDeleteTopic = (topic: string) => {
    setTopics(prev => prev.filter(t => t !== topic));
    const { [topic]: removed, ...rest } = titleSuggestions;
    setTitleSuggestions(rest);
    if (selectedTopic === topic) {
      setSelectedTopic("");
      setTitle("");
    }
    toast.success(`Deleted topic "${topic}"`);
  };

  const handleContentTypeChange = (value: string) => {
    setContentType(value);
    setSelectedTemplateId("");
    
    if (selectedTopic) {
      const newTitleSuggestions = getSuggestedTitles(
        selectedTopic,
        selectedKeywords.slice(1),
        value
      );
      setTitleSuggestions(prev => ({
        ...prev,
        [selectedTopic]: newTitleSuggestions
      }));
      
      if (newTitleSuggestions.length > 0) {
        setTitle(newTitleSuggestions[0]);
      }
    }
  };

  const handleCreativityChange = (value: number) => {
    setCreativity(value);
  };

  const handleContentPreferenceToggle = (preference: string) => {
    setContentPreferences(prev => {
      if (prev.includes(preference)) {
        return prev.filter(p => p !== preference);
      } else {
        return [...prev, preference];
      }
    });
  };

  const handleRagToggle = (enabled: boolean) => {
    setRagEnabled(enabled);
    if (enabled) {
      toast.info("RAG-enhanced content generation enabled");
    }
  };

  const handleGenerateContent = async () => {
    if (!title) {
      toast.error("Please select a title");
      return;
    }
    
    setIsGenerating(true);
    try {
      console.log("Starting content generation with the following parameters:");
      console.log("Domain:", domain);
      console.log("Title:", title);
      console.log("Selected Keywords:", selectedKeywords);
      console.log("Content Type:", contentType);
      console.log("Creativity:", creativity);
      console.log("Content Preferences:", contentPreferences);
      console.log("RAG Enabled:", ragEnabled && isPineconeConfigured());
      
      if (ragEnabled && isPineconeConfigured()) {
        toast.info("Using RAG to enhance content with related keywords and context", {
          duration: 3000
        });
      }
      
      const result = await generateContent(
        domain, 
        title, 
        selectedKeywords, 
        contentType, 
        creativity,
        contentPreferences,
        ragEnabled && isPineconeConfigured()
      );
      
      console.log("Content generation result:", result);
      setGeneratedContent(result);
      
      if (!result) {
        throw new Error("Content generation returned empty result");
      }
      
      const blocks = result.content.split('\n').map((html, index) => {
        let type: 'heading1' | 'heading2' | 'heading3' | 'paragraph' = 'paragraph';
        
        if (html.startsWith('<h1')) type = 'heading1';
        else if (html.startsWith('<h2')) type = 'heading2';
        else if (html.startsWith('<h3')) type = 'heading3';
        
        return {
          id: `block-${index}-${Date.now()}`,
          type,
          content: html
        };
      });
      
      setGeneratedContentData({
        title: result.title,
        metaDescription: result.metaDescription,
        outline: result.outline,
        blocks,
        keywords: selectedKeywords,
        contentType,
        generationMethod: ragEnabled && isPineconeConfigured() ? 'rag' : 'standard',
        ragInfo: ragEnabled && isPineconeConfigured() ? {
          chunksRetrieved: 5,
          relevanceScore: 0.85
        } : undefined
      });
      
      toast.success("Content generated successfully!");
      setActiveStep(4);
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error(`Failed to generate content: ${(error as Error).message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddCustomTopic = (topic: string) => {
    setTopics(prev => [...prev, topic]);
    setTitleSuggestions(prev => ({
      ...prev,
      [topic]: [
        `The Ultimate Guide to ${topic}`,
        `How to Use ${topic} to Improve Your Business`,
        `Top ${topic} Strategies for Success`,
        `Everything You Need to Know About ${topic}`,
        `The Future of ${topic}: Trends and Predictions`
      ]
    }));
    toast.success(`Added custom topic "${topic}"`);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Step 1: Select Content Type</h3>
            <ContentTypeSelector 
              value={contentType}
              onChange={handleContentTypeChange}
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
                onTopicSelect={handleSelectTopic}
                onTitleSelect={handleSelectTitle}
                onTopicDelete={handleDeleteTopic}
                onContentTypeChange={handleContentTypeChange}
                onCreativityChange={handleCreativityChange}
                onContentPreferenceToggle={handleContentPreferenceToggle}
                onGenerateTopics={handleGenerateTopics}
                onRegenerateTopics={handleRegenerateTopics}
                onGenerateContent={() => setActiveStep(2)}
                onCustomTopicAdd={handleAddCustomTopic}
                ragEnabled={ragEnabled}
                onRagToggle={handleRagToggle}
              />
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Step 2: Choose a Template</h3>
            <TemplateSelector 
              contentType={contentType}
              selectedTemplateId={selectedTemplateId}
              onSelectTemplate={setSelectedTemplateId}
            />
            
            <div className="flex justify-between">
              <button
                onClick={() => setActiveStep(1)}
                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Back
              </button>
              <button
                onClick={() => setActiveStep(3)}
                className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-md hover:bg-primary/90"
              >
                Continue
              </button>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Step 3: Generate Content</h3>
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-md">
                <h4 className="font-medium">Content Configuration</h4>
                <div className="mt-2 text-sm">
                  <div><span className="font-medium">Content Type:</span> {contentType}</div>
                  <div><span className="font-medium">Template:</span> {selectedTemplateId || "Standard"}</div>
                  <div><span className="font-medium">Title:</span> {title}</div>
                  <div><span className="font-medium">Keywords:</span> {selectedKeywords.join(", ")}</div>
                  <div><span className="font-medium">Creativity:</span> {creativity}%</div>
                  <div><span className="font-medium">Generation Method:</span> {ragEnabled ? "RAG-Enhanced" : "Standard"}</div>
                </div>
              </div>
              
              <button
                onClick={handleGenerateContent}
                disabled={isGenerating}
                className="w-full px-4 py-2 text-sm font-medium bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {isGenerating ? "Generating Content..." : "Generate Content"}
              </button>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={() => setActiveStep(2)}
                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Back
              </button>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Step 4: Edit Content</h3>
            
            <Tabs defaultValue="editor">
              <TabsList className="mb-4">
                <TabsTrigger value="editor">Block Editor</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              
              <TabsContent value="editor">
                {generatedContentData && (
                  <ContentEditor 
                    generatedContent={generatedContentData}
                    onContentUpdate={setGeneratedContentData}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="preview">
                {generatedContent && (
                  <GeneratedContent 
                    generatedContent={generatedContent} 
                    contentType={contentType} 
                  />
                )}
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-between">
              <button
                onClick={() => setActiveStep(3)}
                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Back
              </button>
            </div>
          </div>
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
