
import { useState, useEffect } from "react";
import { KeywordGap } from "@/services/keywords/keywordGaps";
import { useKeywordGaps } from "@/hooks/useKeywordGaps";
import { 
  keywordGapsCache, 
  normalizeDomainList,
  normalizeDomain
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
  const [keywordTypeFilter, setKeywordTypeFilter] = useState("all");
  
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

  // Log competitor domains for debugging
  useEffect(() => {
    if (competitorDomains.length > 0) {
      console.log("Current competitor domains in analysis:", competitorDomains);
    }
  }, [competitorDomains]);

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
      console.log("Cached competitors:", normalizedCachedCompetitors);
      console.log("Current competitors:", normalizedCurrentCompetitors);
      refreshAnalysis();
    }
  }, [competitorDomains, domain, keywords]);

  useEffect(() => {
    const generateKeywordGaps = async () => {
      if (isLoading || !keywords || keywords.length === 0) return;
      
      // Normalize domains for comparison
      const normalizedDomain = normalizeDomain(domain);
      const normalizedCompetitors = normalizeDomainList(competitorDomains);
      
      // Check if we need to refresh the analysis
      const domainChanged = normalizedDomain !== normalizeDomain(keywordGapsCache.domain || '');
      const competitorsChanged = keywordGapsCache.competitorDomains?.length !== normalizedCompetitors.length ||
                               !normalizedCompetitors.every(comp => 
                                 keywordGapsCache.competitorDomains?.map(normalizeDomain).includes(comp)
                               );
                               
      console.log("Domain changed:", domainChanged, "Competitors changed:", competitorsChanged);
      
      if (
        !domainChanged && 
        !competitorsChanged &&
        keywordGapsCache.data &&
        keywordGapsCache.keywordsLength === keywords.length &&
        keywordGapsCache.locationCode === locationCode
      ) {
        console.log("Using cached keyword gaps data");
        setKeywordGaps(keywordGapsCache.data);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Make sure to pass normalized domain names for consistent display
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
  }, [domain, competitorDomains, keywords, isLoading, apiSource, locationCode]);

  const handleKeywordTypeFilterChange = (value: string) => {
    setKeywordTypeFilter(value);
    setCurrentPage(1); // Reset to first page when changing filter
  };

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
    keywordTypeFilter,
    totalKeywords,
    totalPages,
    startItem,
    endItem,
    handleKeywordSelection,
    handlePageChange,
    handleCompetitorFilterChange,
    handleApiSourceChange,
    handleLocationChange,
    handleKeywordTypeFilterChange,
    refreshAnalysis
  };
}
