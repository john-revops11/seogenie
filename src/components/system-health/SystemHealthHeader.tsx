
import { cn } from "@/lib/utils";
import { Activity, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SystemHealthHeaderProps {
  healthStatus: "good" | "warning" | "critical";
  expanded: boolean;
  onToggleExpand: () => void;
}

export const SystemHealthHeader = ({ 
  healthStatus, 
  expanded, 
  onToggleExpand 
}: SystemHealthHeaderProps) => {
  const healthColor = {
    good: "text-green-500",
    warning: "text-amber-500",
    critical: "text-red-500"
  }[healthStatus];

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <Activity className={cn("h-5 w-5", healthColor)} />
        <h3 className="font-medium text-sm">System Health</h3>
      </div>
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-7 w-7 p-0" 
        onClick={onToggleExpand}
      >
        {expanded ? <X className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
      </Button>
    </div>
  );
};
