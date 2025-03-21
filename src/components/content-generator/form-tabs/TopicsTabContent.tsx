
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RefreshCcw, Plus, KeySquare, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { TopicsList } from "../TopicsList";
import { TitleSuggestions } from "../TitleSuggestions";

interface TopicsTabContentProps {
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
  onKeywordRemove?: (keyword: string) => void;
}

export const TopicsTabContent: React.FC<TopicsTabContentProps> = ({
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
  onCustomTopicAdd,
  onKeywordRemove
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

  const handleKeywordRemove = (keyword: string) => {
    if (onKeywordRemove) {
      onKeywordRemove(keyword);
      toast.info(`Removed "${keyword}" from selected keywords`);
    }
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
            <div className="text-sm text-muted-foreground flex items-center">
              <KeySquare className="w-4 h-4 mr-1 text-revology" />
              Selected keywords from keyword gap analysis: 
            </div>
            <div className="flex flex-wrap gap-1">
              {selectedKeywords.map(keyword => (
                <Badge 
                  key={keyword} 
                  variant="secondary" 
                  className="bg-revology/10 text-revology flex items-center gap-1 pr-1"
                >
                  {keyword}
                  {onKeywordRemove && (
                    <button
                      onClick={() => handleKeywordRemove(keyword)}
                      className="hover:bg-revology/20 rounded-full p-0.5 ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-md">
            <p>No keywords selected. Please select keywords from the Keyword Gap analysis to generate better topics.</p>
            <p className="mt-1 text-xs">These keywords will be used to generate SEO-optimized topics and content.</p>
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

export default TopicsTabContent;
