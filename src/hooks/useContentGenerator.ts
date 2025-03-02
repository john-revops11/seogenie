import { useState, useEffect } from "react";
import { toast } from "sonner";
import { generateContent } from "@/services/keywords/contentGeneration";
import { generateTopicSuggestions } from "@/utils/topicGenerator";
import { isPineconeConfigured } from "@/services/vector/pineconeService";
import { useKeywordGaps } from "@/hooks/useKeywordGaps";

export interface GeneratedContentType {
  title: string;
  metaDescription: string;
  outline: string[];
  content: string;
  ragEnhanced: boolean;
}

interface UseContentGeneratorProps {
  domain: string;
  allKeywords: string[];
}

export const useContentGenerator = ({ domain, allKeywords }: UseContentGeneratorProps) => {
  const [topics, setTopics] = useState<string[]>([]);
  const [titleSuggestions, setTitleSuggestions] = useState<{[topic: string]: string[]}>({});
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [contentType, setContentType] = useState<string>("blog");
  const [creativity, setCreativity] = useState<number>(50);
  const [contentPreferences, setContentPreferences] = useState<string[]>([]);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContentType | null>(null);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [ragEnabled, setRagEnabled] = useState(false);
  const { keywordGaps, seoRecommendations, selectedKeywords, handleSelectKeywords } = useKeywordGaps();

  // Check if Pinecone is configured and update status
  useEffect(() => {
    const checkPineconeStatus = () => {
      const configured = isPineconeConfigured();
      if (configured) {
        console.log("Pinecone is configured and available for RAG");
        // Only show this toast once when it becomes available
        if (!ragEnabled) {
          toast.success("Pinecone RAG is available for enhanced content generation", {
            id: "pinecone-available",
            duration: 3000
          });
        }
      } else {
        console.log("Pinecone is not configured");
        // If it was enabled but now isn't configured, disable it
        if (ragEnabled) {
          setRagEnabled(false);
        }
      }
    };
    
    // Check on mount and set up an interval to check occasionally
    checkPineconeStatus();
    
    // Check every 5 seconds in case the user configures Pinecone in another tab
    const interval = setInterval(checkPineconeStatus, 5000);
    
    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, [ragEnabled]);

  // Initialize default content preferences
  useEffect(() => {
    if (contentPreferences.length === 0) {
      const defaultPreferences = [
        "Include meta descriptions",
        "Focus on H1/H2 tags",
        "Use bullet points",
        "Add internal links",
        "Add tables for data",
        "Include statistics",
        "Add FAQ section"
      ];
      
      setContentPreferences(defaultPreferences);
      
      localStorage.setItem('contentPreferences', JSON.stringify(defaultPreferences));
    }
  }, []);

  // Load saved preferences
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

  // Save preferences
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
    if (enabled && !isPineconeConfigured()) {
      toast.error("Pinecone is not configured. Please configure it in the settings.");
      return;
    }
    
    setRagEnabled(enabled);
    if (enabled) {
      toast.info("RAG-enhanced content generation enabled", {
        duration: 3000
      });
    }
  };

  const handleGenerateContent = async () => {
    if (!title) {
      toast.error("Please select a title");
      return;
    }
    
    // Double-check RAG status before generating
    if (ragEnabled && !isPineconeConfigured()) {
      toast.error("Pinecone is not configured. RAG enhancement has been disabled.");
      setRagEnabled(false);
      return;
    }
    
    setIsGenerating(true);
    try {
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
        ragEnabled // Pass the RAG status to the content generation service
      );
      
      setGeneratedContent({
        ...result,
        ragEnhanced: result.ragEnhanced || false
      });
      
      if (result.ragEnhanced) {
        toast.success("Content generated successfully with RAG enhancement!");
      } else {
        toast.success("Content generated successfully!");
      }
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
  };
};
