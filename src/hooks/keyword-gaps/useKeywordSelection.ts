
import { useState, useEffect } from "react";
import { keywordGapsCache } from "@/components/keyword-gaps/KeywordGapUtils";

export function useKeywordSelection(maxSelectedKeywords: number = 10) {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(
    keywordGapsCache.selectedKeywords || []
  );
  
  useEffect(() => {
    // Load cached selected keywords if available
    if (keywordGapsCache.selectedKeywords) {
      setSelectedKeywords(keywordGapsCache.selectedKeywords);
    }
  }, []);
  
  const handleKeywordSelection = (keyword: string) => {
    let newSelectedKeywords: string[];
    
    if (selectedKeywords.includes(keyword)) {
      // If already selected, remove it from the selection
      newSelectedKeywords = selectedKeywords.filter(k => k !== keyword);
    } else {
      // If not selected, add it if under the limit
      if (selectedKeywords.length >= maxSelectedKeywords) {
        return; // Don't add more than the limit
      }
      newSelectedKeywords = [...selectedKeywords, keyword];
    }
    
    setSelectedKeywords(newSelectedKeywords);
    keywordGapsCache.selectedKeywords = newSelectedKeywords;
  };
  
  return {
    selectedKeywords,
    handleKeywordSelection
  };
}
