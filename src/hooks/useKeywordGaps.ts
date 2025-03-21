import { useState, useEffect } from "react";
import { keywordGapsCache } from "@/components/keyword-gaps/KeywordGapUtils";
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
    keywordGapsCache.data = [];
    keywordGapsCache.domain = "";
    keywordGapsCache.competitorDomains = [];
    keywordGapsCache.keywordsLength = 0;
    keywordGapsCache.currentPage = 1;
    keywordGapsCache.page = 1;
    // Keep the locationCode and selectedKeywords
  };
  
  // This function checks if the competitors have changed
  const haveCompetitorsChanged = (newDomain: string, newCompetitors: string[]) => {
    if (keywordGapsCache.domain !== newDomain) return true;
    
    if (!keywordGapsCache.competitorDomains || 
        newCompetitors.length !== keywordGapsCache.competitorDomains.length) {
      return true;
    }
    
    // Check if all competitors are the same
    return !newCompetitors.every(comp => 
      keywordGapsCache.competitorDomains?.includes(comp)
    );
  };
  
  const getSelectedKeywordsData = (): KeywordGap[] => {
    if (!keywordGapsCache.data) return [];
    
    return keywordGapsCache.data
      .filter(gap => selectedKeywords.includes(gap.keyword))
      .sort((a, b) => {
        // Sort by volume (higher comes first)
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
    getSelectedKeywordsData,
    haveCompetitorsChanged
  };
};
