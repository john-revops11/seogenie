
import { KeywordGap } from "@/services/keywordService";
import KeywordGapItem from "./KeywordGapItem";

interface KeywordGapListProps {
  keywords: KeywordGap[];
  selectedKeywords: string[];
  onKeywordSelection: (keyword: string) => void;
}

export function KeywordGapList({ keywords, selectedKeywords, onKeywordSelection }: KeywordGapListProps) {
  if (!keywords || keywords.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No keyword gaps found with the current filter.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {keywords.map((gap, index) => (
        <KeywordGapItem
          key={`${gap.keyword}-${gap.competitor}-${index}`}
          gap={gap}
          isSelected={selectedKeywords.includes(gap.keyword)}
          onKeywordSelection={onKeywordSelection}
        />
      ))}
    </div>
  );
}

export default KeywordGapList;
