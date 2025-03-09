
import { CardContent } from "@/components/ui/card";
import { KeywordGap } from "@/services/keywordService";
import KeywordGapFilter from "./KeywordGapFilter";
import KeywordGapList from "./KeywordGapList";
import KeywordGapEmpty from "./KeywordGapEmpty";
import KeywordGapLoader from "./KeywordGapLoader";
import { getUniqueCompetitors } from "./KeywordGapUtils";
import { useEffect } from "react";

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
  // Enhanced logging for debugging competitor issues
  useEffect(() => {
    if (keywordGaps && keywordGaps.length > 0) {
      const competitors = getUniqueCompetitors(keywordGaps);
      console.log("Available competitors in gaps:", competitors);
      
      // Group gaps by competitor for better debugging
      const gapsByCompetitor = new Map<string, number>();
      keywordGaps.forEach(gap => {
        if (gap.competitor) {
          gapsByCompetitor.set(gap.competitor, (gapsByCompetitor.get(gap.competitor) || 0) + 1);
        }
      });
      console.log("Gaps distribution by competitor:", Object.fromEntries(gapsByCompetitor));
    } else {
      console.log("No keyword gaps data available yet");
    }
  }, [keywordGaps]);

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
          />
          
          <KeywordGapList
            keywords={displayedKeywords}
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
