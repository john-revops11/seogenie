
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApiSource } from "@/services/keywords/keywordGaps";

interface KeywordGapDataSourceSelectorProps {
  apiSource: ApiSource;
  onApiSourceChange: (value: ApiSource) => void;
}

export function KeywordGapDataSourceSelector({ 
  apiSource, 
  onApiSourceChange 
}: KeywordGapDataSourceSelectorProps) {
  return (
    <Select value={apiSource} onValueChange={(v) => onApiSourceChange(v as ApiSource)}>
      <SelectTrigger className="w-full mt-1">
        <SelectValue placeholder="Select data source" />
      </SelectTrigger>
      <SelectContent className="bg-background z-50">
        <SelectItem value="sample">Sample Data</SelectItem>
        <SelectItem value="semrush">SEMrush</SelectItem>
        <SelectItem value="dataforseo-live">DataForSEO (Live)</SelectItem>
        <SelectItem value="dataforseo-task">DataForSEO (Tasks)</SelectItem>
      </SelectContent>
    </Select>
  );
}

export default KeywordGapDataSourceSelector;
