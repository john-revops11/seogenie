
import { DomainAnalyticsDashboard } from "@/components/dashboard/DomainAnalyticsDashboard";
import { UserAuthDisplay } from "@/components/dashboard/UserAuthDisplay";
import { AlertMessages } from "@/components/dashboard/AlertMessages";
import { DataForSeoStatusIndicator } from "@/components/dashboard/DataForSeoStatusIndicator";
import SystemHealthCard from "@/components/SystemHealthCard";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { KeywordData } from "@/services/keywords/types";

interface DashboardTabContentProps {
  mainDomain?: string;
  competitorDomains?: string[];
  isAnalyzing?: boolean;
  progress?: number;
  analysisComplete?: boolean;
  keywordData?: KeywordData[];
  analysisError?: string | null;
  onMainDomainChange?: (value: string) => void;
  onAddCompetitorDomain?: (domain: string) => void;
  onRemoveCompetitorDomain?: (index: number) => void;
  onUpdateCompetitorDomain?: (index: number, value: string) => void;
  onAnalyze?: () => void;
  onReset?: () => void;
  onAddCompetitor?: (domain: string) => void;
  onRemoveCompetitor?: (domain: string) => void;
  onGenerateContentFromKeyword?: (keyword: string) => void;
  onRunSeoStrategy?: () => void;
}

export function DashboardTabContent(props: DashboardTabContentProps) {
  const [user, setUser] = useState<any>(null);
  const [apiCallsMade, setApiCallsMade] = useState(false);
  
  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    
    fetchUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  // Determine if API calls have been made
  useEffect(() => {
    if (props.analysisComplete || props.isAnalyzing || props.analysisError) {
      setApiCallsMade(true);
    }
  }, [props.analysisComplete, props.isAnalyzing, props.analysisError]);
  
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start mb-8">
        <UserAuthDisplay user={user} />
        <SystemHealthCard />
      </div>
      
      <AlertMessages 
        apiCallsMade={apiCallsMade}
        hasQuotaError={props.analysisError?.includes("quota") || props.analysisError?.includes("limit") || false}
        error={props.analysisError || null}
        hasLimitedData={props.analysisComplete && (!props.keywordData || props.keywordData.length === 0)}
      />
      
      <div className="mb-8">
        <DataForSeoStatusIndicator />
      </div>
      
      <DomainAnalyticsDashboard />
    </div>
  );
}
