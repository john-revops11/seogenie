
import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { WORD_COUNT_OPTIONS } from "../WordCountSelector";

interface ContentPreferencesProps {
  creativity: number;
  ragEnabled: boolean;
  wordCountOption: string;
  contentPreferences: string[];
  selectedPreferences: string[];
  onCreativityChange: (value: number) => void;
  onRagToggle: (enabled: boolean) => void;
  onWordCountOptionChange: (option: string) => void;
  onTogglePreference: (preference: string) => void;
}

const ContentPreferences: React.FC<ContentPreferencesProps> = ({
  creativity,
  ragEnabled,
  wordCountOption,
  contentPreferences,
  selectedPreferences,
  onCreativityChange,
  onRagToggle,
  onWordCountOptionChange,
  onTogglePreference,
}) => {
  return (
    <div className="space-y-6">
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
          <div className="flex items-center gap-2">
            <Label htmlFor="rag-toggle">Use RAG (Retrieval Augmented Generation)</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>RAG allows the AI to reference your website's existing content to create more accurate and consistent articles</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
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
  );
};

export default ContentPreferences;
