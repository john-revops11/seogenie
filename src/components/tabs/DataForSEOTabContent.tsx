
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import DataForSEODashboard from "@/components/dataforseo/DataForSEODashboard";
import { DataForSEOAnalysisResult } from "@/components/dataforseo/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DataForSEOTabContentProps {
  analysisData: DataForSEOAnalysisResult | null;
  domain: string;
  isLoading?: boolean;
  onAnalyze: (domain: string) => Promise<void>;
}

export const DataForSEOTabContent = ({ 
  analysisData, 
  domain,
  isLoading = false,
  onAnalyze
}: DataForSEOTabContentProps) => {
  const [inputDomain, setInputDomain] = useState(domain || "");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!inputDomain) {
      setError("Please enter a domain to analyze");
      return;
    }
    
    try {
      await onAnalyze(inputDomain);
    } catch (err) {
      setError(`Error analyzing domain: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>DataForSEO Analysis</CardTitle>
          <CardDescription>
            Analyze a domain using DataForSEO to get SERP positions, keyword volumes, traffic estimates, and competitor data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <div className="flex-1">
              <label htmlFor="dataForSEO-domain" className="text-sm font-medium mb-2 block">
                Domain to analyze (e.g., revologyanalytics.com)
              </label>
              <div className="flex gap-4">
                <Input
                  id="dataForSEO-domain"
                  placeholder="example.com"
                  value={inputDomain}
                  onChange={(e) => setInputDomain(e.target.value)}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading || !inputDomain}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Analyze Domain"
                  )}
                </Button>
              </div>
            </div>
          </form>
          
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}
          
          {analysisData && analysisData.serp.error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>SERP API Error</AlertTitle>
              <AlertDescription>
                {analysisData.serp.error}
              </AlertDescription>
            </Alert>
          )}
          
          {analysisData && analysisData.traffic.error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Traffic API Error</AlertTitle>
              <AlertDescription>
                {analysisData.traffic.error}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <DataForSEODashboard 
        analysisData={analysisData} 
        domain={domain} 
      />
    </div>
  );
};
