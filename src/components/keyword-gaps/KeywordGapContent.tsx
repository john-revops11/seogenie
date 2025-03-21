
import { CardContent } from "@/components/ui/card";
import { KeywordGap } from "@/services/keywordService";
import KeywordGapFilter from "./KeywordGapFilter";
import KeywordGapList from "./KeywordGapList";
import KeywordGapEmpty from "./KeywordGapEmpty";
import KeywordGapLoader from "./KeywordGapLoader";
import { getUniqueCompetitors } from "./KeywordGapUtils";
import { useEffect, useState } from "react";

interface KeywordGapContentProps {
  keywordGaps: KeywordGap[] | null;
  displayedKeywords: KeywordGap[];
  filterCompetitor: string;
  onFilterChange: (value: string) => void;
  selectedKeywords: string[];
  onKeywordSelection: (keyword: string) => void;
  loading: boolean;
  isLoading: boolean;
  error: string | null;
  onRefreshAnalysis: () => void;
  totalKeywords: number;
}

export function KeywordGapContent({
  keywordGaps,
  displayedKeywords,
  filterCompetitor,
  onFilterChange,
  selectedKeywords,
  onKeywordSelection,
  loading,
  isLoading,
  error,
  onRefreshAnalysis,
  totalKeywords
}: KeywordGapContentProps) {
  const [volumeFilter, setVolumeFilter] = useState<[number, number]>([0, 10000]);
  const [kdFilter, setKdFilter] = useState<[number, number]>([0, 100]);
  const [filteredKeywords, setFilteredKeywords] = useState(displayedKeywords);
  const [keywordTypeFilter, setKeywordTypeFilter] = useState("all");

  useEffect(() => {
    if (keywordGaps && keywordGaps.length > 0) {
      const competitors = getUniqueCompetitors(keywordGaps);
      console.log("Available competitors in gaps:", competitors);
      
      const gapsByCompetitor = new Map<string, number>();
      keywordGaps.forEach(gap => {
        if (gap.competitors && gap.competitors.length > 0) {
          // Get the first competitor for each gap
          const firstCompetitor = gap.competitors[0];
          gapsByCompetitor.set(firstCompetitor, (gapsByCompetitor.get(firstCompetitor) || 0) + 1);
        }
      });
      console.log("Gaps distribution by competitor:", Object.fromEntries(gapsByCompetitor));
    } else {
      console.log("No keyword gaps data available yet");
    }
  }, [keywordGaps]);

  useEffect(() => {
    let filtered = [...displayedKeywords];
    
    // Apply volume filter
    filtered = filtered.filter(
      kw => kw.volume >= volumeFilter[0] && kw.volume <= volumeFilter[1]
    );
    
    // Apply KD filter
    filtered = filtered.filter(
      kw => (kw.difficulty || 0) >= kdFilter[0] && (kw.difficulty || 0) <= kdFilter[1]
    );
    
    // Apply keyword type filter
    if (keywordTypeFilter !== "all") {
      if (keywordTypeFilter === "gaps") {
        // Keyword gaps: Keywords that competitors rank for but the main domain doesn't
        filtered = filtered.filter(kw => kw.isHighValue === true);
      } else if (keywordTypeFilter === "missing") {
        // Missing keywords: Keywords that the main domain doesn't rank for at all
        filtered = filtered.filter(kw => kw.mainDomainRanks === false);
      } else if (keywordTypeFilter === "shared") {
        // Shared keywords: Keywords that both main domain and competitors rank for
        filtered = filtered.filter(kw => kw.isLongTail === true);
      }
    }
    
    setFilteredKeywords(filtered);
  }, [displayedKeywords, volumeFilter, kdFilter, keywordTypeFilter]);

  const handleKeywordTypeFilterChange = (value: string) => {
    setKeywordTypeFilter(value);
  };

  return (
    <CardContent className="space-y-4">
      {error && !loading && !isLoading && (
        <KeywordGapEmpty error={error} onRefreshAnalysis={onRefreshAnalysis} />
      )}
      
      {(loading || isLoading) ? (
        <KeywordGapLoader />
      ) : keywordGaps && keywordGaps.length > 0 ? (
        <>
          <KeywordGapFilter
            filterCompetitor={filterCompetitor}
            onFilterChange={onFilterChange}
            uniqueCompetitors={getUniqueCompetitors(keywordGaps)}
            totalKeywords={totalKeywords}
            onRefreshAnalysis={onRefreshAnalysis}
            onVolumeFilterChange={(min, max) => setVolumeFilter([min, max])}
            onKdFilterChange={(min, max) => setKdFilter([min, max])}
            keywordTypeFilter={keywordTypeFilter}
            onKeywordTypeFilterChange={handleKeywordTypeFilterChange}
          />
          
          <KeywordGapList
            keywords={filteredKeywords}
            selectedKeywords={selectedKeywords}
            onKeywordSelection={onKeywordSelection}
          />
        </>
      ) : (
        <KeywordGapEmpty error={error} onRefreshAnalysis={onRefreshAnalysis} />
      )}
    </CardContent>
  );
}

export default KeywordGapContent;
