
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface KeywordGapFilterProps {
  filterCompetitor: string;
  onFilterChange: (value: string) => void;
  uniqueCompetitors: string[];
  totalKeywords: number;
  onRefreshAnalysis: () => void;
}

export function KeywordGapFilter({
  filterCompetitor,
  onFilterChange,
  uniqueCompetitors,
  totalKeywords,
  onRefreshAnalysis
}: KeywordGapFilterProps) {
  const [prevCompetitorCount, setPrevCompetitorCount] = useState(uniqueCompetitors.length);
  
  // Enhanced debugging for competitors
  useEffect(() => {
    console.log("Unique competitors in filter:", uniqueCompetitors);
    if (uniqueCompetitors.length !== prevCompetitorCount) {
      console.log(`Competitor count changed: ${prevCompetitorCount} -> ${uniqueCompetitors.length}`);
    }
  }, [uniqueCompetitors, prevCompetitorCount]);
  
  // Detect when new competitors are added
  useEffect(() => {
    if (uniqueCompetitors.length > prevCompetitorCount) {
      console.log("New competitor detected in keyword gaps filter");
      onRefreshAnalysis();
    }
    setPrevCompetitorCount(uniqueCompetitors.length);
  }, [uniqueCompetitors.length, prevCompetitorCount, onRefreshAnalysis]);

  return (
    <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center">
      <div className="w-full sm:w-auto">
        <Select value={filterCompetitor} onValueChange={onFilterChange}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by competitor" />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            <SelectItem value="all">All Competitors ({uniqueCompetitors.length})</SelectItem>
            {uniqueCompetitors.map(comp => (
              <SelectItem key={comp} value={comp}>{comp}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2 items-center">
        <Badge variant="outline">
          {totalKeywords} keyword gaps found
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefreshAnalysis}
          className="text-xs"
        >
          Refresh Analysis
        </Button>
      </div>
    </div>
  );
}

export default KeywordGapFilter;
