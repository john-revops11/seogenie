import { useState, useEffect } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { DashboardTabContent } from "@/components/tabs/DashboardTabContent";
import { ContentTabContent } from "@/components/tabs/ContentTabContent";
import { HistoryTabContent } from "@/components/tabs/HistoryTabContent";
import SettingsTabContent from "@/components/tabs/SettingsTabContent";
import AIChatTabContent from "@/components/tabs/AIChatTabContent";
import { PositionTrackingTabContent } from "@/components/tabs/PositionTrackingTabContent";
import SeoAnalyticsTabContent from "@/components/tabs/SeoAnalyticsTabContent";
import useDomainAnalysis from "@/hooks/useDomainAnalysis";
import { useApiManagement } from "@/hooks/useApiManagement";
import { Header } from "@/components/page/Header";
import { DomainAnalyticsDashboard } from "@/components/dashboard/DomainAnalyticsDashboard";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { TabNavigation } from "@/components/page/TabNavigation";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  
  const {
    mainDomain, setMainDomain,
    competitorDomains, 
    isAnalyzing, 
    progress,
    analysisComplete,
    keywordData,
    analysisError, setAnalysisError,
    onMainDomainChange,
    onAddCompetitorDomain,
    onRemoveCompetitorDomain,
    onUpdateCompetitorDomain,
    handleReset,
    handleAnalyze,
    handleAddCompetitorFromTable,
    removeCompetitorFromAnalysis
  } = useDomainAnalysis();

  const {
    showApiForm,
    newApiName,
    newApiKey,
    setShowApiForm,
    setNewApiName,
    setNewApiKey,
    handleAddNewApi
  } = useApiManagement();

  const [contentType, setContentType] = useState("blog");
  const [creativity, setCreativity] = useState(50);
  const [contentPreferences, setContentPreferences] = useState<string[]>([]);

  const handleContentTypeChange = (value: string) => {
    setContentType(value);
  };

  const handleCreativityChange = (value: number) => {
    setCreativity(value);
  };

  const handleContentPreferenceToggle = (preference: string) => {
    setContentPreferences(prev => 
      prev.includes(preference) 
        ? prev.filter(p => p !== preference)
        : [...prev, preference]
    );
  };

  useEffect(() => {
    setAnalysisError(null);
  }, [mainDomain, setAnalysisError]);

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

  const goToAnalysisTab = () => {
    const tabsElement = document.getElementById('main-tabs');
    if (tabsElement) {
      const domainAnalysisTrigger = tabsElement.querySelector('[data-value="domain-analysis"]');
      if (domainAnalysisTrigger && domainAnalysisTrigger instanceof HTMLElement) {
        domainAnalysisTrigger.click();
      }
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <Header analysisComplete={analysisComplete} onReset={handleReset} />
      
      <Tabs defaultValue="dashboard" className="space-y-4" id="main-tabs">
        <TabNavigation />

        <TabsContent value="dashboard" className="space-y-4">
          <DomainAnalyticsDashboard />
        </TabsContent>
        
        <TabsContent value="domain-analysis" className="space-y-4">
          <DashboardTabContent 
            mainDomain={mainDomain}
            competitorDomains={competitorDomains}
            isAnalyzing={isAnalyzing}
            progress={progress}
            analysisComplete={analysisComplete}
            keywordData={keywordData}
            analysisError={analysisError}
            onMainDomainChange={onMainDomainChange}
            onAddCompetitorDomain={onAddCompetitorDomain}
            onRemoveCompetitorDomain={onRemoveCompetitorDomain}
            onUpdateCompetitorDomain={onUpdateCompetitorDomain}
            onAnalyze={handleAnalyze}
            onReset={handleReset}
            onAddCompetitor={handleAddCompetitorFromTable}
            onRemoveCompetitor={removeCompetitorFromAnalysis}
            onGenerateContentFromKeyword={() => {}}
            onRunSeoStrategy={() => {}}
          />
        </TabsContent>
        
        <TabsContent value="content" className="space-y-6">
          <ContentTabContent 
            analysisComplete={analysisComplete} 
            domain={mainDomain}
            allKeywords={keywordData.map(k => k.keyword)}
            onGoToAnalysis={goToAnalysisTab}
          />
        </TabsContent>
        
        <TabsContent value="position-tracking" className="space-y-4">
          <PositionTrackingTabContent domain={mainDomain} />
        </TabsContent>
        
        <TabsContent value="seo-analytics" className="space-y-4">
          <SeoAnalyticsTabContent />
        </TabsContent>
        
        <TabsContent value="ai-chat" className="space-y-6">
          <AIChatTabContent 
            analysisComplete={analysisComplete} 
            onGoToAnalysis={goToAnalysisTab}
          />
        </TabsContent>
        
        <TabsContent value="history" className="space-y-6">
          <HistoryTabContent 
            analysisComplete={analysisComplete} 
            onGoToAnalysis={goToAnalysisTab} 
          />
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <SettingsTabContent 
            contentType={contentType}
            creativity={creativity}
            contentPreferences={contentPreferences}
            selectedTopic=""
            selectedKeywords={[]}
            title=""
            onContentTypeChange={handleContentTypeChange}
            onCreativityChange={handleCreativityChange}
            onContentPreferenceToggle={handleContentPreferenceToggle}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
