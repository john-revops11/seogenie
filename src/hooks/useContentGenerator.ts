import { useState, useEffect } from "react";
import { toast } from "sonner";
import { generateContent, getAvailableContentTemplates, getSuggestedTitles } from "@/services/keywords/contentGeneration";
import { generateTopicSuggestions } from "@/utils/topicGenerator";
import { useKeywordGaps } from "@/hooks/useKeywordGaps";
import { isPineconeConfigured } from "@/services/vector/pineconeService";
import { GeneratedContent } from "@/services/keywords/types";

export const useContentGenerator = (domain: string, allKeywords: string[]) => {
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
  const [generatedContentData, setGeneratedContentData] = useState<GeneratedContent | null>(null);
  
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
    console.log(`useContentGenerator: Received keyword "${primaryKeyword}" with related keywords:`, relatedKeywords);
    
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

  return {
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
    setGeneratedContentData,
    
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
  };
};
