
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { DashboardTabContent } from "@/components/tabs/DashboardTabContent";
import { ContentTabContent } from "@/components/tabs/ContentTabContent";
import { DataForSEOTabContent } from "@/components/tabs/DataForSEOTabContent";
import { HistoryTabContent } from "@/components/tabs/HistoryTabContent";
import SettingsTabContent from "@/components/tabs/SettingsTabContent";
import { useDomainAnalysis } from "@/hooks/useDomainAnalysis";
import { useDataForSEO } from "@/hooks/useDataForSEO";
import { useApiManagement } from "@/hooks/useApiManagement";
import { Header } from "@/components/page/Header";

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

  // DataForSEO state from custom hook
  const {
    dataForSEOAnalysisData,
    dataForSEODomain,
    isDataForSEOLoading,
    analyzeWithDataForSEO
  } = useDataForSEO();

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

  useEffect(() => {
    setAnalysisError(null);
  }, [mainDomain, setAnalysisError]);

  const goToAnalysisTab = () => {
    const tabsElement = document.getElementById('main-tabs');
    if (tabsElement) {
      // Find the dashboard tab trigger and click it
      const dashboardTrigger = tabsElement.querySelector('[data-value="dashboard"]');
      if (dashboardTrigger && dashboardTrigger instanceof HTMLElement) {
        dashboardTrigger.click();
      }
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <Header analysisComplete={analysisComplete} onReset={handleReset} />
      
      <Tabs defaultValue="dashboard" className="space-y-4" id="main-tabs">
        <TabsList>
          <TabsTrigger value="dashboard" data-value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="dataforseo">DataForSEO</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-4">
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
        
        <TabsContent value="dataforseo" className="space-y-6">
          <DataForSEOTabContent 
            analysisData={dataForSEOAnalysisData} 
            domain={dataForSEODomain} 
            isLoading={isDataForSEOLoading}
            onAnalyze={analyzeWithDataForSEO}
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
        
        <TabsContent value="history" className="space-y-6">
          <HistoryTabContent 
            analysisComplete={analysisComplete} 
            onGoToAnalysis={goToAnalysisTab} 
          />
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <SettingsTabContent 
            showApiForm={showApiForm}
            newApiName={newApiName}
            newApiKey={newApiKey}
            setShowApiForm={setShowApiForm}
            setNewApiName={setNewApiName}
            setNewApiKey={setNewApiKey}
            handleAddNewApi={handleAddNewApi}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
