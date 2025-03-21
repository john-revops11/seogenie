
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApiSource } from "@/services/keywords/keywordGaps";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface KeywordGapDataSourceSelectorProps {
  value: ApiSource;
  onChange: (value: ApiSource) => void;
  locationCode?: number;
  onLocationChange?: (value: number) => void;
}

export function KeywordGapDataSourceSelector({ 
  value, 
  onChange,
  locationCode,
  onLocationChange 
}: KeywordGapDataSourceSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Data Source:</span>
      <Select
        value={value}
        onValueChange={(val) => onChange(val as ApiSource)}
      >
        <SelectTrigger className="h-8 w-[200px]">
          <SelectValue placeholder="Select source" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="dataforseo-intersection">
            DataForSEO Domain Intersection
          </SelectItem>
          <SelectItem value="dataforseo-live">
            DataForSEO Live API
          </SelectItem>
          <SelectItem value="ai-generated">
            AI-Generated Gap Analysis
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
              <li><strong>DataForSEO Domain Intersection:</strong> Most accurate method that directly compares domains to find keyword gaps using DataForSEO's specialized API.</li>
              <li><strong>DataForSEO Live API:</strong> Uses real-time keyword data from DataForSEO for all domains and analyzes the differences.</li>
              <li><strong>AI-Generated Gap Analysis:</strong> Uses AI algorithms to analyze existing keyword data and identify potential gaps and opportunities.</li>
            </ul>
          </p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

export default KeywordGapDataSourceSelector;
