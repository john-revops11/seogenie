
import { Check, X, Activity, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ApiStatus, ApiStatusIndicatorProps } from "@/types/systemHealth";

export const ApiStatusIndicator = ({ 
  status, 
  label, 
  className 
}: ApiStatusIndicatorProps) => {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {label && <span className="text-xs">{label}</span>}
      {getStatusBadge(status)}
    </div>
  );
};

export const getStatusIcon = (status: ApiStatus) => {
  switch (status) {
    case "success": return <Check className="h-4 w-4 text-green-500" />;
    case "error": return <X className="h-4 w-4 text-red-500" />;
    case "loading": return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />;
    default: return <AlertTriangle className="h-4 w-4 text-amber-500" />;
  }
};

export const getStatusBadge = (status: ApiStatus) => {
  switch (status) {
    case "success": return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Operational</Badge>;
    case "error": return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Error</Badge>;
    case "loading": return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 animate-pulse">Checking</Badge>;
    default: return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Unknown</Badge>;
  }
};
