
import { useState } from "react";
import { keywordGapsCache } from "@/components/KeywordGapCard";
import { SeoRecommendation } from "@/services/keywordService";

export const useKeywordGaps = () => {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(keywordGapsCache.selectedKeywords || []);
  
  const handleSelectKeywords = (keywords: string[]) => {
    setSelectedKeywords(keywords);
    keywordGapsCache.selectedKeywords = keywords;
  };
  
  const emptySeoStructure = {
    onPage: [] as SeoRecommendation[],
    technical: [] as SeoRecommendation[],
    content: [] as SeoRecommendation[],
    offPage: [] as SeoRecommendation[],
    summary: [] as SeoRecommendation[]
  };
  
  return {
    keywordGaps: keywordGapsCache.data || [],
    seoRecommendations: emptySeoStructure,
    selectedKeywords,
    handleSelectKeywords
  };
};
