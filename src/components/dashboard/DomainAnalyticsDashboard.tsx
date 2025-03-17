
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BarChart2, Globe, Search, RefreshCw, Info, LogOut, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDomainSeoAnalytics } from "@/hooks/useDomainSeoAnalytics";
import { DomainMetricsCards } from "./DomainMetricsCards";
import { KeywordPositionChart } from "./KeywordPositionChart";
import { TopKeywordsTable } from "./TopKeywordsTable";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import RankedKeywordsTable from "../ranked-keywords/RankedKeywordsTable";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DomainIntersectionCard } from "../domain-intersection";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export function DomainAnalyticsDashboard() {
  const [domain, setDomain] = useState("revologyanalytics.com");
  const [searchDomain, setSearchDomain] = useState(domain);
  const [metricsFromCompetitors, setMetricsFromCompetitors] = useState({
    organicTraffic: 0,
    organicKeywords: 0,
    trafficValue: 0
  });
  const [apiCallsMade, setApiCallsMade] = useState(false);
  const [user, setUser] = useState<any>(null);
  const analytics = useDomainSeoAnalytics(domain);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    
    fetchUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      
      if (event === 'SIGNED_OUT') {
        navigate('/auth');
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchDomain.trim()) {
      setDomain(searchDomain.trim());
      setApiCallsMade(true);
      toast.info(`Analyzing domain: ${searchDomain.trim()}`);
    }
  };
  
  const hasQuotaError = () => {
    return analytics.error && 
           (analytics.error.includes("money limit") || 
            analytics.error.includes("exceeded") ||
            analytics.error.includes("limit per day"));
  };
  
  const hasLimitedData = () => {
    return !analytics.isLoading && 
           !analytics.error && 
           metricsFromCompetitors.organicTraffic === 0 && 
           metricsFromCompetitors.organicKeywords === 0 && 
           analytics.authorityScore === null;
  };

  const handleMetricsLoaded = (metrics: {
    organicTraffic: number;
    organicKeywords: number;
    trafficValue: number;
  }) => {
    setMetricsFromCompetitors(metrics);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Domain SEO Analytics</h2>
        
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-md text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{user.email}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout} 
                className="flex items-center gap-1"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/auth')}
            >
              Login
            </Button>
          )}
          
          {domain && apiCallsMade && (
            <Badge variant="outline" className="flex items-center gap-1 ml-2">
              <Globe className="h-3.5 w-3.5" />
              {domain}
            </Badge>
          )}
        </div>
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
        {domain && apiCallsMade && (
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
      
      {!apiCallsMade && (
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
      )}
      
      {hasQuotaError() && (
        <Alert variant="destructive">
          <AlertTitle>API Quota Exceeded</AlertTitle>
          <AlertDescription>
            <p>The DataForSEO API daily quota has been exceeded. This is why no data is displayed.</p>
            <p className="mt-2 text-sm">Error details: {analytics.error}</p>
          </AlertDescription>
        </Alert>
      )}
      
      {analytics.error && !hasQuotaError() && apiCallsMade && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {analytics.error}
          </AlertDescription>
        </Alert>
      )}
      
      {hasLimitedData() && apiCallsMade && (
        <Alert>
          <AlertTitle>Limited Data</AlertTitle>
          <AlertDescription>
            No data available for this domain. Try another domain or check your DataForSEO API configuration.
          </AlertDescription>
        </Alert>
      )}
      
      {apiCallsMade && (
        <>
          <DomainMetricsCards
            organicTraffic={analytics.organicTraffic || metricsFromCompetitors.organicTraffic}
            organicKeywords={analytics.organicKeywords || metricsFromCompetitors.organicKeywords}
            referringDomains={analytics.referringDomains}
            authorityScore={analytics.authorityScore}
            estimatedTrafficCost={analytics.estimatedTrafficCost || metricsFromCompetitors.trafficValue}
            keywordTrends={analytics.keywordTrends}
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
          
          <RankedKeywordsTable />
        </>
      )}
      
      <DomainIntersectionCard 
        domain={domain} 
        onMetricsLoaded={handleMetricsLoaded}
      />
    </div>
  );
}
