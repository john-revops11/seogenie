
import React from "react";
import { Label } from "@/components/ui/label";

interface ContentStylePreferencesProps {
  contentPreferences: string[];
  selectedPreferences: string[];
  onTogglePreference: (preference: string) => void;
}

const ContentStylePreferences: React.FC<ContentStylePreferencesProps> = ({
  contentPreferences,
  selectedPreferences,
  onTogglePreference,
}) => {
  return (
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
  );
};

export default ContentStylePreferences;
