
import { useState, useEffect } from "react";
import { KeywordGap } from "@/services/keywordService";
import { useKeywordGaps } from "@/hooks/useKeywordGaps";
import { 
  keywordGapsCache, 
  normalizeDomainList
} from "@/components/keyword-gaps/KeywordGapUtils";
import { useKeywordGapApi } from "./keyword-gaps/useKeywordGapApi";
import { useKeywordGapPagination } from "./keyword-gaps/useKeywordGapPagination";
import { useKeywordSelection } from "./keyword-gaps/useKeywordSelection";
import { useKeywordGapSettings } from "./keyword-gaps/useKeywordGapSettings";

export function useKeywordGapAnalysis(
  domain: string,
  competitorDomains: string[],
  keywords: any[],
  isLoading: boolean
) {
  const [keywordGaps, setKeywordGaps] = useState<KeywordGap[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastKeywordsLength, setLastKeywordsLength] = useState(0);
  
  const { haveCompetitorsChanged: checkCompetitorsChanged } = useKeywordGaps();
  const { fetchKeywordGaps } = useKeywordGapApi();
  const { apiSource, locationCode, handleApiSourceChange, handleLocationChange } = useKeywordGapSettings();
  const { selectedKeywords, handleKeywordSelection } = useKeywordSelection();
  const { 
    currentPage, 
    itemsPerPage,
    displayedKeywords,
    filterCompetitor,
    setCurrentPage,
    setItemsPerPage,
    setFilterCompetitor,
    handlePageChange, 
    handleCompetitorFilterChange,
    getPaginationInfo
  } = useKeywordGapPagination(keywordGaps);

  // Check if keywords array has changed (new analysis or competitor added)
  useEffect(() => {
    if (keywords.length !== lastKeywordsLength && keywords.length > 0) {
      console.log(`Keywords array changed: ${lastKeywordsLength} -> ${keywords.length}`);
      setLastKeywordsLength(keywords.length);
      // If we already have keyword gaps, this means a competitor was likely added
      if (keywordGapsCache.data && keywordGapsCache.data.length > 0) {
        refreshAnalysis();
      }
    }
  }, [keywords.length, lastKeywordsLength]);

  // Detect competitor changes
  useEffect(() => {
    const normalizedCachedCompetitors = normalizeDomainList(keywordGapsCache.competitorDomains || []);
    const normalizedCurrentCompetitors = normalizeDomainList(competitorDomains);
    
    // Check if the competitor list is different
    const hasChanged = normalizedCachedCompetitors.length !== normalizedCurrentCompetitors.length ||
                      !normalizedCachedCompetitors.every(comp => normalizedCurrentCompetitors.includes(comp));
    
    if (hasChanged && keywords.length > 0 && keywordGapsCache.data?.length > 0) {
      console.log("Competitor domains have changed, refreshing analysis");
      console.log("Cached:", normalizedCachedCompetitors);
      console.log("Current:", normalizedCurrentCompetitors);
      refreshAnalysis();
    }
  }, [competitorDomains, domain, keywords]);

  useEffect(() => {
    const generateKeywordGaps = async () => {
      if (isLoading || !keywords || keywords.length === 0) return;
      
      const shouldRefreshAnalysis = checkCompetitorsChanged(domain, competitorDomains);
      
      if (
        !shouldRefreshAnalysis &&
        keywordGapsCache.data &&
        keywordGapsCache.domain === domain &&
        keywordGapsCache.keywordsLength === keywords.length &&
        keywordGapsCache.locationCode === locationCode
      ) {
        setKeywordGaps(keywordGapsCache.data);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const gaps = await fetchKeywordGaps(domain, competitorDomains, keywords, apiSource, locationCode);
        
        if (gaps && gaps.length > 0) {
          setKeywordGaps(gaps);
          setFilterCompetitor("all");
          setCurrentPage(1); // Reset to first page when new data is loaded
        } else {
          setKeywordGaps([]);
          setError("No keyword gaps found. This could be due to missing API configuration or insufficient data.");
        }
      } catch (error) {
        console.error("Error generating keyword gaps:", error);
        setError(`Failed to analyze keyword gaps: ${(error as Error).message}`);
        setKeywordGaps([]);
      } finally {
        setLoading(false);
      }
    };
    
    generateKeywordGaps();
  }, [domain, competitorDomains, keywords, isLoading, checkCompetitorsChanged, apiSource, locationCode]);

  const refreshAnalysis = async () => {
    keywordGapsCache.data = null;
    setKeywordGaps(null);
    setError(null);
    
    setLoading(true);
    try {
      const gaps = await fetchKeywordGaps(domain, competitorDomains, keywords, apiSource, locationCode);
      
      if (gaps && gaps.length > 0) {
        setKeywordGaps(gaps);
        handleCompetitorFilterChange("all");
        handlePageChange(1); // Reset to first page when new data is loaded
      } else {
        setKeywordGaps([]);
        setError("No keyword gaps found. Check API configuration or try different competitors.");
      }
    } catch (error) {
      console.error("Error refreshing keyword gaps:", error);
      setError(`Failed to analyze keyword gaps: ${(error as Error).message}`);
      setKeywordGaps([]);
    } finally {
      setLoading(false);
    }
  };

  // Get pagination info
  const { totalKeywords, totalPages, startItem, endItem } = getPaginationInfo();

  return {
    keywordGaps,
    loading,
    error,
    selectedKeywords,
    currentPage,
    itemsPerPage,
    displayedKeywords,
    filterCompetitor,
    apiSource,
    locationCode,
    totalKeywords,
    totalPages,
    startItem,
    endItem,
    handleKeywordSelection,
    handlePageChange,
    handleCompetitorFilterChange,
    handleApiSourceChange,
    handleLocationChange,
    refreshAnalysis
  };
}
