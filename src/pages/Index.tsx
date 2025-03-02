
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { BarChart2, FileText, Settings } from "lucide-react";
import KeywordResearch from "@/components/KeywordResearch";
import Layout from "@/components/Layout";
import ContentGenerator from "@/components/ContentGenerator";
import { useAnalysis } from "@/hooks/useAnalysis";
import PageHeader from "@/components/dashboard/PageHeader";
import AnalysisForm from "@/components/dashboard/AnalysisForm";
import AnalysisError from "@/components/dashboard/AnalysisError";
import ResultsDashboard from "@/components/dashboard/ResultsDashboard";
import ContentGenerationPrompt from "@/components/dashboard/ContentGenerationPrompt";
import ApiSettingsForm from "@/components/settings/ApiSettingsForm";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showApiForm, setShowApiForm] = useState(false);
  
  const {
    mainDomain,
    setMainDomain,
    competitorDomains,
    setCompetitorDomains,
    isAnalyzing,
    progress,
    analysisComplete,
    keywordData,
    analysisError,
    handleReset,
    handleAnalyze,
    getValidCompetitorDomains
  } = useAnalysis();

  const handleAddCompetitorFromTable = (newCompetitor: string) => {
    if (isAnalyzing) return;
    
    const normalizedNewCompetitor = newCompetitor.trim().toLowerCase();
    
    const exists = competitorDomains.some(domain => 
      domain.trim().toLowerCase() === normalizedNewCompetitor
    );
    
    if (exists) {
      toast.error("This competitor is already in your analysis");
      return;
    }
    
    setCompetitorDomains(prev => [...prev.filter(domain => domain.trim() !== ""), newCompetitor]);
    toast.success(`Added ${normalizedNewCompetitor} to competitors list`);
  };

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
  };

  const handleAddNewApi = (apiName: string, apiKey: string) => {
    toast.success(`Added new API integration: ${apiName}`);
  };

  const handleRunSeoStrategy = () => {
    toast.success("SEO strategy execution initiated for Revology Analytics");
  };

  const validCompetitorDomains = getValidCompetitorDomains();
  const keywordStrings = Array.isArray(keywordData) ? keywordData.map(kw => kw.keyword) : [];

  return (
    <Layout>
      <div className="container px-4 py-8 mx-auto max-w-7xl animate-fade-in">
        <PageHeader 
          analysisComplete={analysisComplete} 
          onReset={handleReset} 
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="w-4 h-4" /> Content
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" /> Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-6">
            {analysisError ? (
              <div className="space-y-6">
                <AnalysisError errorMessage={analysisError} onReset={handleReset} />
                
                <KeywordResearch 
                  domain={mainDomain || "example.com"}
                  competitorDomains={validCompetitorDomains}
                  keywords={keywordData || []}
                  onGenerateContent={handleGenerateContentFromKeyword}
                  onRunSeoStrategy={handleRunSeoStrategy}
                />
              </div>
            ) : !analysisComplete ? (
              <div className="space-y-6">
                <AnalysisForm 
                  mainDomain={mainDomain}
                  setMainDomain={setMainDomain}
                  competitorDomains={competitorDomains}
                  setCompetitorDomains={setCompetitorDomains}
                  isAnalyzing={isAnalyzing}
                  progress={progress}
                  handleAnalyze={handleAnalyze}
                />
                
                <KeywordResearch 
                  domain={mainDomain || "example.com"}
                  competitorDomains={validCompetitorDomains}
                  keywords={[]}
                  onGenerateContent={handleGenerateContentFromKeyword}
                  onRunSeoStrategy={handleRunSeoStrategy}
                />
              </div>
            ) : (
              <div className="space-y-6">
                <ResultsDashboard
                  domain={mainDomain}
                  competitorDomains={validCompetitorDomains}
                  keywordData={keywordData || []}
                  isAnalyzing={isAnalyzing}
                  onAddCompetitor={handleAddCompetitorFromTable}
                />
                
                <KeywordResearch 
                  domain={mainDomain}
                  competitorDomains={validCompetitorDomains}
                  keywords={keywordData || []}
                  onGenerateContent={handleGenerateContentFromKeyword}
                  onRunSeoStrategy={handleRunSeoStrategy}
                />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="content" className="space-y-6">
            {!analysisComplete ? (
              <ContentGenerationPrompt onNavigate={() => setActiveTab("dashboard")} />
            ) : (
              <ContentGenerator 
                domain={mainDomain} 
                allKeywords={keywordStrings}
              />
            )}
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <ApiSettingsForm onAddNewApi={handleAddNewApi} />
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
