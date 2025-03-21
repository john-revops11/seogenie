
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RefreshCw, BookOpen } from "lucide-react";

interface TopicSuggestionsProps {
  topics: string[];
  selectedTopic: string;
  isLoading: boolean;
  onTopicSelect: (topic: string) => void;
  onGenerateTopics: () => void;
}

const TopicSuggestions: React.FC<TopicSuggestionsProps> = ({
  topics,
  selectedTopic,
  isLoading,
  onTopicSelect,
  onGenerateTopics,
}) => {
  return (
    <div className="space-y-2 mt-6">
      <div className="flex justify-between items-center">
        <Label>Topic Suggestions</Label>
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={onGenerateTopics}
          disabled={isLoading}
        >
          {isLoading ? (
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
      
      {topics.length > 0 && (
        <div className="bg-muted/40 p-3 rounded-md max-h-60 overflow-y-auto">
          <div className="space-y-2">
            {topics.map((topic, index) => (
              <div 
                key={index}
                className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                  selectedTopic === topic ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted'
                }`}
                onClick={() => onTopicSelect(topic)}
              >
                <span>{topic}</span>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onTopicSelect(topic);
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
  );
};

export default TopicSuggestions;
