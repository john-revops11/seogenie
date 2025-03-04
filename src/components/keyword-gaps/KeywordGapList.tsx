
import { KeywordGap } from "@/services/keywordService";
import KeywordGapItem from "./KeywordGapItem";

interface KeywordGapListProps {
  keywords: KeywordGap[];
  selectedKeywords: string[];
  onKeywordSelection: (keyword: string) => void;
}

export function KeywordGapList({ keywords, selectedKeywords, onKeywordSelection }: KeywordGapListProps) {
  return (
    <div className="space-y-4">
      {keywords.map((gap, index) => (
        <KeywordGapItem
          key={index}
          gap={gap}
          isSelected={selectedKeywords.includes(gap.keyword)}
          onKeywordSelection={onKeywordSelection}
        />
      ))}
    </div>
  );
}

export default KeywordGapList;
