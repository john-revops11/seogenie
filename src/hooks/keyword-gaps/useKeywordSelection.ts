
import { useState } from "react";
import { toast } from "sonner";
import { keywordGapsCache } from "@/components/keyword-gaps/KeywordGapUtils";

export function useKeywordSelection() {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(keywordGapsCache.selectedKeywords || []);

  const handleKeywordSelection = (keyword: string) => {
    const updatedSelection = selectedKeywords.includes(keyword)
      ? selectedKeywords.filter(k => k !== keyword)
      : [...selectedKeywords, keyword];
    
    if (updatedSelection.length > 10 && !selectedKeywords.includes(keyword)) {
      toast.error("You can select a maximum of 10 keywords");
      return;
    }
    
    setSelectedKeywords(updatedSelection);
    keywordGapsCache.selectedKeywords = updatedSelection;
    
    if (selectedKeywords.includes(keyword)) {
      toast.info(`Removed "${keyword}" from selection`);
    } else {
      toast.success(`Added "${keyword}" to selection`);
    }
  };

  return {
    selectedKeywords,
    setSelectedKeywords,
    handleKeywordSelection
  };
}
