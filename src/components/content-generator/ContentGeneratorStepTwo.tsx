
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { WORD_COUNT_OPTIONS } from "./WordCountSelector";

interface ContentGeneratorStepTwoProps {
  title: string;
  keywords: string[];
  creativity: number;
  ragEnabled: boolean;
  contentPreferences: string[];
  selectedPreferences: string[];
  wordCountOption: string;
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
  onTitleChange,
  onKeywordsChange,
  onCreativityChange,
  onRagToggle,
  onTogglePreference,
  onWordCountOptionChange,
  onNext,
  onBack
}) => {
  const [newKeyword, setNewKeyword] = React.useState("");
  
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

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Step 2: Content Details</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Enter your content title"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="keywords">Keywords</Label>
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
            <Label htmlFor="rag-toggle">Use RAG (Retrieval Augmented Generation)</Label>
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
