
import { Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AlertMessagesProps {
  apiCallsMade: boolean;
  hasQuotaError: boolean;
  error: string | null;
  hasLimitedData: boolean;
}

export function AlertMessages({
  apiCallsMade,
  hasQuotaError,
  error,
  hasLimitedData
}: AlertMessagesProps) {
  if (!apiCallsMade) {
    return (
      <Alert>
        <div className="flex items-center gap-2">
          <AlertTitle>Welcome to Domain SEO Analytics</AlertTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p>This tool uses the DataForSEO API to fetch domain analytics data. Each analysis counts as an API call against your DataForSEO quota.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <AlertDescription>
          Enter a domain above and click "Analyze" to get started. This will make API calls to DataForSEO.
        </AlertDescription>
      </Alert>
    );
  }
  
  if (hasQuotaError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>API Quota Exceeded</AlertTitle>
        <AlertDescription>
          <p>The DataForSEO API daily quota has been exceeded. This is why no data is displayed.</p>
          <p className="mt-2 text-sm">Error details: {error}</p>
        </AlertDescription>
      </Alert>
    );
  }
  
  if (error && !hasQuotaError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }
  
  if (hasLimitedData) {
    return (
      <Alert>
        <AlertTitle>Limited Data</AlertTitle>
        <AlertDescription>
          No data available for this domain. Try another domain or check your DataForSEO API configuration.
        </AlertDescription>
      </Alert>
    );
  }
  
  return null;
}
