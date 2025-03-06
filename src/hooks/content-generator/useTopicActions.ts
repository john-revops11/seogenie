
import { useState } from "react";
import { toast } from "sonner";
import { generateTopicsAndTitles } from "./topicGenerator";
import { generateTitleSuggestions } from "@/services/keywords/generation/titleGenerator";

export function useTopicActions(
  domain: string,
  setIsLoadingTopics: (loading: boolean) => void,
  setTopics: (topics: string[]) => void,
  setTitleSuggestions: (suggestions: { [topic: string]: string[] }) => void,
  setSelectedTopic: (topic: string) => void
) {
  // Generate topics based on selected keywords
  const handleGenerateTopics = async (selectedKeywords: string[], contentType: string) => {
    if (selectedKeywords.length === 0) {
      toast.error("Please select at least one keyword");
      return;
    }

    setIsLoadingTopics(true);
    
    try {
      // Generate topics and titles
      const { topics: generatedTopics, titleSuggestions: suggestions } = 
        await generateTopicsAndTitles(domain, selectedKeywords, contentType);
      
      // Update state with generated data
      setTopics(generatedTopics);
      setTitleSuggestions(suggestions);

      if (generatedTopics.length > 0) {
        setSelectedTopic(generatedTopics[0]);
      }
    } catch (error) {
      console.error("Error generating topics:", error);
      toast.error("Failed to generate topics");
    } finally {
      setIsLoadingTopics(false);
    }
  };

  // Handle regenerating topics
  const handleRegenerateTopics = (selectedKeywords: string[], contentType: string) => {
    handleGenerateTopics(selectedKeywords, contentType);
  };

  // Handle selecting a topic
  const handleSelectTopic = (topic: string) => {
    setSelectedTopic(topic);
  };

  // Handle deleting a topic
  const handleDeleteTopic = (topics: string[], selectedTopic: string, topic: string) => {
    if (topics.length <= 1) {
      toast.error("Cannot delete the only topic");
      return;
    }
    
    const newTopics = topics.filter(t => t !== topic);
    setTopics(newTopics);
    
    if (selectedTopic === topic) {
      setSelectedTopic(newTopics[0]);
    }
  };

  // Handle adding a custom topic
  const handleAddCustomTopic = (
    topics: string[],
    selectedKeywords: string[],
    contentType: string,
    topic: string
  ) => {
    if (!topic.trim()) return;
    
    if (topics.includes(topic)) {
      toast.info("This topic already exists");
      return;
    }
    
    const newTopics = [topic, ...topics];
    setTopics(newTopics);
    setSelectedTopic(topic);
    
    // Generate title suggestions for the new topic
    const titleSuggs = generateTitleSuggestions(topic, selectedKeywords, contentType);
    
    // Create a new object to update the title suggestions
    const updatedSuggestions = { 
      ...Object.fromEntries(Object.entries({})), 
      [topic]: titleSuggs 
    };
    
    // Update the title suggestions state with the new object
    setTitleSuggestions(prevSuggestions => ({
      ...prevSuggestions,
      [topic]: titleSuggs
    }));
  };

  return {
    handleGenerateTopics,
    handleRegenerateTopics,
    handleSelectTopic,
    handleDeleteTopic,
    handleAddCustomTopic
  };
}
