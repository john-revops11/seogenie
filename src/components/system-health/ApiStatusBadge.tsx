
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ApiStatusBadgeProps } from "./types";

export const ApiStatusBadge = ({ apiId, apiStatus }: ApiStatusBadgeProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={apiStatus[apiId]?.status === "connected" ? "default" : "outline"}
            className={`cursor-help ${
              apiStatus[apiId]?.status === "connected" ? "bg-green-500" : 
              apiStatus[apiId]?.status === "error" ? "border-red-300 text-red-500" : 
              apiStatus[apiId]?.status === "disconnected" ? "border-slate-300 text-slate-500" :
              "border-slate-300 text-slate-500"
            }`}
          >
            {apiStatus[apiId]?.enabled ? 
              (apiStatus[apiId]?.status === "connected" ? "Connected" : 
                apiStatus[apiId]?.status === "error" ? "Error" :
                apiStatus[apiId]?.status === "checking" ? "Checking" : "Disconnected") :
              "Disabled"
            }
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>{apiStatus[apiId]?.description}</p>
          {apiStatus[apiId]?.errorMessage && (
            <p className="text-red-400 mt-1 text-xs">{apiStatus[apiId]?.errorMessage}</p>
          )}
          {apiStatus[apiId]?.lastChecked && (
            <p className="text-xs mt-1">
              Last checked: {apiStatus[apiId]?.lastChecked?.toLocaleTimeString()}
            </p>
          )}
          {!apiStatus[apiId]?.enabled && (
            <p className="text-amber-400 mt-1 text-xs">This API is currently disabled</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
