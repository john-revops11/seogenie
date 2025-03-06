import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { BarChart2, FileText, Settings, History, Globe } from "lucide-react";
import Layout from "@/components/Layout";
import { analyzeDomains } from "@/services/keywordService";
import ContentGenerator from "@/components/ContentGenerator";
import ApiIntegrationManager from "@/components/ApiIntegrationManager";
import { Header } from "@/components/page/Header";
import { DomainAnalysisForm } from "@/components/domain-analysis/DomainAnalysisForm";
import { AnalysisError } from "@/components/domain-analysis/AnalysisError";
import { DashboardContent } from "@/components/domain-analysis/DashboardContent";
import { ContentEmptyState } from "@/components/content/ContentEmptyState";
import KeywordResearch from "@/components/KeywordResearch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ContentHistory from "@/components/content-generator/ContentHistory";
import DataForSEODashboard from "@/components/dataforseo/DataForSEODashboard";
import { DataForSEOAnalysisResult } from "@/components/dataforseo/types";

const Index = () => {
  const [mainDomain, setMainDomain] = useState("");
  const [competitorDomains, setCompetitorDomains] = useState<string[]>([""]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [keywordData, setKeywordData] = useState<any[]>([]);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [showApiForm, setShowApiForm] = useState(false);
  const [newApiName, setNewApiName] = useState("");
  const [newApiKey, setNewApiKey] = useState("");
  
  const [dataForSEOAnalysisData, setDataForSEOAnalysisData] = useState<DataForSEOAnalysisResult | null>(null);
  const [dataForSEODomain, setDataForSEODomain] = useState("example.com");

  useEffect(() => {
    setAnalysisError(null);
  }, [activeTab]);
  
  useEffect(() => {
    try {
      const savedAnalysis = localStorage.getItem('seoAnalysisData');
      if (savedAnalysis) {
        const parsedData = JSON.parse(savedAnalysis);
        
        if (parsedData.mainDomain) setMainDomain(parsedData.mainDomain);
        if (Array.isArray(parsedData.competitorDomains)) setCompetitorDomains(parsedData.competitorDomains);
        if (Array.isArray(parsedData.keywordData)) {
          setKeywordData(parsedData.keywordData);
          setAnalysisComplete(true);
        }
      }
    } catch (error) {
      console.error("Error loading saved analysis:", error);
    }
  }, []);

  useEffect(() => {
    if (analysisComplete && keywordData.length > 0) {
      try {
        const dataToSave = {
          mainDomain,
          competitorDomains,
          keywordData,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('seoAnalysisData', JSON.stringify(dataToSave));
        console.log("Analysis data saved to localStorage");
      } catch (error) {
        console.error("Error saving analysis data:", error);
      }
    }
  }, [mainDomain, competitorDomains, keywordData, analysisComplete]);

  const addCompetitorDomain = () => {
    if (isAnalyzing) return;
    setCompetitorDomains([...competitorDomains, ""]);
  };

  const removeCompetitorDomain = (index: number) => {
    if (isAnalyzing) return;
    const newDomains = [...competitorDomains];
    newDomains.splice(index, 1);
    setCompetitorDomains(newDomains);
  };

  const removeCompetitorFromAnalysis = (competitorToRemove: string) => {
    if (isAnalyzing) {
      toast.error("Cannot remove competitors during analysis");
      return;
    }

    const updatedCompetitors = competitorDomains.filter(
      domain => domain.toLowerCase() !== competitorToRemove.toLowerCase()
    );
    
    if (updatedCompetitors.length === competitorDomains.length) {
      toast.error(`Could not find competitor ${competitorToRemove} to remove`);
      return;
    }
    
    setCompetitorDomains(updatedCompetitors);
    
    try {
      const savedData = localStorage.getItem('seoAnalysisData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        parsedData.competitorDomains = updatedCompetitors;
        localStorage.setItem('seoAnalysisData', JSON.stringify(parsedData));
      }
    } catch (error) {
      console.error("Error updating saved analysis:", error);
    }
    
    toast.success(`Removed ${competitorToRemove} from competitors`);
  };

  const updateCompetitorDomain = (index: number, value: string) => {
    if (isAnalyzing) return;
    const newDomains = [...competitorDomains];
    newDomains[index] = value;
    setCompetitorDomains(newDomains);
  };

  const validateUrl = (url: string) => {
    if (!url) return false;
    
    let processedUrl = url;
    if (!/^https?:\/\//i.test(url)) {
      processedUrl = 'https://' + url;
    }
    
    try {
      new URL(processedUrl);
      return true;
    } catch (e) {
      return false;
    }
  };

  const formatUrl = (url: string) => {
    if (!url) return "";
    
    if (!/^https?:\/\//i.test(url)) {
      return 'https://' + url;
    }
    return url;
  };

  const handleReset = () => {
    setAnalysisError(null);
    setProgress(0);
    setIsAnalyzing(false);
    setAnalysisComplete(false);
    setKeywordData([]);
    setMainDomain("");
    setCompetitorDomains([""]);
    
    localStorage.removeItem('seoAnalysisData');
    
    setActiveTab("dashboard");
    
    toast.success("Analysis data has been reset");
  };

  const handleAnalyze = async () => {
    setAnalysisError(null);
    
    if (!mainDomain || !validateUrl(mainDomain)) {
      toast.error("Please enter a valid main domain");
      return;
    }
    
    const validCompetitorDomains = competitorDomains.filter(domain => domain.trim() !== "");
    
    if (validCompetitorDomains.length === 0) {
      toast.error("Please add at least one competitor domain");
      return;
    }
    
    if (validCompetitorDomains.some(domain => !validateUrl(domain))) {
      toast.error("Please enter valid competitor domains");
      return;
    }
    
    const formattedMainDomain = formatUrl(mainDomain);
    const formattedCompetitorDomains = validCompetitorDomains.map(formatUrl);
    
    setIsAnalyzing(true);
    setProgress(0);
    setKeywordData([]);
    setAnalysisComplete(false);
    
    console.info("Analyzing domains:", formattedMainDomain, formattedCompetitorDomains);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        if (newProgress >= 95) {
          clearInterval(interval);
          return 95;
        }
        return newProgress;
      });
    }, 800);
    
    try {
      const result = await analyzeDomains(formattedMainDomain, formattedCompetitorDomains);
      
      if (result.success) {
        const keywords = Array.isArray(result.keywords) ? result.keywords : [];
        setKeywordData(keywords);
        setProgress(100);
        
        setTimeout(() => {
          setIsAnalyzing(false);
          setAnalysisComplete(true);
          toast.success("Analysis complete! View your results in the dashboard.");
        }, 500);
      } else {
        throw new Error("Analysis failed");
      }
    } catch (error) {
      clearInterval(interval);
      setIsAnalyzing(false);
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setAnalysisError(errorMessage);
      toast.error(`Analysis failed: ${errorMessage}`);
      setProgress(0);
    }
  };

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
    console.log(`Generating content for "${keyword}" with related keywords:`, relatedKeywords);
  };

  const handleAddNewApi = () => {
    if (!newApiName.trim() || !newApiKey.trim()) {
      toast.error("Please provide both API name and key");
      return;
    }
    
    toast.success(`Added new API integration: ${newApiName}`);
    
    setNewApiName("");
    setNewApiKey("");
    setShowApiForm(false);
  };

  const handleRunSeoStrategy = () => {
    toast.success("SEO strategy execution initiated for Revology Analytics");
    // Any additional logic for SEO strategy execution would go here
  };

  const validCompetitorDomains = competitorDomains.filter(domain => domain && domain.trim() !== "");
  const keywordStrings = Array.isArray(keywordData) ? keywordData.map(kw => kw.keyword) : [];

  return (
    <Layout>
      <div className="container px-4 py-8 mx-auto max-w-7xl animate-fade-in">
        <Header analysisComplete={analysisComplete} onReset={handleReset} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-md">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="dataforseo" className="flex items-center gap-2">
              <Globe className="w-4 h-4" /> DataForSEO
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="w-4 h-4" /> Content
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" /> History
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
                <DomainAnalysisForm 
                  mainDomain={mainDomain}
                  competitorDomains={competitorDomains}
                  isAnalyzing={isAnalyzing}
                  progress={progress}
                  onMainDomainChange={setMainDomain}
                  onAddCompetitorDomain={addCompetitorDomain}
                  onRemoveCompetitorDomain={removeCompetitorDomain}
                  onUpdateCompetitorDomain={updateCompetitorDomain}
                  onAnalyze={handleAnalyze}
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
              <DashboardContent 
                domain={mainDomain}
                competitorDomains={validCompetitorDomains}
                keywords={keywordData}
                isAnalyzing={isAnalyzing}
                onAddCompetitor={handleAddCompetitorFromTable}
                onRemoveCompetitor={removeCompetitorFromAnalysis}
                onGenerateContentFromKeyword={handleGenerateContentFromKeyword}
                onRunSeoStrategy={handleRunSeoStrategy}
              />
            )}
          </TabsContent>
          
          <TabsContent value="dataforseo" className="space-y-6">
            <DataForSEODashboard 
              analysisData={dataForSEOAnalysisData} 
              domain={dataForSEODomain} 
            />
          </TabsContent>
          
          <TabsContent value="content" className="space-y-6">
            {!analysisComplete ? (
              <ContentEmptyState onGoToAnalysis={() => setActiveTab("dashboard")} />
            ) : (
              <ContentGenerator 
                domain={mainDomain} 
                allKeywords={keywordStrings}
              />
            )}
          </TabsContent>
          
          <TabsContent value="history" className="space-y-6">
            {!analysisComplete ? (
              <ContentEmptyState onGoToAnalysis={() => setActiveTab("dashboard")} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Content History</CardTitle>
                  <CardDescription>View your previously generated content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4">
                    <ContentHistory />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader className="border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="size-10 bg-revology rounded-full flex items-center justify-center text-white font-bold">RA</div>
                  <div>
                    <CardTitle>Revology Analytics Settings</CardTitle>
                    <CardDescription>Configure your analysis preferences</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-3">
                  <Label htmlFor="api-key">API Key</Label>
                  <Input id="api-key" type="password" value="b84198e677msh416f3b6bc96f2b3p1a60f3jsnaadb78e898c9" readOnly className="transition-all bg-muted/30" />
                  <p className="text-sm text-muted-foreground">Used for keyword research and data retrieval</p>
                </div>
                
                <Separator />
                
                <ApiIntegrationManager />
                
                <Separator />
                
                <div className="space-y-3">
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <Input id="webhook-url" placeholder="https://your-webhook-endpoint.com/seo-updates" className="transition-all" />
                  <p className="text-sm text-muted-foreground">Receive notifications when analysis is complete</p>
                  
                  <div className="pt-2">
                    <Label className="text-sm font-normal flex items-center gap-2">
                      <input type="checkbox" className="rounded text-revology" />
                      Enable webhook notifications
                    </Label>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="brand-voice">Brand Voice</Label>
                  <Textarea id="brand-voice" placeholder="Describe your brand's tone and voice for AI-generated content" className="transition-all" />
                </div>
                
                <div className="space-y-3">
                  <Label>Content Preferences</Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="cursor-pointer hover:bg-revology-light hover:text-revology hover:border-revology/30 transition-all">
                      Include meta descriptions
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-revology-light hover:text-revology hover:border-revology/30 transition-all">
                      Focus on H1/H2 tags
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-revology-light hover:text-revology hover:border-revology/30 transition-all">
                      Use bullet points
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-revology-light hover:text-revology hover:border-revology/30 transition-all">
                      Add internal links
                    </Badge>
                  </div>
                </div>
                
                <Button className="transition-all bg-revology hover:bg-revology-dark">Save Settings</Button>
              </CardContent>
            </Card>
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
