
import { useState, useEffect } from "react";
import { KeywordGap } from "@/services/keywordService";
import { keywordGapsCache } from "@/components/keyword-gaps/KeywordGapUtils";

export function useKeywordGapPagination(keywordGaps: KeywordGap[] | null) {
  const [currentPage, setCurrentPage] = useState(keywordGapsCache.currentPage || 1);
  const [itemsPerPage, setItemsPerPage] = useState(keywordGapsCache.itemsPerPage || 15);
  const [displayedKeywords, setDisplayedKeywords] = useState<KeywordGap[]>([]);
  const [filterCompetitor, setFilterCompetitor] = useState<string>("all");

  useEffect(() => {
    if (!keywordGaps) return;
    
    let filteredKeywords = [...keywordGaps]; // Create a copy to avoid mutations
    
    if (filterCompetitor !== "all") {
      filteredKeywords = keywordGaps.filter(kw => kw.competitor === filterCompetitor);
    }
    
    // Calculate pagination values
    const totalFilteredKeywords = filteredKeywords.length;
    const maxPage = Math.max(1, Math.ceil(totalFilteredKeywords / itemsPerPage));
    
    // Ensure current page is valid
    const validCurrentPage = Math.min(maxPage, Math.max(1, currentPage));
    if (validCurrentPage !== currentPage) {
      setCurrentPage(validCurrentPage);
    }
    
    const startIndex = (validCurrentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalFilteredKeywords);
    
    setDisplayedKeywords(filteredKeywords.slice(startIndex, endIndex));
    
    // Use currentPage consistently everywhere
    keywordGapsCache.currentPage = validCurrentPage;
    keywordGapsCache.page = validCurrentPage; // For backward compatibility
    keywordGapsCache.itemsPerPage = itemsPerPage;
  }, [keywordGaps, currentPage, itemsPerPage, filterCompetitor]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleCompetitorFilterChange = (value: string) => {
    setFilterCompetitor(value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Calculate pagination values for display
  const getPaginationInfo = () => {
    const filteredKeywords = keywordGaps ? (
      filterCompetitor === "all" 
        ? keywordGaps
        : keywordGaps.filter(kw => kw.competitor === filterCompetitor)
    ) : [];
    
    const totalKeywords = filteredKeywords.length;
    const totalPages = Math.max(1, Math.ceil(totalKeywords / itemsPerPage));
    const startItem = totalKeywords === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(startItem + itemsPerPage - 1, totalKeywords);

    return {
      totalKeywords,
      totalPages,
      startItem,
      endItem
    };
  };

  return {
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
  };
}
