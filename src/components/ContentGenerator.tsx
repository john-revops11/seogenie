
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { generateContent } from "@/services/keywordService";
import { keywordGapsCache } from "@/components/KeywordGapCard";
import { recommendationsCache } from "@/components/SeoRecommendationsCard";
import { generateTopicSuggestions } from "@/utils/topicGenerator";
import { generateTitleSuggestions } from "@/utils/titleGenerator";
import GeneratorForm from "@/components/content-generator/GeneratorForm";
import ContentPreview from "@/components/content-generator/ContentPreview";

interface ContentGeneratorProps {
  domain: string;
  allKeywords: string[];
}

const ContentGenerator = ({ domain, allKeywords }: ContentGeneratorProps) => {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [contentType, setContentType] = useState("blog");
  const [creativity, setCreativity] = useState(50);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<{
    title: string;
    metaDescription: string;
    outline: string[];
    content: string;
  } | null>(null);
  
  const [topics, setTopics] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [titleSuggestions, setTitleSuggestions] = useState<{[topic: string]: string[]}>({});
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);
  
  useEffect(() => {
    const checkDataReadiness = () => {
      const hasKeywordGaps = keywordGapsCache.data && keywordGapsCache.data.length > 0;
      const hasRecommendations = recommendationsCache.data && 
                                (recommendationsCache.data.onPage.length > 0 || 
                                 recommendationsCache.data.technical.length > 0 || 
                                 recommendationsCache.data.content.length > 0);
      
      setIsDataReady(hasKeywordGaps && hasRecommendations);
    };
    
    checkDataReadiness();
  }, [domain, allKeywords]);
  
  useEffect(() => {
    if (keywordGapsCache.selectedKeywords && keywordGapsCache.selectedKeywords.length > 0) {
      setSelectedKeywords(keywordGapsCache.selectedKeywords);
    }
  }, []);
  
  // This function will now need to be called explicitly
  const generateInitialTopics = () => {
    setIsLoadingTopics(true);
    
    try {
      const gaps = keywordGapsCache.data || [];
      const recommendations = recommendationsCache.data;
      const selectedKeywords = keywordGapsCache.selectedKeywords || [];
      
      // Only generate topics if we have selected keywords
      if (selectedKeywords.length === 0) {
        toast.error("Please select keywords from the Keyword Gaps card first");
        setIsLoadingTopics(false);
        return;
      }
      
      console.log("Generating topics with domain:", domain);
      console.log("Selected keywords for topic generation:", selectedKeywords);
      
      // Generate domain-relevant topics using enhanced algorithm
      const generatedTopics = generateTopicSuggestions(domain, gaps, recommendations, selectedKeywords);
      setTopics(generatedTopics);
      
      // Generate SEO-optimized titles for each topic
      const titlesMap: {[topic: string]: string[]} = {};
      generatedTopics.forEach(topic => {
        titlesMap[topic] = generateTitleSuggestions(topic, gaps, recommendations, selectedKeywords, domain);
      });
      
      setTitleSuggestions(titlesMap);
      setSelectedTopic("");
      setTitle("");
      
      toast.success("Generated SEO-optimized topic suggestions based on keyword gaps");
    } catch (error) {
      console.error("Error generating topics:", error);
      toast.error("Failed to generate topic suggestions");
    } finally {
      setIsLoadingTopics(false);
    }
  };
  
  const handleAddCustomTopic = (newTopic: string) => {
    if (!newTopic.trim()) {
      toast.error("Please enter a custom topic");
      return;
    }
    
    // Add the custom topic to the list
    const customTopicTrimmed = newTopic.trim();
    setTopics(prev => [customTopicTrimmed, ...prev.slice(0, 7)]);
    
    // Generate SEO-optimized titles for the custom topic
    const gaps = keywordGapsCache.data || [];
    const recommendations = recommendationsCache.data;
    const selectedKeywords = keywordGapsCache.selectedKeywords || [];
    
    const titles = generateTitleSuggestions(customTopicTrimmed, gaps, recommendations, selectedKeywords, domain);
    
    setTitleSuggestions(prev => ({
      ...prev,
      [customTopicTrimmed]: titles
    }));
    
    toast.success("Custom topic created");
  };
  
  const handleSelectTopic = (topic: string) => {
    setSelectedTopic(topic);
    
    // Set the first title suggestion by default
    if (titleSuggestions[topic] && titleSuggestions[topic].length > 0) {
      setTitle(titleSuggestions[topic][0]);
    } else {
      setTitle(`${topic}: Complete Guide`);
    }
  };
  
  const handleSelectTitle = (title: string) => {
    setTitle(title);
  };
  
  const handleDeleteTopic = (topicToDelete: string) => {
    // Update topics list
    setTopics(prev => prev.filter(topic => topic !== topicToDelete));
    
    // Remove title suggestions for the deleted topic
    setTitleSuggestions(prev => {
      const newTitleSuggestions = { ...prev };
      delete newTitleSuggestions[topicToDelete];
      return newTitleSuggestions;
    });
    
    // Reset selected topic if it was deleted
    if (selectedTopic === topicToDelete) {
      setSelectedTopic("");
      setTitle("");
    }
    
    toast.success("Topic removed");
  };
  
  const handleRegenerateTopics = () => {
    setIsLoadingTopics(true);
    
    try {
      const gaps = keywordGapsCache.data || [];
      const recommendations = recommendationsCache.data;
      const selectedKeywords = keywordGapsCache.selectedKeywords || [];
      
      // Create a different randomSeed each time for more variety
      const randomSeed = Math.random() + new Date().getTime();
      console.log("Regenerating topics with random seed:", randomSeed);
      
      // Generate a fresh set of topics
      const newTopics = generateTopicSuggestions(domain, gaps, recommendations, selectedKeywords);
      
      // Ensure we get different topics than what we currently have
      const currentTopicsSet = new Set(topics);
      const filteredNewTopics = newTopics.filter(topic => !currentTopicsSet.has(topic));
      
      if (filteredNewTopics.length < 3) {
        // If we don't have enough different topics, force more variety
        console.log("Not enough unique topics, generating alternatives with different parameters");
        
        // Change the priority of keywords to get different themes
        const reorderedKeywords = [...selectedKeywords].reverse();
        
        // Try with a different approach by adjusting the seed and keywords
        const alternativeTopics = generateTopicSuggestions(domain, gaps, recommendations, reorderedKeywords);
        
        // Generate titles for each new topic
        const titlesMap: {[topic: string]: string[]} = {};
        alternativeTopics.forEach(topic => {
          titlesMap[topic] = generateTitleSuggestions(topic, gaps, recommendations, selectedKeywords, domain);
        });
        
        setTopics(alternativeTopics);
        setTitleSuggestions(titlesMap);
      } else {
        // Use the filtered new topics
        setTopics(filteredNewTopics);
        
        // Generate titles for each new topic
        const titlesMap: {[topic: string]: string[]} = {};
        filteredNewTopics.forEach(topic => {
          titlesMap[topic] = generateTitleSuggestions(topic, gaps, recommendations, selectedKeywords, domain);
        });
        
        setTitleSuggestions(titlesMap);
      }
      
      setSelectedTopic("");
      setTitle("");
      
      toast.success("Generated new SEO-optimized topic suggestions");
    } catch (error) {
      console.error("Error regenerating topics:", error);
      toast.error("Failed to regenerate topic suggestions");
    } finally {
      setIsLoadingTopics(false);
    }
  };
  
  const handleGenerateContent = async () => {
    if (!title) {
      toast.error("Please enter a title for your content");
      return;
    }
    
    if (selectedKeywords.length === 0 && keywordGapsCache.selectedKeywords.length === 0) {
      toast.error("Please select at least one keyword from the Keyword Gaps card");
      return;
    }
    
    const keywordsToUse = selectedKeywords.length > 0 ? selectedKeywords : keywordGapsCache.selectedKeywords;
    
    setIsGenerating(true);
    setGeneratedContent(null);
    
    try {
      const content = await generateContent(
        domain,
        title,
        keywordsToUse,
        contentType,
        creativity
      );
      
      setGeneratedContent(content);
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error(`Failed to generate content: ${(error as Error).message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isDataReady) {
    return (
      <Card className="glass-panel transition-all duration-300 hover:shadow-xl">
        <CardHeader>
          <CardTitle>Content Generation</CardTitle>
          <CardDescription>Analysis data required for intelligent content generation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Loader2 className="w-12 h-12 text-primary/50 animate-spin mb-4" />
            <h3 className="text-lg font-semibold">Waiting for analysis data</h3>
            <p className="mt-2 text-muted-foreground max-w-md">
              Please complete the keyword analysis first. This data is required to generate optimized content that aligns with your SEO strategy.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-panel transition-all duration-300 hover:shadow-xl">
      <CardHeader>
        <CardTitle>AI Content Generator</CardTitle>
        <CardDescription>Create optimized content using selected keywords from your gaps analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList className="grid grid-cols-2 w-full max-w-sm mx-auto">
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="preview" disabled={!generatedContent}>Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="generate" className="space-y-6 pt-2">
            <GeneratorForm
              topics={topics}
              titleSuggestions={titleSuggestions}
              selectedTopic={selectedTopic}
              selectedKeywords={selectedKeywords}
              title={title}
              contentType={contentType}
              creativity={creativity}
              isLoadingTopics={isLoadingTopics}
              isGenerating={isGenerating}
              onTopicSelect={handleSelectTopic}
              onTitleSelect={handleSelectTitle}
              onTopicDelete={handleDeleteTopic}
              onContentTypeChange={setContentType}
              onCreativityChange={setCreativity}
              onGenerateTopics={generateInitialTopics}
              onRegenerateTopics={handleRegenerateTopics}
              onGenerateContent={handleGenerateContent}
              onCustomTopicAdd={handleAddCustomTopic}
            />
          </TabsContent>
          
          <TabsContent value="preview">
            <ContentPreview 
              generatedContent={generatedContent}
              isGenerating={isGenerating}
              onRegenerateContent={handleGenerateContent}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ContentGenerator;
