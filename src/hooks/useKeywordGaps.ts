
import { useState } from "react";
import { keywordGapsCache } from "@/components/KeywordGapCard";
import { SeoRecommendation, KeywordGap } from "@/services/keywordService";

export const useKeywordGaps = () => {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(keywordGapsCache.selectedKeywords || []);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
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
  
  const clearKeywordGapsCache = () => {
    keywordGapsCache.data = null;
    keywordGapsCache.domain = "";
    keywordGapsCache.competitorDomains = [];
    keywordGapsCache.keywordsLength = 0;
    keywordGapsCache.page = 1;
  };
  
  const getSelectedKeywordsData = (): KeywordGap[] => {
    if (!keywordGapsCache.data) return [];
    
    return keywordGapsCache.data
      .filter(gap => selectedKeywords.includes(gap.keyword))
      .sort((a, b) => {
        // Sort by isTopOpportunity first (true comes first)
        if (a.isTopOpportunity !== b.isTopOpportunity) {
          return a.isTopOpportunity ? -1 : 1;
        }
        // Then by volume (higher comes first)
        return b.volume - a.volume;
      });
  };
  
  return {
    keywordGaps: keywordGapsCache.data || [],
    seoRecommendations: emptySeoStructure,
    selectedKeywords,
    handleSelectKeywords,
    isLoading,
    setIsLoading,
    error,
    setError,
    clearKeywordGapsCache,
    getSelectedKeywordsData
  };
};
