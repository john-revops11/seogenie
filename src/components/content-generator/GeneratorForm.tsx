import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { 
  RefreshCcw, 
  Sparkles, 
  FileText, 
  Plus,
  CheckCircle2,
  Settings
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { TopicsList } from "./TopicsList";
import { TitleSuggestions } from "./TitleSuggestions";
import { RagSettings } from "./RagSettings";
import { isPineconeConfigured } from "@/services/vector/pineconeService";

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
  const [newTopic, setNewTopic] = useState("");
  const [activeTab, setActiveTab] = useState("topics");
  const isPineconeReady = isPineconeConfigured();

  const handleAddCustomTopic = () => {
    if (newTopic.trim() === "") {
      toast.error("Please enter a topic");
      return;
    }
    
    onCustomTopicAdd(newTopic);
    setNewTopic("");
  };

  const availableContentPreferences = [
    "Include meta descriptions",
    "Focus on H1/H2 tags",
    "Use bullet points",
    "Add internal links",
    "Add tables for data",
    "Include statistics",
    "Add FAQ section"
  ];

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="topics">1. Topics & Title</TabsTrigger>
          <TabsTrigger value="settings">2. Content Settings</TabsTrigger>
          <TabsTrigger value="advanced">3. Advanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="topics" className="space-y-6">
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
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <div className="space-y-4">
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
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="white-paper">White Paper</SelectItem>
                  <SelectItem value="case-study">Case Study</SelectItem>
                  <SelectItem value="guide">Guide</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="creativity-slider">Creativity Level: {creativity}%</Label>
                <Sparkles className={`w-4 h-4 ${creativity > 50 ? 'text-amber-500' : 'text-gray-400'}`} />
              </div>
              <Slider 
                id="creativity-slider"
                value={[creativity]} 
                min={0} 
                max={100}
                step={5}
                onValueChange={(values) => onCreativityChange(values[0])}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Factual</span>
                <span>Balanced</span>
                <span>Creative</span>
              </div>
            </div>
            
            <div className="space-y-2 pt-4">
              <Label>Content Preferences</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {availableContentPreferences.map(preference => (
                  <Badge
                    key={preference}
                    variant={contentPreferences.includes(preference) ? "default" : "outline"}
                    className={`cursor-pointer flex items-center justify-between gap-1 ${
                      contentPreferences.includes(preference) 
                        ? 'bg-primary hover:bg-primary/90' 
                        : 'hover:bg-primary/10'
                    }`}
                    onClick={() => onContentPreferenceToggle(preference)}
                  >
                    {preference}
                    {contentPreferences.includes(preference) && (
                      <CheckCircle2 className="w-3 h-3" />
                    )}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Select preferences to customize your generated content
              </p>
            </div>
          </div>
          
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="p-4">
              <div className="text-sm">
                <strong>Selected topic:</strong> {selectedTopic || "None selected"}
              </div>
              <div className="text-sm mt-1">
                <strong>Title:</strong> {title || "None set"}
              </div>
              <div className="text-sm mt-1">
                <strong>Content type:</strong> {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
              </div>
              {contentPreferences.length > 0 && (
                <div className="text-sm mt-1">
                  <strong>Preferences:</strong> {contentPreferences.join(', ')}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label className="text-base">Advanced Settings</Label>
              <Settings className="w-4 h-4 text-muted-foreground" />
            </div>
            
            <RagSettings 
              enabled={ragEnabled && isPineconeReady} 
              onToggle={onRagToggle}
            />
            
            <div className="text-xs text-muted-foreground">
              These advanced settings help improve content quality and keyword organization
              by leveraging additional tools and technologies.
            </div>
          </div>
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
