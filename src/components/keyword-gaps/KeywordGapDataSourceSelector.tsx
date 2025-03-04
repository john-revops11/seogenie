
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApiSource } from "@/services/keywords/keywordGaps";
import { commonLocations, getLocationNameByCode } from "./KeywordGapUtils";
import LocationSelector from "./LocationSelector";

interface KeywordGapDataSourceSelectorProps {
  apiSource: ApiSource;
  onApiSourceChange: (value: ApiSource) => void;
  locationCode: number;
  onLocationChange: (locationCode: number) => void;
}

export function KeywordGapDataSourceSelector({ 
  apiSource, 
  onApiSourceChange,
  locationCode,
  onLocationChange
}: KeywordGapDataSourceSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Data Source</label>
        <Select value={apiSource} onValueChange={(v) => onApiSourceChange(v as ApiSource)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select data source" />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            <SelectItem value="sample">Sample Data</SelectItem>
            <SelectItem value="semrush">SEMrush</SelectItem>
            <SelectItem value="dataforseo-live">DataForSEO (Live)</SelectItem>
            <SelectItem value="dataforseo-task">DataForSEO (Tasks)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <LocationSelector 
        locationCode={locationCode} 
        onLocationChange={onLocationChange} 
      />
      
      {apiSource === "dataforseo-live" && (
        <div className="text-xs text-muted-foreground mt-1">
          Live mode provides immediate results from the DataForSEO API.
        </div>
      )}
      
      {apiSource === "dataforseo-task" && (
        <div className="text-xs text-muted-foreground mt-1">
          Task mode queues the request for processing and retrieves results when available.
        </div>
      )}
    </div>
  );
}

export default KeywordGapDataSourceSelector;
