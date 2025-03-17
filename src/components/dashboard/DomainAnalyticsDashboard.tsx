import { useState, useEffect } from "react";
import { useDomainSeoAnalytics } from "@/hooks/useDomainSeoAnalytics";
import { DomainMetricsCards } from "./DomainMetricsCards";
import { KeywordPositionChart } from "./KeywordPositionChart";
import { TopKeywordsTable } from "./TopKeywordsTable";
import { toast } from "sonner";
import RankedKeywordsTable from "../ranked-keywords/RankedKeywordsTable";
import { DomainIntersectionCard } from "../domain-intersection";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { UserAuthDisplay } from "./UserAuthDisplay";
import { SearchDomainForm } from "./SearchDomainForm";
import { AlertMessages } from "./AlertMessages";
import { DomainBadge } from "./DomainBadge";

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
        <div className="flex items-center gap-4">
          <UserAuthDisplay user={user} />
          <h2 className="text-2xl font-bold tracking-tight">Domain SEO Analytics</h2>
          <DomainBadge domain={domain} apiCallsMade={apiCallsMade} />
        </div>
      </div>
      
      <SearchDomainForm
        searchDomain={searchDomain}
        setSearchDomain={setSearchDomain}
        handleSubmit={handleSubmit}
        isLoading={analytics.isLoading}
        domain={domain}
        apiCallsMade={apiCallsMade}
        refetch={analytics.refetch}
      />
      
      <AlertMessages
        apiCallsMade={apiCallsMade}
        hasQuotaError={hasQuotaError()}
        error={analytics.error}
        hasLimitedData={hasLimitedData()}
      />
      
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
