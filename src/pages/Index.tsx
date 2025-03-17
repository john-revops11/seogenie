
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { DashboardTabContent } from "@/components/tabs/DashboardTabContent";
import { ContentTabContent } from "@/components/tabs/ContentTabContent";
import { HistoryTabContent } from "@/components/tabs/HistoryTabContent";
import SettingsTabContent from "@/components/tabs/SettingsTabContent";
import AIChatTabContent from "@/components/tabs/AIChatTabContent";
import useDomainAnalysis from "@/hooks/useDomainAnalysis";
import { useApiManagement } from "@/hooks/useApiManagement";
import { Header } from "@/components/page/Header";
import { ApiHealthCard } from "@/components/api-integration/ApiHealthCard";
import SeoAnalyticsDashboard from "@/components/SeoAnalyticsDashboard";

const Index = () => {
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
      <ApiHealthCard />
      <Header analysisComplete={analysisComplete} onReset={handleReset} />
      
      <Tabs defaultValue="dashboard" className="space-y-4" id="main-tabs">
        <TabsList>
          <TabsTrigger value="dashboard" data-value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="domain-analysis" data-value="domain-analysis">Domain Analysis</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="ai-chat">AI Chat</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
            <p className="text-muted-foreground">
              This is your new empty dashboard tab. You can start developing it as needed.
            </p>
            <SeoAnalyticsDashboard />
          </div>
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
