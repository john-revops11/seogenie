
import React from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";
import ContentTypeSelector from "@/components/content-generator/ContentTypeSelector";
import ApiIntegrationManager from "@/components/ApiIntegrationManager";
import { Separator } from "@/components/ui/separator";
import DataForSeoUsageCard from "@/components/settings/DataForSeoUsageCard";

interface SettingsTabContentProps {
  contentType: string;
  creativity: number;
  contentPreferences: string[];
  selectedTopic: string;
  selectedKeywords: string[];
  title: string;
  onContentTypeChange: (value: string) => void;
  onCreativityChange: (value: number) => void;
  onContentPreferenceToggle: (preference: string) => void;
}

export const SettingsTabContent: React.FC<SettingsTabContentProps> = ({
  contentType,
  creativity,
  contentPreferences,
  selectedTopic,
  selectedKeywords,
  title,
  onContentTypeChange,
  onCreativityChange,
  onContentPreferenceToggle,
}) => {
  const contentPreferenceOptions = [
    { label: "Data-Driven", value: "data-driven" },
    { label: "SEO-Focused", value: "seo-focused" },
    { label: "Examples", value: "examples" },
    { label: "Statistics", value: "statistics" },
    { label: "Actionable", value: "actionable" },
    { label: "FAQ Section", value: "faq" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Content Generation Settings</h2>
        <div className="space-y-2">
          <Label className="text-base">Content Type</Label>
          <ContentTypeSelector 
            value={contentType}
            onChange={onContentTypeChange}
          />
        </div>
        
        <div className="space-y-2 mt-4">
          <div className="flex justify-between">
            <Label className="text-base">Creativity Level</Label>
            <span className="text-sm text-muted-foreground">{creativity}%</span>
          </div>
          <Slider 
            value={[creativity]} 
            min={0} 
            max={100} 
            step={10}
            onValueChange={(values) => onCreativityChange(values[0])}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Factual</span>
            <span>Balanced</span>
            <span>Creative</span>
          </div>
        </div>
        
        <div className="space-y-2 mt-4">
          <Label className="text-base">Content Preferences</Label>
          <div className="flex flex-wrap gap-2">
            {contentPreferenceOptions.map((preference) => (
              <Toggle
                key={preference.value}
                variant="outline"
                pressed={contentPreferences.includes(preference.value)}
                onPressedChange={() => onContentPreferenceToggle(preference.value)}
              >
                {preference.label}
              </Toggle>
            ))}
          </div>
        </div>
        
        <div className="space-y-2 p-3 border rounded-md mt-4">
          <Label className="text-base">Content Overview</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm font-medium">Title:</p>
              <p className="text-sm text-muted-foreground">{title || "Not set"}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Topic:</p>
              <p className="text-sm text-muted-foreground">{selectedTopic || "Not set"}</p>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-sm font-medium">Keywords:</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {selectedKeywords.length > 0 ? (
                selectedKeywords.map(keyword => (
                  <Badge key={keyword} variant="outline" className="text-xs">
                    {keyword}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No keywords selected</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold mb-4">API Integrations</h2>
          <ApiIntegrationManager />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">API Usage Statistics</h2>
          <DataForSeoUsageCard />
        </div>
      </div>
    </div>
  );
};

export default SettingsTabContent;
