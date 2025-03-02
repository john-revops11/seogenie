
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, RefreshCw, Plus } from "lucide-react";
import { keywordGapsCache } from "@/components/KeywordGapCard";
import TopicsList from "./TopicsList";
import TitleSuggestions from "./TitleSuggestions";

interface GeneratorFormProps {
  topics: string[];
  titleSuggestions: {[topic: string]: string[]};
  selectedTopic: string;
  selectedKeywords: string[];
  title: string;
  contentType: string;
  creativity: number;
  isLoadingTopics: boolean;
  isGenerating: boolean;
  onTopicSelect: (topic: string) => void;
  onTitleSelect: (title: string) => void;
  onTopicDelete: (topic: string) => void;
  onContentTypeChange: (value: string) => void;
  onCreativityChange: (value: number) => void;
  onGenerateTopics: () => void;
  onRegenerateTopics: () => void;
  onGenerateContent: () => void;
  onCustomTopicAdd: (topic: string) => void;
}

export const GeneratorForm = ({
  topics,
  titleSuggestions,
  selectedTopic,
  selectedKeywords,
  title,
  contentType,
  creativity,
  isLoadingTopics,
  isGenerating,
  onTopicSelect,
  onTitleSelect,
  onTopicDelete,
  onContentTypeChange,
  onCreativityChange,
  onGenerateTopics,
  onRegenerateTopics,
  onGenerateContent,
  onCustomTopicAdd
}: GeneratorFormProps) => {
  const [customTopic, setCustomTopic] = useState("");
  const [showCustomTopicInput, setShowCustomTopicInput] = useState(false);

  const handleAddCustomTopic = () => {
    if (!customTopic.trim()) {
      toast.error("Please enter a custom topic");
      return;
    }
    
    onCustomTopicAdd(customTopic);
    setCustomTopic("");
    setShowCustomTopicInput(false);
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-medium">Selected Keywords</Label>
          <Badge variant="outline">
            {keywordGapsCache.selectedKeywords?.length || 0}/10
          </Badge>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {keywordGapsCache.selectedKeywords && keywordGapsCache.selectedKeywords.length > 0 ? (
            keywordGapsCache.selectedKeywords.map((keyword, idx) => (
              <Badge key={idx} className="bg-revology text-white">
                {keyword}
              </Badge>
            ))
          ) : (
            <div className="text-sm text-muted-foreground p-2">
              No keywords selected. Please select keywords from the Keyword Gaps card.
            </div>
          )}
        </div>
        
        {/* Button to generate topics */}
        {keywordGapsCache.selectedKeywords && keywordGapsCache.selectedKeywords.length > 0 && topics.length === 0 && (
          <Button 
            onClick={onGenerateTopics}
            className="w-full bg-revology hover:bg-revology-dark"
            disabled={isLoadingTopics}
          >
            {isLoadingTopics ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating SEO Topics...
              </>
            ) : (
              <>
                Generate SEO Topics Based on Keyword Gaps
              </>
            )}
          </Button>
        )}
      </div>
      
      {/* Only show topics section if we have topics or if user has selected keywords */}
      {(topics.length > 0 || keywordGapsCache.selectedKeywords?.length > 0) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-revology-dark">SEO Content Topics</h3>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex items-center gap-1 h-8 px-2 text-xs border-revology/30 text-revology hover:bg-revology-light/50"
                onClick={() => setShowCustomTopicInput(true)}
              >
                <Plus className="h-3 w-3" />
                Add Topic
              </Button>
              {topics.length > 0 && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex items-center gap-1 h-8 px-2 text-xs border-revology/30 text-revology hover:bg-revology-light/50"
                  onClick={onRegenerateTopics}
                  disabled={isLoadingTopics}
                >
                  <RefreshCw className={`h-3 w-3 ${isLoadingTopics ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              )}
            </div>
          </div>
          
          {/* Show custom topic input when needed */}
          {showCustomTopicInput && (
            <div className="flex items-center gap-2">
              <Input
                placeholder="Enter a custom topic..."
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleAddCustomTopic} size="sm" className="bg-revology hover:bg-revology-dark">
                Add
              </Button>
            </div>
          )}
          
          {/* Display topics */}
          {topics.length > 0 && (
            <TopicsList
              topics={topics}
              selectedTopic={selectedTopic}
              onSelectTopic={onTopicSelect}
              onDeleteTopic={onTopicDelete}
            />
          )}
          
          {/* Title suggestions */}
          {selectedTopic && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-revology-dark">Title Suggestions</h3>
              <TitleSuggestions
                titles={titleSuggestions[selectedTopic] || []}
                selectedTitle={title}
                onSelectTitle={onTitleSelect}
              />
            </div>
          )}
          
          {/* Content type selection */}
          <div className="space-y-2">
            <Label htmlFor="content-type">Content Type</Label>
            <Select 
              value={contentType} 
              onValueChange={onContentTypeChange}
            >
              <SelectTrigger id="content-type">
                <SelectValue placeholder="Select content type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blog">Blog Post</SelectItem>
                <SelectItem value="case-study">Case Study</SelectItem>
                <SelectItem value="white-paper">White Paper</SelectItem>
                <SelectItem value="article">Article</SelectItem>
                <SelectItem value="guide">Guide</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Creativity slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Creativity</Label>
              <span className="text-sm text-muted-foreground">{creativity}%</span>
            </div>
            <Slider
              value={[creativity]}
              onValueChange={(values) => onCreativityChange(values[0])}
              min={0}
              max={100}
              step={10}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Factual</span>
              <span>Creative</span>
            </div>
          </div>
          
          {/* Generate button */}
          <Button
            className="w-full bg-revology hover:bg-revology-dark mt-4"
            onClick={onGenerateContent}
            disabled={isGenerating || !title}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Content...
              </>
            ) : (
              'Generate Content'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default GeneratorForm;
