
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Plus } from "lucide-react";
import { KeywordGap } from "@/services/keywordService";

interface KeywordGapItemProps {
  gap: KeywordGap;
  isSelected: boolean;
  onKeywordSelection: (keyword: string) => void;
}

export function KeywordGapItem({ gap, isSelected, onKeywordSelection }: KeywordGapItemProps) {
  const intent = categorizeKeywordIntent(gap.keyword, gap.difficulty, gap.volume);
  
  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md hover:bg-muted transition-all">
      <div>
        <div className="font-medium">{gap.keyword}</div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="text-amber-500 font-medium">Rank {gap.rank}</span> on {gap.competitor}
          <Badge className={`text-xs ${getIntentBadgeColor(gap.keyword, gap.difficulty, gap.volume)}`}>
            {intent.charAt(0).toUpperCase() + intent.slice(1)}
          </Badge>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
          {gap.volume.toLocaleString()} vol
        </Badge>
        <Badge variant="outline" className={`text-xs ${getDifficultyColor(gap.difficulty)}`}>
          {gap.difficulty} KD
        </Badge>
        <Button 
          variant={isSelected ? "success" : "revology"}
          size="sm"
          className={`min-w-[80px] flex items-center justify-center gap-1 shadow-sm hover:translate-y-[-1px] transition-all`}
          onClick={() => onKeywordSelection(gap.keyword)}
        >
          {isSelected ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>Added</span>
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" />
              <span>Add</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// Helper functions
function categorizeKeywordIntent(keyword: string, difficulty: number, volume: number): 'informational' | 'navigational' | 'commercial' | 'transactional' {
  const informationalPatterns = ['how', 'what', 'why', 'when', 'where', 'guide', 'tutorial', 'tips', 'learn', 'example', 'definition'];
  const navigationalPatterns = ['login', 'signin', 'account', 'download', 'contact', 'support', 'official'];
  const commercialPatterns = ['best', 'top', 'review', 'compare', 'vs', 'versus', 'comparison', 'alternative'];
  const transactionalPatterns = ['buy', 'price', 'cost', 'purchase', 'cheap', 'deal', 'discount', 'order', 'shop'];
  
  const keywordLower = keyword.toLowerCase();
  
  if (informationalPatterns.some(pattern => keywordLower.includes(pattern))) {
    return 'informational';
  }
  
  if (navigationalPatterns.some(pattern => keywordLower.includes(pattern))) {
    return 'navigational';
  }
  
  if (commercialPatterns.some(pattern => keywordLower.includes(pattern))) {
    return 'commercial';
  }
  
  if (transactionalPatterns.some(pattern => keywordLower.includes(pattern))) {
    return 'transactional';
  }
  
  return difficulty < 40 ? 'informational' : 'commercial';
}

function getIntentBadgeColor(keyword: string, difficulty: number, volume: number) {
  const intent = categorizeKeywordIntent(keyword, difficulty, volume);
  switch (intent) {
    case 'informational':
      return "bg-blue-100 text-blue-800";
    case 'navigational':
      return "bg-purple-100 text-purple-800";
    case 'commercial':
      return "bg-amber-100 text-amber-800";
    case 'transactional':
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getDifficultyColor(difficulty: number): string {
  if (difficulty < 30) return "text-green-500";
  if (difficulty < 60) return "text-amber-500";
  return "text-red-500";
}

export default KeywordGapItem;
