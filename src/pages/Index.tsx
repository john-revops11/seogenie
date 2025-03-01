
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  ChevronRight, 
  Plus, 
  X, 
  Search, 
  BarChart2, 
  FileText, 
  Settings, 
  Loader2, 
  Zap,
  RotateCcw
} from "lucide-react";
import { KeywordGapCard } from "@/components/KeywordGapCard";
import { SeoRecommendationsCard } from "@/components/SeoRecommendationsCard";
import ContentGenerator from "@/components/ContentGenerator";
import Layout from "@/components/Layout";
import { analyzeDomains } from "@/services/keywordService";
import KeywordTable from "@/components/KeywordTable";

const Index = () => {
  const [mainDomain, setMainDomain] = useState("");
  const [competitorDomains, setCompetitorDomains] = useState<string[]>([""]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [keywordData, setKeywordData] = useState<any[]>([]);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  useEffect(() => {
    setAnalysisError(null);
  }, [activeTab]);
  
  // Load saved analysis data from localStorage on initial load
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

  // Save current analysis data to localStorage whenever it changes
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
    // Clear the analysis data
    setAnalysisError(null);
    setProgress(0);
    setIsAnalyzing(false);
    setAnalysisComplete(false);
    setKeywordData([]);
    setMainDomain("");
    setCompetitorDomains([""]);
    
    // Clear localStorage
    localStorage.removeItem('seoAnalysisData');
    
    // Switch to dashboard tab
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

  const renderProgressStatus = () => {
    if (progress < 25) return "Gathering keyword data...";
    if (progress < 50) return "Analyzing competitor domains...";
    if (progress < 75) return "Identifying keyword gaps...";
    if (progress < 95) return "Generating SEO recommendations...";
    return "Finalizing results...";
  };

  const keywordStrings = Array.isArray(keywordData) ? keywordData.map(kw => kw.keyword) : [];

  const validCompetitorDomains = competitorDomains.filter(domain => domain && domain.trim() !== "");

  // Handle adding a new competitor from the KeywordTable component
  const handleAddCompetitorFromTable = (newCompetitor: string) => {
    if (isAnalyzing) return;
    
    // Check if already exists
    if (competitorDomains.includes(newCompetitor)) {
      toast.error("This competitor is already in your analysis");
      return;
    }
    
    // Add the new competitor
    setCompetitorDomains([...competitorDomains, newCompetitor]);
    toast.success(`Added ${newCompetitor} to competitors list`);
  };

  return (
    <Layout>
      <div className="container px-4 py-8 mx-auto max-w-7xl animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Badge className="mb-2 bg-revology-light text-revology hover:bg-revology-light/80 transition-all">SEO Analysis Tool</Badge>
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-2">
              <span className="text-revology">Revology Analytics</span>
              <span className="text-2xl font-normal text-muted-foreground">|</span>
              <span>SeoCrafter</span>
            </h1>
            <p className="mt-2 text-muted-foreground">Keyword analysis and AI-driven content generation</p>
          </div>
          <div className="flex items-center gap-3">
            {analysisComplete && (
              <Button 
                variant="outline" 
                onClick={handleReset} 
                className="flex items-center gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Data
              </Button>
            )}
            <Avatar className="w-12 h-12 border-2 border-revology">
              <AvatarImage src="https://ui.shadcn.com/avatars/01.png" />
              <AvatarFallback className="bg-revology-light text-revology">RA</AvatarFallback>
            </Avatar>
          </div>
        </div>

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
              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="text-destructive">Analysis Error</CardTitle>
                  <CardDescription>There was a problem analyzing the domains</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">{analysisError}</p>
                  <Button onClick={handleReset} variant="outline">Try Again</Button>
                </CardContent>
              </Card>
            ) : !analysisComplete ? (
              <Card className="glass-panel transition-all duration-300 hover:shadow-xl border-revology/10">
                <CardHeader>
                  <CardTitle>Domain Analysis</CardTitle>
                  <CardDescription>Enter your main domain and competitor domains to analyze</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="main-domain">Main Domain</Label>
                      <Input
                        id="main-domain"
                        placeholder="example.com"
                        value={mainDomain}
                        onChange={(e) => setMainDomain(e.target.value)}
                        className="transition-all focus:ring-2 focus:ring-revology/20"
                        disabled={isAnalyzing}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Competitor Domains</Label>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={addCompetitorDomain}
                          className="text-xs transition-all border-revology/30 text-revology hover:text-revology hover:bg-revology-light/50"
                          disabled={isAnalyzing}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add
                        </Button>
                      </div>
                      
                      {competitorDomains.map((domain, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            placeholder={`competitor${index + 1}.com`}
                            value={domain}
                            onChange={(e) => updateCompetitorDomain(index, e.target.value)}
                            className="transition-all focus:ring-2 focus:ring-revology/20"
                            disabled={isAnalyzing}
                          />
                          {competitorDomains.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeCompetitorDomain(index)}
                              className="h-8 w-8 hover:text-revology hover:bg-revology-light/50"
                              disabled={isAnalyzing}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="w-full mt-4 transition-all bg-revology hover:bg-revology-dark"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Analyze Keywords
                      </>
                    )}
                  </Button>
                  
                  {isAnalyzing && (
                    <div className="space-y-2 mt-4 animate-fade-in">
                      <div className="flex items-center justify-between text-sm">
                        <span>{renderProgressStatus()}</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2 transition-all progress-bar-animated bg-muted" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-slide-up">
                <div className="md:col-span-2 lg:col-span-3">
                  <KeywordTable 
                    domain={mainDomain} 
                    competitorDomains={validCompetitorDomains} 
                    keywords={keywordData || []}
                    isLoading={isAnalyzing}
                  />
                </div>
                
                <KeywordGapCard 
                  domain={mainDomain} 
                  competitorDomains={validCompetitorDomains} 
                  keywords={keywordData || []}
                  isLoading={isAnalyzing}
                />
                
                <div className="md:col-span-1 lg:col-span-2">
                  <SeoRecommendationsCard 
                    domain={mainDomain} 
                    keywords={keywordData || []}
                    isLoading={isAnalyzing}
                  />
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="content" className="space-y-6">
            {!analysisComplete ? (
              <Card>
                <CardHeader>
                  <CardTitle>Content Generation</CardTitle>
                  <CardDescription>Run a keyword analysis first to get content recommendations</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <div className="text-center">
                    <Zap className="w-12 h-12 mx-auto mb-4 text-revology opacity-50" />
                    <h3 className="text-lg font-medium">No keyword data available</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Please complete a keyword analysis first to enable AI-driven content generation
                    </p>
                    <Button 
                      onClick={() => {
                        setActiveTab("dashboard");
                      }}
                      className="mt-6 bg-revology hover:bg-revology-dark"
                    >
                      Go to Analysis <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <ContentGenerator 
                domain={mainDomain} 
                allKeywords={keywordStrings}
              />
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
        
        {/* Show persistence indicator if we have saved data */}
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
