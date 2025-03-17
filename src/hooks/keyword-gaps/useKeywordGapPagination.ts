
import { useState, useEffect, useMemo } from "react";
import { KeywordGap } from "@/services/keywordService";
import { keywordGapsCache } from "@/components/keyword-gaps/KeywordGapUtils";

export function useKeywordGapPagination(keywordGaps: KeywordGap[] | null) {
  const [currentPage, setCurrentPage] = useState(
    keywordGapsCache.currentPage || 1
  );
  const [itemsPerPage, setItemsPerPage] = useState(
    keywordGapsCache.itemsPerPage || 10
  );
  const [filterCompetitor, setFilterCompetitor] = useState(
    keywordGapsCache.filterCompetitor || "all"
  );
  const [filteredKeywords, setFilteredKeywords] = useState<KeywordGap[]>([]);

  // Apply filters to keyword gaps
  useEffect(() => {
    if (!keywordGaps) {
      setFilteredKeywords([]);
      return;
    }

    let filtered = [...keywordGaps];
    
    // Apply competitor filter if not "all"
    if (filterCompetitor !== "all") {
      filtered = filtered.filter(
        (gap) => gap.competitor === filterCompetitor
      );
    }
    
    setFilteredKeywords(filtered);
    
    // Ensure current page is valid with new filtered set
    const maxPage = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
    
  }, [keywordGaps, filterCompetitor, itemsPerPage]);

  // Get current page items
  const displayedKeywords = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredKeywords.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredKeywords, currentPage, itemsPerPage]);
  
  // Update cache when filters or pagination change
  useEffect(() => {
    keywordGapsCache.currentPage = currentPage;
    keywordGapsCache.itemsPerPage = itemsPerPage;
    keywordGapsCache.filterCompetitor = filterCompetitor;
  }, [currentPage, itemsPerPage, filterCompetitor]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    keywordGapsCache.currentPage = page;
  };

  const handleCompetitorFilterChange = (competitor: string) => {
    setFilterCompetitor(competitor);
    setCurrentPage(1); // Reset to first page when changing filter
    keywordGapsCache.filterCompetitor = competitor;
    keywordGapsCache.currentPage = 1;
  };

  const getPaginationInfo = () => {
    const totalKeywords = filteredKeywords.length;
    const totalPages = Math.ceil(totalKeywords / itemsPerPage) || 1;
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
