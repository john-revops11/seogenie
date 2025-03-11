
import { useState } from "react";

// Content style preferences that users can select
const DEFAULT_PREFERENCES = [
  "Include statistics and data",
  "Use professional tone",
  "Include examples",
  "Use storytelling approach",
  "Add action items",
  "Include FAQs section",
  "Use bulleted lists",
  "SEO-optimized headings",
  "Include internal linking opportunities"
];

export function useContentPreferences() {
  const [contentPreferences] = useState<string[]>(DEFAULT_PREFERENCES);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  
  const togglePreference = (preference: string) => {
    setSelectedPreferences(prev => 
      prev.includes(preference)
        ? prev.filter(p => p !== preference)
        : [...prev, preference]
    );
  };
  
  return {
    contentPreferences,
    selectedPreferences,
    togglePreference
  };
}
