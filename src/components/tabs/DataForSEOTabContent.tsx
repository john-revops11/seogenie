
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import DataForSEODashboard from "@/components/dataforseo/DataForSEODashboard";
import { DataForSEOAnalysisResult } from "@/components/dataforseo/types";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAnalyze(inputDomain);
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
          <form onSubmit={handleSubmit} className="flex items-end gap-4">
            <div className="flex-1">
              <label htmlFor="dataForSEO-domain" className="text-sm font-medium mb-2 block">
                Domain to analyze
              </label>
              <Input
                id="dataForSEO-domain"
                placeholder="example.com"
                value={inputDomain}
                onChange={(e) => setInputDomain(e.target.value)}
                disabled={isLoading}
              />
            </div>
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
          </form>
        </CardContent>
      </Card>

      <DataForSEODashboard 
        analysisData={analysisData} 
        domain={domain} 
      />
    </div>
  );
};
