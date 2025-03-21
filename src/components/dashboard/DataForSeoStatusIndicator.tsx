
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { testDataForSeoConnection } from '@/services/keywords/api/dataForSeo/testConnection';

export function DataForSeoStatusIndicator() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  
  const checkConnection = async () => {
    try {
      setIsChecking(true);
      const result = await testDataForSeoConnection();
      setIsConnected(result);
    } catch (error) {
      console.error("Error checking DataForSEO connection:", error);
      setIsConnected(false);
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
  
  return (
    <Alert className={isConnected ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-amber-500" />
          )}
          <div>
            <AlertTitle className={isConnected ? "text-green-700" : "text-amber-700"}>
              DataForSEO API {isConnected ? "Connected" : "Not Connected"}
            </AlertTitle>
            <AlertDescription className={isConnected ? "text-green-600" : "text-amber-600"}>
              {isConnected 
                ? "Using live DataForSEO API for keyword research and competitive analysis." 
                : "Not using live DataForSEO API. Fallback data may be used instead."}
            </AlertDescription>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={checkConnection}
          disabled={isChecking}
          className={isConnected ? "border-green-200 hover:bg-green-100" : "border-amber-200 hover:bg-amber-100"}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? "animate-spin" : ""}`} />
          {isChecking ? "Checking..." : "Check Connection"}
        </Button>
      </div>
    </Alert>
  );
}
