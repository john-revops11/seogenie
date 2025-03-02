
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { isPineconeConfigured } from "@/services/vector/pineconeService";
import TopicsSection from "./form-sections/TopicsSection";
import ContentSettingsSection from "./form-sections/ContentSettingsSection";
import AdvancedSettingsSection from "./form-sections/AdvancedSettingsSection";

interface GeneratorFormProps {
  topics: string[];
  titleSuggestions: { [topic: string]: string[] };
  selectedTopic: string;
  selectedKeywords: string[];
  title: string;
  contentType: string;
  creativity: number;
  contentPreferences: string[];
  isLoadingTopics: boolean;
  isGenerating: boolean;
  onTopicSelect: (topic: string) => void;
  onTitleSelect: (title: string) => void;
  onTopicDelete: (topic: string) => void;
  onContentTypeChange: (value: string) => void;
  onCreativityChange: (value: number) => void;
  onContentPreferenceToggle: (preference: string) => void;
  onGenerateTopics: () => void;
  onRegenerateTopics: () => void;
  onGenerateContent: () => void;
  onCustomTopicAdd: (topic: string) => void;
  ragEnabled?: boolean;
  onRagToggle?: (enabled: boolean) => void;
}

export const GeneratorForm: React.FC<GeneratorFormProps> = ({
  topics,
  titleSuggestions,
  selectedTopic,
  selectedKeywords,
  title,
  contentType,
  creativity,
  contentPreferences,
  isLoadingTopics,
  isGenerating,
  onTopicSelect,
  onTitleSelect,
  onTopicDelete,
  onContentTypeChange,
  onCreativityChange,
  onContentPreferenceToggle,
  onGenerateTopics,
  onRegenerateTopics,
  onGenerateContent,
  onCustomTopicAdd,
  ragEnabled = false,
  onRagToggle = () => {}
}) => {
  const [activeTab, setActiveTab] = useState("topics");
  const isPineconeReady = isPineconeConfigured();

  useEffect(() => {
    if (contentPreferences.length === 0) {
      const availableContentPreferences = [
        "Include meta descriptions",
        "Focus on H1/H2 tags",
        "Use bullet points",
        "Add internal links",
        "Add tables for data",
        "Include statistics",
        "Add FAQ section"
      ];
      
      availableContentPreferences.forEach(preference => {
        onContentPreferenceToggle(preference);
      });
    }
  }, []);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="topics">1. Topics & Title</TabsTrigger>
          <TabsTrigger value="settings">2. Content Settings</TabsTrigger>
          <TabsTrigger value="advanced">3. Advanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="topics" className="space-y-6">
          <TopicsSection
            topics={topics}
            titleSuggestions={titleSuggestions}
            selectedTopic={selectedTopic}
            selectedKeywords={selectedKeywords}
            title={title}
            isLoadingTopics={isLoadingTopics}
            onTopicSelect={onTopicSelect}
            onTitleSelect={onTitleSelect}
            onTopicDelete={onTopicDelete}
            onGenerateTopics={onGenerateTopics}
            onRegenerateTopics={onRegenerateTopics}
            onCustomTopicAdd={onCustomTopicAdd}
          />
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <ContentSettingsSection
            contentType={contentType}
            creativity={creativity}
            contentPreferences={contentPreferences}
            selectedTopic={selectedTopic}
            title={title}
            onContentTypeChange={onContentTypeChange}
            onCreativityChange={onCreativityChange}
            onContentPreferenceToggle={onContentPreferenceToggle}
          />
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-6">
          <AdvancedSettingsSection
            ragEnabled={ragEnabled}
            onRagToggle={onRagToggle}
          />
        </TabsContent>
      </Tabs>
      
      <Button 
        className="w-full" 
        onClick={onGenerateContent}
        disabled={isGenerating || !title}
      >
        {isGenerating ? (
          <>Generating Content...</>
        ) : (
          <>
            <FileText className="w-4 h-4 mr-2" />
            Generate Content {ragEnabled && isPineconeReady ? '(RAG-Enhanced)' : ''}
          </>
        )}
      </Button>
    </div>
  );
};

export default GeneratorForm;
