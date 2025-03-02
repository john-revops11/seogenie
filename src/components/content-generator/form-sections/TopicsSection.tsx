
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, RefreshCcw } from "lucide-react";
import TopicsList from "../TopicsList";
import TitleSuggestions from "../TitleSuggestions";

interface TopicsSectionProps {
  topics: string[];
  titleSuggestions: { [topic: string]: string[] };
  selectedTopic: string;
  selectedKeywords: string[];
  title: string;
  isLoadingTopics: boolean;
  onTopicSelect: (topic: string) => void;
  onTitleSelect: (title: string) => void;
  onTopicDelete: (topic: string) => void;
  onGenerateTopics: () => void;
  onRegenerateTopics: () => void;
  onCustomTopicAdd: (topic: string) => void;
}

const TopicsSection: React.FC<TopicsSectionProps> = ({
  topics,
  titleSuggestions,
  selectedTopic,
  selectedKeywords,
  title,
  isLoadingTopics,
  onTopicSelect,
  onTitleSelect,
  onTopicDelete,
  onGenerateTopics,
  onRegenerateTopics,
  onCustomTopicAdd
}) => {
  const [newTopic, setNewTopic] = useState("");

  const handleAddCustomTopic = () => {
    if (newTopic.trim() === "") {
      toast.error("Please enter a topic");
      return;
    }
    
    onCustomTopicAdd(newTopic);
    setNewTopic("");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-base">SEO-Optimized Topics</Label>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onGenerateTopics}
              disabled={isLoadingTopics || selectedKeywords.length === 0}
            >
              Generate Topics
            </Button>
            {topics.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onRegenerateTopics} 
                disabled={isLoadingTopics}
              >
                <RefreshCcw className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        
        {selectedKeywords.length > 0 ? (
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">
              Selected keywords: 
            </div>
            <div className="flex flex-wrap gap-1">
              {selectedKeywords.map(keyword => (
                <Badge key={keyword} variant="secondary">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            Select keywords from the dashboard to generate topic ideas
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        <div className="flex-1">
          <Input 
            value={newTopic} 
            onChange={(e) => setNewTopic(e.target.value)}
            placeholder="Add custom topic..."
            disabled={isLoadingTopics}
          />
        </div>
        <Button 
          variant="outline" 
          onClick={handleAddCustomTopic}
          disabled={isLoadingTopics || !newTopic.trim()}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>
      
      <TopicsList 
        topics={topics} 
        selectedTopic={selectedTopic}
        isLoading={isLoadingTopics}
        onSelectTopic={onTopicSelect}
        onDeleteTopic={onTopicDelete}
      />
      
      {selectedTopic && titleSuggestions[selectedTopic] && (
        <TitleSuggestions 
          suggestions={titleSuggestions[selectedTopic]} 
          selectedTitle={title}
          onSelectTitle={onTitleSelect}
        />
      )}
      
      <Textarea 
        placeholder="Custom title (optional)" 
        value={title}
        onChange={(e) => onTitleSelect(e.target.value)}
        className="h-20"
      />
    </div>
  );
};

export default TopicsSection;
