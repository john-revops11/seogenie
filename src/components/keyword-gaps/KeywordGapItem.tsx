import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Plus, FileText, X } from "lucide-react";
import { KeywordGap } from "@/services/keywords/keywordGaps";
import { categorizeKeywordIntent } from "./KeywordGapUtils";
import { keywordGapsCache } from "./KeywordGapUtils";

interface KeywordGapItemProps {
  gap: KeywordGap;
  isSelected: boolean;
  onKeywordSelection: (keyword: string) => void;
}

export function KeywordGapItem({ gap, isSelected, onKeywordSelection }: KeywordGapItemProps) {
  const intent = categorizeKeywordIntent(gap.keyword, gap.difficulty || 0, gap.volume);
  const competitor = gap.competitors && gap.competitors.length > 0 ? gap.competitors[0] : null;
  
  // Function to handle keyword selection/deselection with cache update
  const handleKeywordSelection = () => {
    onKeywordSelection(gap.keyword);
    
    // Update the cache (the onKeywordSelection function will already update the state)
    const currentCache = keywordGapsCache.selectedKeywords || [];
    if (isSelected) {
      // Remove from cache if selected
      keywordGapsCache.selectedKeywords = currentCache.filter(k => k !== gap.keyword);
    } else {
      // Add to cache if not selected
      keywordGapsCache.selectedKeywords = [...currentCache, gap.keyword];
    }
    
    console.log("Updated keyword selection cache:", keywordGapsCache.selectedKeywords);
  };
  
  // Function to trigger content generation directly from keyword
  const handleGenerateContent = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selection toggle
    
    // Create and dispatch a custom event
    const event = new CustomEvent('generate-content-from-keyword', {
      detail: { primaryKeyword: gap.keyword }
    });
    window.dispatchEvent(event);
  };
  
  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md hover:bg-muted transition-all">
      <div>
        <div className="font-medium">{gap.keyword}</div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {gap.mainDomainRanks !== undefined && (
            <span className="text-amber-500 font-medium">
              {gap.mainDomainRanks ? "Your domain ranks" : "Competitor ranks"}
            </span>
          )}
          {competitor && <span>on {competitor}</span>}
          <Badge className={`text-xs ${getIntentBadgeColor(gap.keyword, gap.difficulty || 0, gap.volume)}`}>
            {intent.charAt(0).toUpperCase() + intent.slice(1)}
          </Badge>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
          {gap.volume.toLocaleString()} vol
        </Badge>
        <Badge variant="outline" className={`text-xs ${getDifficultyColor(gap.difficulty || 0)}`}>
          {gap.difficulty || 0} KD
        </Badge>
        <Button 
          variant={isSelected ? "outline" : "revology"}
          size="sm"
          className={`min-w-[80px] flex items-center justify-center gap-1 shadow-sm hover:translate-y-[-1px] transition-all`}
          onClick={handleKeywordSelection}
        >
          {isSelected ? (
            <>
              <X className="h-3.5 w-3.5" />
              <span>Remove</span>
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" />
              <span>Add</span>
            </>
          )}
        </Button>
        {isSelected && (
          <Button
            variant="outline"
            size="sm"
            className="ml-1 flex items-center justify-center gap-1"
            onClick={handleGenerateContent}
            title="Generate content with this keyword"
          >
            <FileText className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

// Helper functions
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
