
import React from "react";
import { Separator } from "@/components/ui/separator";
import CreativitySlider from "./CreativitySlider";
import RagToggle from "./RagToggle";
import WordCountDropdown from "./WordCountDropdown";
import ContentStylePreferences from "./ContentStylePreferences";

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
      <CreativitySlider 
        creativity={creativity} 
        onCreativityChange={onCreativityChange}
      />

      <RagToggle 
        ragEnabled={ragEnabled} 
        onRagToggle={onRagToggle}
      />
      
      <WordCountDropdown 
        wordCountOption={wordCountOption}
        onWordCountOptionChange={onWordCountOptionChange}
      />

      <Separator className="my-4" />
      
      <ContentStylePreferences
        contentPreferences={contentPreferences}
        selectedPreferences={selectedPreferences}
        onTogglePreference={onTogglePreference}
      />
    </div>
  );
};

export default ContentPreferences;
