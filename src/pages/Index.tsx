
import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { Header } from "@/components/page/Header";
import { TabNavigation } from "@/components/page/TabNavigation";
import { DashboardTabContent } from "@/components/tabs/DashboardTabContent";
import { DataForSEOTabContent } from "@/components/tabs/DataForSEOTabContent";
import { ContentTabContent } from "@/components/tabs/ContentTabContent";
import { HistoryTabContent } from "@/components/tabs/HistoryTabContent";
import { SettingsTabContent } from "@/components/settings/SettingsTabContent";
import { useDomainAnalysis } from "@/hooks/useDomainAnalysis";
import { useDataForSEO } from "@/hooks/useDataForSEO";
import { useApiManagement } from "@/hooks/useApiManagement";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const {
    mainDomain,
    competitorDomains,
    isAnalyzing,
    progress,
    analysisComplete,
    keywordData,
    analysisError,
    setMainDomain,
    addCompetitorDomain,
    removeCompetitorDomain,
    removeCompetitorFromAnalysis,
    updateCompetitorDomain,
    handleReset,
    handleAnalyze,
    handleAddCompetitorFromTable
  } = useDomainAnalysis();

  const {
    dataForSEOAnalysisData,
    dataForSEODomain
  } = useDataForSEO();

  const {
    showApiForm,
    newApiName,
    newApiKey,
    setShowApiForm,
    setNewApiName,
    setNewApiKey,
    handleAddNewApi
  } = useApiManagement();

  const handleGenerateContentFromKeyword = (keyword: string, relatedKeywords: string[]) => {
    setActiveTab("content");
    
    const event = new CustomEvent('generate-content-from-keyword', { 
      detail: { 
        primaryKeyword: keyword,
        relatedKeywords: relatedKeywords
      } 
    });
    window.dispatchEvent(event);
    
    toast.success(`Switched to content generator with "${keyword}"`);
    console.log(`Generating content for "${keyword}" with related keywords:`, relatedKeywords);
  };

  const handleRunSeoStrategy = () => {
    toast.success("SEO strategy execution initiated for Revology Analytics");
    // Any additional logic for SEO strategy execution would go here
  };

  const keywordStrings = Array.isArray(keywordData) ? keywordData.map(kw => kw.keyword) : [];

  return (
    <Layout>
      <div className="container px-4 py-8 mx-auto max-w-7xl animate-fade-in">
        <Header analysisComplete={analysisComplete} onReset={handleReset} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabNavigation />
          
          <TabsContent value="dashboard" className="space-y-6">
            <DashboardTabContent 
              mainDomain={mainDomain}
              competitorDomains={competitorDomains}
              isAnalyzing={isAnalyzing}
              progress={progress}
              analysisComplete={analysisComplete}
              keywordData={keywordData}
              analysisError={analysisError}
              onMainDomainChange={setMainDomain}
              onAddCompetitorDomain={addCompetitorDomain}
              onRemoveCompetitorDomain={removeCompetitorDomain}
              onUpdateCompetitorDomain={updateCompetitorDomain}
              onAnalyze={handleAnalyze}
              onReset={handleReset}
              onAddCompetitor={handleAddCompetitorFromTable}
              onRemoveCompetitor={removeCompetitorFromAnalysis}
              onGenerateContentFromKeyword={handleGenerateContentFromKeyword}
              onRunSeoStrategy={handleRunSeoStrategy}
            />
          </TabsContent>
          
          <TabsContent value="dataforseo" className="space-y-6">
            <DataForSEOTabContent 
              analysisData={dataForSEOAnalysisData}
              domain={dataForSEODomain}
            />
          </TabsContent>
          
          <TabsContent value="content" className="space-y-6">
            <ContentTabContent 
              analysisComplete={analysisComplete}
              domain={mainDomain}
              allKeywords={keywordStrings}
              onGoToAnalysis={() => setActiveTab("dashboard")}
            />
          </TabsContent>
          
          <TabsContent value="history" className="space-y-6">
            <HistoryTabContent 
              analysisComplete={analysisComplete}
              onGoToAnalysis={() => setActiveTab("dashboard")}
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
        
        {analysisComplete && (
          <div className="text-xs text-muted-foreground mt-6 text-center">
            Analysis data is automatically saved locally and will persist between tabs
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Index;
