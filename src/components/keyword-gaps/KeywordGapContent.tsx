
import { CardContent } from "@/components/ui/card";
import { KeywordGap } from "@/services/keywordService";
import KeywordGapFilter from "./KeywordGapFilter";
import KeywordGapList from "./KeywordGapList";
import KeywordGapEmpty from "./KeywordGapEmpty";
import KeywordGapLoader from "./KeywordGapLoader";
import { getUniqueCompetitors } from "./KeywordGapUtils";

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
