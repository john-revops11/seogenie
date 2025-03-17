
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApiSource } from "@/services/keywords/keywordGaps";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface KeywordGapDataSourceSelectorProps {
  value: ApiSource;
  onChange: (value: ApiSource) => void;
}

export function KeywordGapDataSourceSelector({ value, onChange }: KeywordGapDataSourceSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Data Source:</span>
      <Select
        value={value}
        onValueChange={(val) => onChange(val as ApiSource)}
      >
        <SelectTrigger className="h-8 w-[160px]">
          <SelectValue placeholder="Select source" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="dataforseo-intersection">
            DataForSEO Intersection
          </SelectItem>
          <SelectItem value="dataforseo-live">
            DataForSEO Live
          </SelectItem>
          <SelectItem value="dataforseo-task">
            DataForSEO Task
          </SelectItem>
          <SelectItem value="semrush">
            SEMrush API
          </SelectItem>
          <SelectItem value="sample">
            Sample Data
          </SelectItem>
        </SelectContent>
      </Select>
      
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <HelpCircle className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="max-w-[350px] p-4">
          <p className="text-sm">
            Select the data source for keyword gap analysis:
            <ul className="mt-2 list-disc pl-4 space-y-1">
              <li><strong>DataForSEO Intersection:</strong> Uses domain intersection API for direct competitor keyword comparison.</li>
              <li><strong>DataForSEO Live:</strong> Uses real-time SERP data from DataForSEO.</li>
              <li><strong>DataForSEO Task:</strong> Creates a background task for in-depth analysis.</li>
              <li><strong>SEMrush API:</strong> Uses SEMrush API (requires configuration).</li>
              <li><strong>Sample Data:</strong> Provides sample data for testing.</li>
            </ul>
          </p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

export default KeywordGapDataSourceSelector;
