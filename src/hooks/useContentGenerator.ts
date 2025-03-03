import { useState, useEffect } from "react";
import { toast } from "sonner";
import { generateContent } from "@/services/keywords/content/contentGenerator";
import { GeneratedContent } from "@/services/keywords/content/contentTypes";
import { generateTopicSuggestions } from "@/utils/topicGenerator";
import { isPineconeConfigured } from "@/services/vector/connection";
import { useKeywordGaps } from "@/hooks/useKeywordGaps";

type GeneratedContentType = GeneratedContent;

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

  // Check Pinecone configuration status periodically
  useEffect(() => {
    const checkPineconeStatus = () => {
      const configured = isPineconeConfigured();
      if (configured) {
        console.log("Pinecone is configured and available for RAG");
        if (!ragEnabled) {
          toast.success("Pinecone RAG is available for enhanced content generation", {
            id: "pinecone-available",
            duration: 3000
          });
        }
      } else {
        console.log("Pinecone is not configured");
        if (ragEnabled) {
          setRagEnabled(false);
        }
      }
    };
    
    checkPineconeStatus();
    
    const interval = setInterval(checkPineconeStatus, 5000);
    
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

  // Load saved content preferences from localStorage
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

  // Save content preferences to localStorage when changed
  useEffect(() => {
    if (contentPreferences.length > 0) {
      localStorage.setItem('contentPreferences', JSON.stringify(contentPreferences));
    }
  }, [contentPreferences]);

  // Generate content based on a primary keyword and related keywords
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
    
    toast.success(`Added "${primaryKeyword}" as primary keyword with ${relatedKeywords.length} related keywords`);
  };

  // Generate topic suggestions based on domain and keywords
  const handleGenerateTopics = async () => {
    setIsLoadingTopics(true);
    try {
      if (!domain) {
        toast.error("Please enter a domain before generating topics");
        setIsLoadingTopics(false);
        return;
      }
      
      if (!allKeywords || allKeywords.length === 0) {
        toast.warning("No keywords available. Topics may be less relevant.");
      }
      
      const newTopics = generateTopicSuggestions(domain, keywordGaps, seoRecommendations, selectedKeywords);
      
      if (newTopics.length === 0) {
        toast.warning("Could not generate topics. Try adding keywords or analyzing your domain first.");
        setIsLoadingTopics(false);
        return;
      }
      
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

  // Regenerate topic suggestions with different seed data
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

  // Select a topic from the generated topics
  const handleSelectTopic = (topic: string) => {
    setSelectedTopic(topic);
    setTitle(titleSuggestions[topic]?.[0] || "");
  };

  // Select a title for the selected topic
  const handleSelectTitle = (title: string) => {
    setTitle(title);
  };

  // Delete a topic from the list
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

  // Change the content type (blog, article, etc.)
  const handleContentTypeChange = (value: string) => {
    setContentType(value);
  };

  // Change the creativity level for content generation
  const handleCreativityChange = (value: number) => {
    setCreativity(value);
  };

  // Toggle content preferences
  const handleContentPreferenceToggle = (preference: string) => {
    setContentPreferences(prev => {
      if (prev.includes(preference)) {
        return prev.filter(p => p !== preference);
      } else {
        return [...prev, preference];
      }
    });
  };

  // Toggle RAG enhancement for content generation
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

  // Generate content based on current settings
  const handleGenerateContent = async () => {
    if (!title) {
      toast.error("Please select a title");
      return;
    }
    
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
        ragEnabled
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

  // Add a custom topic to the list
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
