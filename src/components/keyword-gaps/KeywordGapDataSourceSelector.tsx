
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import LocationSelector from "./LocationSelector";
import { ApiSource } from "@/services/keywords/keywordGaps";

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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-between items-center">
        <Select
          value={apiSource}
          onValueChange={(val: ApiSource) => {
            onApiSourceChange(val);
            setIsOpen(false);
          }}
        >
          <SelectTrigger className="w-[180px] h-8 text-xs">
            <SelectValue placeholder="Data source" />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            <SelectItem value="sample">Sample Data</SelectItem>
            <SelectItem value="dataforseo-live">DataForSEO Live</SelectItem>
            <SelectItem value="dataforseo-task">DataForSEO Task</SelectItem>
            <SelectItem value="semrush">SEMrush</SelectItem>
          </SelectContent>
        </Select>
        
        <LocationSelector 
          locationCode={locationCode}
          onLocationChange={onLocationChange}
        />
      </div>
    </div>
  );
}

export default KeywordGapDataSourceSelector;
