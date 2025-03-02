import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { generateContent } from "@/services/keywords/contentGeneration";
import { generateTopicSuggestions } from "@/utils/topicGenerator";
import { GeneratorForm } from "./content-generator/GeneratorForm";
import TopicGenerationHandler from "./content-generator/TopicGenerationHandler";
import GeneratedContent from "./content-generator/GeneratedContent";
import { useKeywordGaps } from "@/hooks/useKeywordGaps";
import { isPineconeConfigured } from "@/services/vector/pineconeService";

interface ContentGeneratorProps {
  domain: string;
  allKeywords: string[];
}

interface GeneratedContentType {
  title: string;
  metaDescription: string;
  outline: string[];
  content: string;
  ragEnhanced: boolean;
}

const ContentGenerator: React.FC<ContentGeneratorProps> = ({ domain, allKeywords }) => {
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

  useEffect(() => {
    if (isPineconeConfigured()) {
      toast.success("Pinecone RAG is available for enhanced content generation");
    }
  }, []);

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
        contentPreferences
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
