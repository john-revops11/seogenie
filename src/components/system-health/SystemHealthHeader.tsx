
import { cn } from "@/lib/utils";
import { BarChart2, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface SystemHealthHeaderProps {
  systemHealth: "good" | "warning" | "critical";
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
}

export const SystemHealthHeader = ({ 
  systemHealth, 
  expanded, 
  setExpanded 
}: SystemHealthHeaderProps) => {
  const healthColor = {
    good: "text-green-500",
    warning: "text-amber-500",
    critical: "text-red-500"
  }[systemHealth];

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="flex items-center justify-between px-4 mb-4">
      <div className="flex items-center space-x-2">
        <BarChart2 className={cn("h-5 w-5", healthColor)} />
        <h3 className="font-medium text-sm">SEO Tools Status</h3>
      </div>
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-7 w-7 p-0" 
        onClick={handleToggle}
      >
        {expanded ? <X className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
      </Button>
    </div>
  );
};
