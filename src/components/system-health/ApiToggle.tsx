
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ApiToggleProps } from "./types";

export const ApiToggle = ({ apiId, apiStatus, toggleApiEnabled }: ApiToggleProps) => {
  return (
    <div className="flex items-center gap-1">
      <Switch 
        id={`${apiId}-switch`}
        checked={apiStatus[apiId]?.enabled || false}
        onCheckedChange={() => toggleApiEnabled(apiId)}
        className="data-[state=checked]:bg-green-500"
      />
      <Label 
        htmlFor={`${apiId}-switch`}
        className="sr-only"
      >
        {apiStatus[apiId]?.enabled ? "Enabled" : "Disabled"}
      </Label>
    </div>
  );
};
