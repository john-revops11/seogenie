
import { useState } from "react";
import { keywordGapsCache } from "@/components/KeywordGapCard";

export const useKeywordGaps = () => {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(keywordGapsCache.selectedKeywords || []);
  
  const handleSelectKeywords = (keywords: string[]) => {
    setSelectedKeywords(keywords);
    keywordGapsCache.selectedKeywords = keywords;
  };
  
  return {
    keywordGaps: keywordGapsCache.data || [],
    seoRecommendations: {
      onPage: [],
      technical: [],
      content: [],
      offPage: [],
      summary: []
    }, // Initialize with proper structure
    selectedKeywords,
    handleSelectKeywords
  };
};
