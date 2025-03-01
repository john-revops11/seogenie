import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { generateContent } from "@/services/keywordService";
import { generateTopicSuggestions } from "@/utils/topicGenerator";
import { Loader2, RefreshCw, Plus } from "lucide-react";
import { GeneratorForm } from "./content-generator/GeneratorForm";
import { keywordGapsCache } from "@/components/KeywordGapCard";
import KeywordGapCard from "@/components/KeywordGapCard";
import TopicsList from "./content-generator/TopicsList";
import TitleSuggestions from "./content-generator/TitleSuggestions";

// Creating a custom hook to extract useKeywordGaps functionality since it's not exported
const useKeywordGaps = () => {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(keywordGapsCache.selectedKeywords || []);
  
  const handleSelectKeywords = (keywords: string[]) => {
    setSelectedKeywords(keywords);
    keywordGapsCache.selectedKeywords = keywords;
  };
  
  return {
    keywordGaps: keywordGapsCache.data || [],
    seoRecommendations: [], // Default empty array
    selectedKeywords,
    handleSelectKeywords
  };
};

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
  const [generatedContent, setGeneratedContent] = useState<{
    title: string;
    metaDescription: string;
    outline: string[];
    content: string;
  } | null>(null);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { keywordGaps, seoRecommendations, selectedKeywords, handleSelectKeywords } = useKeywordGaps();

  useEffect(() => {
    const handleGenerateFromKeyword = (event: any) => {
      const { primaryKeyword, relatedKeywords } = event.detail;
      
      // Set the primary keyword and related keywords
      if (primaryKeyword) {
        // Generate an SEO-optimized topic based on the keyword
        const topicSuggestion = `${primaryKeyword} Guide: Best Practices and Strategies`;
        setTopics(prev => [...prev, topicSuggestion]);
        setSelectedTopic(topicSuggestion);
        
        // Generate title suggestions
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
        
        // Set the selected title
        setTitle(titleSuggestions[0]);
        
        // Set selected keywords (combine primary with related)
        handleSelectKeywords([primaryKeyword, ...relatedKeywords]);
      }
    };
    
    // Listen for the custom event
    window.addEventListener('generate-content-from-keyword', handleGenerateFromKeyword);
    
    return () => {
      window.removeEventListener('generate-content-from-keyword', handleGenerateFromKeyword);
    };
  }, []);

  const handleGenerateTopics = async () => {
    setIsLoadingTopics(true);
    try {
      const newTopics = generateTopicSuggestions(domain, keywordGaps, seoRecommendations, selectedKeywords);
      setTopics(newTopics);
      
      // Generate title suggestions for each topic
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
      
      // Generate title suggestions for each topic
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

  const handleGenerateContent = async () => {
    if (!title) {
      toast.error("Please select a title");
      return;
    }
    
    setIsGenerating(true);
    try {
      const result = await generateContent(domain, title, selectedKeywords, contentType, creativity);
      setGeneratedContent(result);
      toast.success("Content generated successfully!");
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
              isLoadingTopics={isLoadingTopics}
              isGenerating={isGenerating}
              onTopicSelect={handleSelectTopic}
              onTitleSelect={handleSelectTitle}
              onTopicDelete={handleDeleteTopic}
              onContentTypeChange={handleContentTypeChange}
              onCreativityChange={handleCreativityChange}
              onGenerateTopics={handleGenerateTopics}
              onRegenerateTopics={handleRegenerateTopics}
              onGenerateContent={handleGenerateContent}
              onCustomTopicAdd={handleAddCustomTopic}
            />
          </CardContent>
        </Card>
      </div>
      
      {generatedContent && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{generatedContent.title}</CardTitle>
              <CardDescription>{generatedContent.metaDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Outline</h3>
                <ul className="list-disc pl-5">
                  {generatedContent.outline.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Content</h3>
                <div dangerouslySetInnerHTML={{ __html: generatedContent.content }} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ContentGenerator;
