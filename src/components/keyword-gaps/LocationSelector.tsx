
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { commonLocations } from "./KeywordGapUtils";

interface LocationSelectorProps {
  locationCode: number;
  onLocationChange: (locationCode: number) => void;
}

export function LocationSelector({ 
  locationCode, 
  onLocationChange 
}: LocationSelectorProps) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-muted-foreground">Location</label>
      <Select 
        value={locationCode.toString()} 
        onValueChange={(value) => onLocationChange(parseInt(value))}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select location" />
        </SelectTrigger>
        <SelectContent className="bg-background z-50">
          {commonLocations.map((location) => (
            <SelectItem key={location.code} value={location.code.toString()}>
              {location.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default LocationSelector;
