
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { keywordGapsCache } from "@/components/keyword-gaps/KeywordGapUtils";

export function useKeywordSelection() {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(keywordGapsCache.selectedKeywords || []);

  // Update the cache whenever selectedKeywords changes
  useEffect(() => {
    keywordGapsCache.selectedKeywords = selectedKeywords;
  }, [selectedKeywords]);

  const handleKeywordSelection = (keyword: string) => {
    const updatedSelection = selectedKeywords.includes(keyword)
      ? selectedKeywords.filter(k => k !== keyword)
      : [...selectedKeywords, keyword];
    
    if (updatedSelection.length > 10 && !selectedKeywords.includes(keyword)) {
      toast.error("You can select a maximum of 10 keywords");
      return;
    }
    
    setSelectedKeywords(updatedSelection);
    
    if (selectedKeywords.includes(keyword)) {
      toast.info(`Removed "${keyword}" from selection`);
    } else {
      toast.success(`Added "${keyword}" to selection`);
    }
  };

  // Add this getter function to ensure we can access the most current selection
  const getSelectedKeywords = () => {
    return selectedKeywords;
  };

  return {
    selectedKeywords,
    setSelectedKeywords,
    handleKeywordSelection,
    getSelectedKeywords
  };
}
