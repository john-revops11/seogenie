
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, RefreshCw, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  testDataForSeoConnection, 
  runComprehensiveDataForSeoTest 
} from '@/services/keywords/api/dataForSeo/testConnection';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function DataForSeoStatusIndicator() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isUsingRealData, setIsUsingRealData] = useState<boolean | null>(null);
  const [diagnosticDetails, setDiagnosticDetails] = useState<string | null>(null);
  
  const checkConnection = async () => {
    try {
      setIsChecking(true);
      const result = await testDataForSeoConnection();
      setIsConnected(result);
      
      // Run a more comprehensive test if the basic test passes
      if (result) {
        try {
          const comprehensiveResults = await runComprehensiveDataForSeoTest();
          setIsUsingRealData(comprehensiveResults.details.usingRealData);
          setDiagnosticDetails(comprehensiveResults.message);
        } catch (detailsError) {
          console.error("Error getting comprehensive test details:", detailsError);
        }
      }
    } catch (error) {
      console.error("Error checking DataForSEO connection:", error);
      setIsConnected(false);
      setDiagnosticDetails(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsChecking(false);
    }
  };
  
  useEffect(() => {
    checkConnection();
  }, []);
  
  if (isConnected === null && !isChecking) {
    return null;
  }
  
  const alertColor = isConnected 
    ? (isUsingRealData ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200") 
    : "bg-amber-50 border-amber-200";
  
  const textColor = isConnected 
    ? (isUsingRealData ? "text-green-700" : "text-amber-700") 
    : "text-amber-700";
  
  const descriptionColor = isConnected 
    ? (isUsingRealData ? "text-green-600" : "text-amber-600") 
    : "text-amber-600";
  
  const buttonColor = isConnected 
    ? (isUsingRealData ? "border-green-200 hover:bg-green-100" : "border-amber-200 hover:bg-amber-100") 
    : "border-amber-200 hover:bg-amber-100";
  
  return (
    <Alert className={alertColor}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isConnected ? (
            isUsingRealData ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-500" />
            )
          ) : (
            <AlertCircle className="h-5 w-5 text-amber-500" />
          )}
          <div>
            <AlertTitle className={textColor}>
              DataForSEO API {isConnected ? (isUsingRealData ? "Connected" : "Connected (Fallback Data)") : "Not Connected"}
            </AlertTitle>
            <AlertDescription className={descriptionColor}>
              {isConnected 
                ? (isUsingRealData 
                    ? "Using live DataForSEO API for keyword research and competitive analysis." 
                    : "Connected to DataForSEO API but using fallback data. Check your account status or API limits.")
                : "Not using live DataForSEO API. Add your API key in Settings to enable live data."}
            </AlertDescription>
            {diagnosticDetails && (
              <div className="flex items-center mt-1 text-xs text-muted-foreground">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 mr-1 inline cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p className="max-w-xs">{diagnosticDetails}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                Diagnostic info available
              </div>
            )}
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={checkConnection}
          disabled={isChecking}
          className={buttonColor}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? "animate-spin" : ""}`} />
          {isChecking ? "Checking..." : "Check Connection"}
        </Button>
      </div>
    </Alert>
  );
}
