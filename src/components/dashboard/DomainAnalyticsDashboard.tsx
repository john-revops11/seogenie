
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BarChart2, Globe, Search, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDomainSeoAnalytics } from "@/hooks/useDomainSeoAnalytics";
import { DomainMetricsCards } from "./DomainMetricsCards";
import { KeywordPositionChart } from "./KeywordPositionChart";
import { TopKeywordsTable } from "./TopKeywordsTable";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export function DomainAnalyticsDashboard() {
  const [domain, setDomain] = useState("revologyanalytics.com");
  const [searchDomain, setSearchDomain] = useState(domain);
  const analytics = useDomainSeoAnalytics(domain);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchDomain.trim()) {
      setDomain(searchDomain.trim());
      toast.info(`Analyzing domain: ${searchDomain.trim()}`);
    }
  };
  
  // Helper function to determine if we have an API quota error
  const hasQuotaError = () => {
    return analytics.error && 
           (analytics.error.includes("money limit") || 
            analytics.error.includes("exceeded") ||
            analytics.error.includes("limit per day"));
  };
  
  // Helper function to determine if we should show the limited data alert
  const hasLimitedData = () => {
    return !analytics.isLoading && 
           !analytics.error && 
           analytics.organicTraffic === 0 && 
           analytics.organicKeywords === 0 && 
           analytics.authorityScore === null;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Domain SEO Analytics</h2>
        <Badge variant="outline" className="flex items-center gap-1">
          <Globe className="h-3.5 w-3.5" />
          {domain}
        </Badge>
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2 max-w-md">
        <Input 
          placeholder="Enter domain (e.g., example.com)" 
          value={searchDomain}
          onChange={(e) => setSearchDomain(e.target.value)}
        />
        <Button type="submit" disabled={analytics.isLoading}>
          <Search className="h-4 w-4 mr-2" />
          Analyze
        </Button>
        {domain && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => analytics.refetch()}
            disabled={analytics.isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${analytics.isLoading ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </form>
      
      {hasQuotaError() && (
        <Alert variant="destructive">
          <AlertTitle>API Quota Exceeded</AlertTitle>
          <AlertDescription>
            <p>The DataForSEO API daily quota has been exceeded. This is why no data is displayed.</p>
            <p className="mt-2 text-sm">Error details: {analytics.error}</p>
          </AlertDescription>
        </Alert>
      )}
      
      {analytics.error && !hasQuotaError() && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {analytics.error}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Check if there's no data at all */}
      {hasLimitedData() && (
        <Alert>
          <AlertTitle>Limited Data</AlertTitle>
          <AlertDescription>
            No data available for this domain. Try another domain or check your DataForSEO API configuration.
          </AlertDescription>
        </Alert>
      )}
      
      <DomainMetricsCards
        organicTraffic={analytics.organicTraffic}
        organicKeywords={analytics.organicKeywords}
        referringDomains={analytics.referringDomains}
        authorityScore={analytics.authorityScore}
        estimatedTrafficCost={analytics.estimatedTrafficCost}
        isLoading={analytics.isLoading}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <KeywordPositionChart 
          keywordDistribution={analytics.keywordDistribution}
          isLoading={analytics.isLoading}
        />
        
        <TopKeywordsTable 
          keywords={analytics.topKeywords}
          isLoading={analytics.isLoading}
        />
      </div>
    </div>
  );
}
