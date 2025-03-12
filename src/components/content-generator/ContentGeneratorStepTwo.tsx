import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { X, RefreshCw, Info, BookOpen } from "lucide-react";
import { WORD_COUNT_OPTIONS } from "./WordCountSelector";
import { AIProvider } from "@/types/aiModels";
import { generateTitlesWithAI } from "@/hooks/content-generator/aiModels";
import { toast } from "sonner";
import { keywordGapsCache } from "@/components/keyword-gaps/KeywordGapUtils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { generateTopicSuggestions } from "@/utils/topicGenerator";

interface ContentGeneratorStepTwoProps {
  title: string;
  keywords: string[];
  creativity: number;
  ragEnabled: boolean;
  contentPreferences: string[];
  selectedPreferences: string[];
  wordCountOption: string;
  contentType: string;
  onTitleChange: (title: string) => void;
  onKeywordsChange: (keywords: string[]) => void;
  onCreativityChange: (value: number) => void;
  onRagToggle: (enabled: boolean) => void;
  onTogglePreference: (preference: string) => void;
  onWordCountOptionChange: (option: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const ContentGeneratorStepTwo: React.FC<ContentGeneratorStepTwoProps> = ({
  title,
  keywords,
  creativity,
  ragEnabled,
  contentPreferences,
  selectedPreferences,
  wordCountOption,
  contentType,
  onTitleChange,
  onKeywordsChange,
  onCreativityChange,
  onRagToggle,
  onTogglePreference,
  onWordCountOptionChange,
  onNext,
  onBack
}) => {
  const [newKeyword, setNewKeyword] = useState("");
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>([]);
  const [loadingTitles, setLoadingTitles] = useState(false);
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>("");

  useEffect(() => {
    if (keywords.length === 0 && keywordGapsCache.selectedKeywords && keywordGapsCache.selectedKeywords.length > 0) {
      onKeywordsChange([...keywordGapsCache.selectedKeywords]);
      toast.success(`Loaded ${keywordGapsCache.selectedKeywords.length} selected keywords from Keyword Gap Analysis`);
      
      if (keywordGapsCache.selectedKeywords.length >= 2) {
        generateTopics();
      }
    }
  }, []);

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      onKeywordsChange([...keywords, newKeyword.trim()]);
      setNewKeyword("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    onKeywordsChange(keywords.filter(k => k !== keyword));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const addKeywordsFromGapAnalysis = () => {
    if (keywordGapsCache.selectedKeywords && keywordGapsCache.selectedKeywords.length > 0) {
      const newKeywords = keywordGapsCache.selectedKeywords.filter(
        k => !keywords.includes(k)
      );
      
      if (newKeywords.length > 0) {
        onKeywordsChange([...keywords, ...newKeywords]);
        toast.success(`Added ${newKeywords.length} selected keywords from Keyword Gap Analysis`);
        
        if ((keywords.length + newKeywords.length) >= 2) {
          generateTopics();
        }
      } else {
        toast.info("All selected keywords from Keyword Gap Analysis are already added");
      }
    } else {
      toast.info("No keywords selected in Keyword Gap Analysis. Go to the Keyword Gaps section and use the 'Add' button to select keywords first.");
    }
  };

  const generateTopics = () => {
    if (keywords.length === 0) {
      toast.error("Please add at least one keyword to generate topic suggestions");
      return;
    }

    setLoadingTopics(true);
    try {
      const topics = generateTopicSuggestions("", [], null, keywords);
      
      if (topics.length < 10) {
        const currentYear = new Date().getFullYear();
        const additionalTopics = [
          `Complete Guide to ${keywords[0]} in ${currentYear}`,
          `How to Master ${keywords[0]}: Expert Tips`,
          `${keywords[0]}: Everything You Need to Know`,
          `The Ultimate ${keywords[0]} Strategy Guide`,
          `Understanding ${keywords[0]}: A Comprehensive Guide`,
          ...keywords.slice(1).map(kw => `${keywords[0]} and ${kw}: Complete Guide`),
          ...keywords.map(kw => `${kw} Mastery: Step by Step Guide`)
        ];
        
        const allTopics = [...topics, ...additionalTopics];
        setSuggestedTopics(Array.from(new Set(allTopics)).slice(0, 15));
      } else {
        setSuggestedTopics(topics.slice(0, 15));
      }
      
      toast.success("Topic suggestions generated!");
    } catch (error) {
      console.error("Error generating topic suggestions:", error);
      toast.error("Failed to generate topic suggestions. Please try again.");
    } finally {
      setLoadingTopics(false);
    }
  };

  const selectTopic = (topic: string) => {
    setSelectedTopic(topic);
    onTitleChange(topic);
    generateTitleSuggestionsForTopic(topic);
  };

  const generateTitleSuggestionsForTopic = async (topic: string) => {
    if (!topic) {
      toast.error("Please select a topic first");
      return;
    }

    setLoadingTitles(true);
    try {
      const provider: AIProvider = 'openai';
      
      const titles = await generateTitlesWithAI(
        provider,
        topic,
        keywords,
        contentType
      );
      
      if (titles.length < 5) {
        const currentYear = new Date().getFullYear();
        const additionalTitles = [
          `The Complete Guide to ${topic} (${currentYear} Edition)`,
          `How to Master ${topic}: Expert Strategies and Tips`,
          `${topic}: A Comprehensive Guide for Success`,
          `Understanding ${topic}: From Basics to Advanced`,
          `The Ultimate ${topic} Guide: Everything You Need to Know`
        ];
        
        const combinedTitles = [...titles, ...additionalTitles];
        setSuggestedTitles(Array.from(new Set(combinedTitles)).slice(0, 10));
      } else {
        setSuggestedTitles(titles);
      }
      
      toast.success("Title suggestions generated!");
    } catch (error) {
      console.error("Error generating title suggestions:", error);
      toast.error("Failed to generate title suggestions. Please try again.");
    } finally {
      setLoadingTitles(false);
    }
  };

  const selectSuggestedTitle = (suggestedTitle: string) => {
    onTitleChange(suggestedTitle);
    toast.success("Title selected!");
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Step 2: Content Details</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="keywords">Keywords</Label>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={addKeywordsFromGapAnalysis}
            >
              Use Selected Gap Keywords
            </Button>
          </div>
          
          <div className="flex space-x-2">
            <Input
              id="keywords"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add keywords"
            />
            <Button type="button" onClick={handleAddKeyword} variant="secondary">
              Add
            </Button>
          </div>
          
          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {keywords.map((keyword) => (
                <Badge key={keyword} variant="secondary" className="px-2 py-1">
                  {keyword}
                  <X 
                    className="ml-1 h-3 w-3 cursor-pointer" 
                    onClick={() => handleRemoveKeyword(keyword)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2 mt-6">
          <div className="flex justify-between items-center">
            <Label>Topic Suggestions</Label>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={generateTopics}
              disabled={loadingTopics || keywords.length === 0}
            >
              {loadingTopics ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Generate Topics
                </>
              )}
            </Button>
          </div>
          
          {suggestedTopics.length > 0 && (
            <div className="bg-muted/40 p-3 rounded-md max-h-60 overflow-y-auto">
              <div className="space-y-2">
                {suggestedTopics.map((topic, index) => (
                  <div 
                    key={index}
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                      selectedTopic === topic ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted'
                    }`}
                    onClick={() => selectTopic(topic)}
                  >
                    <span>{topic}</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={(e) => {
                        e.stopPropagation();
                        selectTopic(topic);
                      }}
                    >
                      Use
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-2 mt-6">
          <div className="flex justify-between items-center">
            <Label htmlFor="title">Title</Label>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => selectedTopic ? 
                generateTitleSuggestionsForTopic(selectedTopic) : 
                toast.error("Please select a topic first")}
              disabled={loadingTitles || !selectedTopic}
            >
              {loadingTitles ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate Title Ideas
                </>
              )}
            </Button>
          </div>
          <Input
            id="title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Enter your content title"
          />
        </div>

        {suggestedTitles.length > 0 && (
          <div className="space-y-2 bg-muted/40 p-3 rounded-md">
            <Label>Title Suggestions</Label>
            <div className="space-y-2">
              {suggestedTitles.map((suggestedTitle, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer transition-colors"
                  onClick={() => selectSuggestedTitle(suggestedTitle)}
                >
                  <span>{suggestedTitle}</span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={(e) => {
                      e.stopPropagation();
                      selectSuggestedTitle(suggestedTitle);
                    }}
                  >
                    Use
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Creativity Level</Label>
            <span className="text-sm text-muted-foreground">{creativity}%</span>
          </div>
          <Slider
            value={[creativity]}
            min={0}
            max={100}
            step={1}
            onValueChange={([value]) => onCreativityChange(value)}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Conservative</span>
            <span>Balanced</span>
            <span>Creative</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="rag-toggle">Use RAG (Retrieval Augmented Generation)</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>RAG allows the AI to reference your website's existing content to create more accurate and consistent articles</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Switch
              id="rag-toggle"
              checked={ragEnabled}
              onCheckedChange={onRagToggle}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Enhances content with relevant information from your website's existing content
          </p>
        </div>
        
        <div className="space-y-2">
          <Label>Word Count</Label>
          <select 
            className="w-full p-2 border rounded-md"
            value={wordCountOption}
            onChange={(e) => onWordCountOptionChange(e.target.value)}
          >
            {WORD_COUNT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.description}
              </option>
            ))}
          </select>
        </div>

        <Separator className="my-4" />
        
        <div className="space-y-2">
          <Label>Content Preferences</Label>
          <div className="grid grid-cols-2 gap-2">
            {contentPreferences.map((preference) => (
              <div key={preference} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`pref-${preference}`}
                  checked={selectedPreferences.includes(preference)}
                  onChange={() => onTogglePreference(preference)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor={`pref-${preference}`} className="text-sm">
                  {preference}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>
          Continue
        </Button>
      </div>
    </div>
  );
};

export default ContentGeneratorStepTwo;
