
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { generateTitlesWithAI } from "@/hooks/content-generator/aiModels";
import { generateTopicSuggestions } from "@/utils/topicGenerator";
import KeywordManager from "./step-two/KeywordManager";
import TopicSuggestions from "./step-two/TopicSuggestions";
import TitleSuggestions from "./step-two/TitleSuggestions";
import ContentPreferences from "./step-two/ContentPreferences";

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
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>([]);
  const [loadingTitles, setLoadingTitles] = useState(false);
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>("");

  const generateTopics = () => {
    if (keywords.length === 0) {
      toast.error("Please add at least one keyword to generate topic suggestions");
      return;
    }

    setLoadingTopics(true);
    try {
      // Create simple topics based on keywords
      const topics = keywords.map(keyword => `Guide to ${keyword}`);
      
      const currentYear = new Date().getFullYear();
      const additionalTopics = [
        ...keywords.map(k => `Complete Guide to ${k} in ${currentYear}`),
        ...keywords.map(k => `How to Master ${k}: Expert Tips`),
        ...keywords.map(k => `${k}: Everything You Need to Know`),
        ...keywords.map(k => `The Ultimate ${k} Strategy Guide`),
      ];
      
      setSuggestedTopics([...topics, ...additionalTopics].slice(0, 15));
      toast.success("Topic suggestions generated!");
    } catch (error) {
      console.error("Error generating topic suggestions:", error);
      toast.error("Failed to generate topic suggestions. Please try again.");
    } finally {
      setLoadingTopics(false);
    }
  };

  const handleTopicSelect = (topic: string) => {
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
      const provider = 'openai';
      const titles = await generateTitlesWithAI(provider, topic, keywords, contentType);
      
      // If we don't get enough titles, generate some simple ones
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

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Step 2: Content Details</h3>
      
      <KeywordManager 
        keywords={keywords}
        onKeywordsChange={onKeywordsChange}
        onGenerateTopics={generateTopics}
      />

      <TopicSuggestions 
        topics={suggestedTopics}
        selectedTopic={selectedTopic}
        isLoading={loadingTopics}
        onTopicSelect={handleTopicSelect}
        onGenerateTopics={generateTopics}
      />

      <TitleSuggestions 
        title={title}
        suggestedTitles={suggestedTitles}
        isLoading={loadingTitles}
        onTitleChange={onTitleChange}
        onGenerateTitles={() => generateTitleSuggestionsForTopic(selectedTopic)}
      />

      <ContentPreferences 
        creativity={creativity}
        ragEnabled={ragEnabled}
        wordCountOption={wordCountOption}
        contentPreferences={contentPreferences}
        selectedPreferences={selectedPreferences}
        onCreativityChange={onCreativityChange}
        onRagToggle={onRagToggle}
        onWordCountOptionChange={onWordCountOptionChange}
        onTogglePreference={onTogglePreference}
      />
      
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
