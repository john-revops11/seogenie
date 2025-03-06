
import React from "react";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";
import { RagSettings } from "../RagSettings";

interface AdvancedTabContentProps {
  ragEnabled: boolean;
  onRagToggle: (enabled: boolean) => void;
}

export const AdvancedTabContent: React.FC<AdvancedTabContentProps> = ({
  ragEnabled,
  onRagToggle,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label className="text-base">Advanced Settings</Label>
        <Settings className="w-4 h-4 text-muted-foreground" />
      </div>
      
      <RagSettings 
        enabled={ragEnabled} 
        onToggle={onRagToggle}
      />
      
      <div className="text-xs text-muted-foreground">
        These advanced settings help improve content quality and keyword organization
        by leveraging additional tools and technologies.
      </div>
    </div>
  );
};

export default AdvancedTabContent;
