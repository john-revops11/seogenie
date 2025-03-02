
import React from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, CheckCircle2 } from "lucide-react";

interface ContentSettingsSectionProps {
  contentType: string;
  creativity: number;
  contentPreferences: string[];
  selectedTopic: string;
  title: string;
  onContentTypeChange: (value: string) => void;
  onCreativityChange: (value: number) => void;
  onContentPreferenceToggle: (preference: string) => void;
}

const ContentSettingsSection: React.FC<ContentSettingsSectionProps> = ({
  contentType,
  creativity,
  contentPreferences,
  selectedTopic,
  title,
  onContentTypeChange,
  onCreativityChange,
  onContentPreferenceToggle
}) => {
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
    </div>
  );
};

export default ContentSettingsSection;
