
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
import { Alert, AlertDescription } from "@/components/ui/alert";

export function DomainAnalyticsDashboard() {
  const [domain, setDomain] = useState("revologyanalytics.com");
  const [searchDomain, setSearchDomain] = useState(domain);
  const analytics = useDomainSeoAnalytics(domain);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchDomain.trim()) {
      setDomain(searchDomain.trim());
    }
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
        <Button type="submit">
          <Search className="h-4 w-4 mr-2" />
          Analyze
        </Button>
        {domain && (
          <Button type="button" variant="outline" onClick={() => analytics.refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </form>
      
      {analytics.error && (
        <Alert variant="destructive">
          <AlertDescription>
            {analytics.error}
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
