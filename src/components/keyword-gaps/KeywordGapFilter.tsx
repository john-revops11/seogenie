
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useEffect, useState } from "react";

interface KeywordGapFilterProps {
  filterCompetitor: string;
  onFilterChange: (value: string) => void;
  uniqueCompetitors: string[];
  totalKeywords: number;
  onRefreshAnalysis: () => void;
  onVolumeFilterChange: (min: number, max: number) => void;
  onKdFilterChange: (min: number, max: number) => void;
}

export function KeywordGapFilter({
  filterCompetitor,
  onFilterChange,
  uniqueCompetitors,
  totalKeywords,
  onRefreshAnalysis,
  onVolumeFilterChange,
  onKdFilterChange
}: KeywordGapFilterProps) {
  const [prevCompetitorCount, setPrevCompetitorCount] = useState(uniqueCompetitors.length);
  const [volumeRange, setVolumeRange] = useState([0, 10000]);
  const [kdRange, setKdRange] = useState([0, 100]);
  
  // Enhanced debugging for competitors
  useEffect(() => {
    console.log("Unique competitors in filter component:", uniqueCompetitors);
    if (uniqueCompetitors.length !== prevCompetitorCount) {
      console.log(`Competitor count changed in filter: ${prevCompetitorCount} -> ${uniqueCompetitors.length}`);
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

  const handleVolumeChange = (value: number[]) => {
    setVolumeRange(value);
    onVolumeFilterChange(value[0], value[1]);
  };

  const handleKdChange = (value: number[]) => {
    setKdRange(value);
    onKdFilterChange(value[0], value[1]);
  };

  return (
    <div className="space-y-4">
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
          <Badge variant="outline" className="text-xs">
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
      
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Monthly Search Volume</Label>
          <div className="px-2">
            <Slider
              min={0}
              max={10000}
              step={100}
              value={volumeRange}
              onValueChange={handleVolumeChange}
              className="w-full"
            />
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              <span>{volumeRange[0]}</span>
              <span>{volumeRange[1]}</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Keyword Difficulty (KD)</Label>
          <div className="px-2">
            <Slider
              min={0}
              max={100}
              step={1}
              value={kdRange}
              onValueChange={handleKdChange}
              className="w-full"
            />
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              <span>{kdRange[0]}</span>
              <span>{kdRange[1]}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KeywordGapFilter;
