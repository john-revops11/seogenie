import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { ApiHealthCard } from "@/components/api-integration/ApiHealthCard";
import { DomainAnalyticsDashboard } from "@/components/dashboard/DomainAnalyticsDashboard";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  
  // Domain Analysis State from custom hook
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

  // API Management state from custom hook
  const {
    showApiForm,
    newApiName,
    newApiKey,
    setShowApiForm,
    setNewApiName,
    setNewApiKey,
    handleAddNewApi
  } = useApiManagement();

  // Content generation state
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
    // Get current user on initial load
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    
    fetchUser();
    
    // Subscribe to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate('/auth');
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    }
  };

  const goToAnalysisTab = () => {
    const tabsElement = document.getElementById('main-tabs');
    if (tabsElement) {
      // Find the domain-analysis tab trigger and click it
      const domainAnalysisTrigger = tabsElement.querySelector('[data-value="domain-analysis"]');
      if (domainAnalysisTrigger && domainAnalysisTrigger instanceof HTMLElement) {
        domainAnalysisTrigger.click();
      }
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex justify-between items-center mb-4">
        <ApiHealthCard />
        
        {user ? (
          <div className="flex items-center gap-3">
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
      </div>
      
      <Header analysisComplete={analysisComplete} onReset={handleReset} />
      
      <Tabs defaultValue="dashboard" className="space-y-4" id="main-tabs">
        <TabsList>
          <TabsTrigger value="dashboard" data-value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="domain-analysis" data-value="domain-analysis">Domain Analysis</TabsTrigger>
          <TabsTrigger value="position-tracking" data-value="position-tracking">Position Tracking</TabsTrigger>
          <TabsTrigger value="seo-analytics" data-value="seo-analytics">SEO Analytics</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="ai-chat">AI Chat</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

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
        
        <TabsContent value="position-tracking" className="space-y-4">
          <PositionTrackingTabContent domain={mainDomain} />
        </TabsContent>
        
        <TabsContent value="seo-analytics" className="space-y-4">
          <SeoAnalyticsTabContent />
        </TabsContent>
        
        <TabsContent value="content" className="space-y-6">
          <ContentTabContent 
            analysisComplete={analysisComplete} 
            domain={mainDomain}
            allKeywords={keywordData.map(k => k.keyword)}
            onGoToAnalysis={goToAnalysisTab}
          />
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
