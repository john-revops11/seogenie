
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LocationSelectorProps {
  locationCode: number;
  onLocationChange: (locationCode: number) => void;
}

export function LocationSelector({
  locationCode,
  onLocationChange
}: LocationSelectorProps) {
  const locations = [
    { code: 2840, name: "United States" },
    { code: 2826, name: "United Kingdom" },
    { code: 2124, name: "Canada" },
    { code: 2036, name: "Australia" },
    { code: 2276, name: "Germany" },
    { code: 2250, name: "France" },
    { code: 2724, name: "Spain" },
    { code: 2380, name: "Italy" },
    { code: 2528, name: "Netherlands" },
    { code: 2484, name: "Mexico" }
  ];

  return (
    <Select
      value={locationCode.toString()}
      onValueChange={(value) => onLocationChange(parseInt(value))}
    >
      <SelectTrigger className="w-[150px] h-8 text-xs">
        <SelectValue placeholder="Location" />
      </SelectTrigger>
      <SelectContent className="bg-background z-50">
        {locations.map(location => (
          <SelectItem key={location.code} value={location.code.toString()}>
            {location.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default LocationSelector;
