
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, RefreshCw, Save, Search, ArrowDownToLine, Filter, FileText } from "lucide-react";
import { keywordGapsCache } from "./keyword-gaps/KeywordGapUtils";
import { KeywordGap } from "@/services/keywords/keywordGaps";
import { useKeywordGapAnalysis } from "@/hooks/useKeywordGapAnalysis";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { analyzeKeywordsWithAI, saveKeywordGaps, getSavedKeywordGaps } from "@/services/keywords/utils/aiKeywordAnalysis";
import { toast } from "sonner";

export { keywordGapsCache };

interface KeywordGapCardProps {
  domain: string;
  competitorDomains: string[];
  keywords: any[];
  isLoading: boolean;
}

export function KeywordGapCard({ domain, competitorDomains, keywords, isLoading }: KeywordGapCardProps) {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiGaps, setAiGaps] = useState<KeywordGap[]>([]);
  const [activeTab, setActiveTab] = useState("standard");
  const [savedSessions, setSavedSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  
  const {
    keywordGaps,
    loading,
    error,
    selectedKeywords,
    currentPage,
    itemsPerPage,
    displayedKeywords,
    filterCompetitor,
    apiSource,
    locationCode,
    totalKeywords,
    totalPages,
    startItem,
    endItem,
    handleKeywordSelection,
    handlePageChange,
    handleCompetitorFilterChange,
    handleApiSourceChange,
    handleLocationChange,
    refreshAnalysis
  } = useKeywordGapAnalysis(domain, competitorDomains, keywords, isLoading);

  // Run AI analysis to find keyword gaps
  const runAIAnalysis = async () => {
    if (!domain || !competitorDomains || competitorDomains.length === 0 || !keywords || keywords.length === 0) {
      toast.error("Please complete domain analysis first");
      return;
    }
    
    setAiLoading(true);
    
    try {
      toast.loading("Analyzing keyword gaps with AI...", { id: "ai-gaps" });
      const gaps = await analyzeKeywordsWithAI(domain, competitorDomains, keywords);
      setAiGaps(gaps);
      setActiveTab("ai");
      toast.success(`Found ${gaps.length} AI-analyzed keyword gaps`, { id: "ai-gaps" });
    } catch (error) {
      console.error("Error running AI analysis:", error);
      toast.error(`Error analyzing gaps: ${error instanceof Error ? error.message : "Unknown error"}`, { id: "ai-gaps" });
    } finally {
      setAiLoading(false);
    }
  };
  
  // Save current keyword gaps
  const saveCurrentGaps = async () => {
    const gapsToSave = activeTab === "ai" ? aiGaps : keywordGaps;
    
    if (!gapsToSave || gapsToSave.length === 0) {
      toast.error("No keyword gaps to save");
      return;
    }
    
    toast.loading("Saving keyword gaps...", { id: "save-gaps" });
    
    try {
      const success = await saveKeywordGaps(domain, competitorDomains, gapsToSave);
      
      if (success) {
        toast.success("Keyword gaps saved successfully", { id: "save-gaps" });
      } else {
        toast.error("Failed to save keyword gaps", { id: "save-gaps" });
      }
    } catch (error) {
      console.error("Error saving gaps:", error);
      toast.error(`Error: ${error instanceof Error ? error.message : "Unknown error"}`, { id: "save-gaps" });
    }
  };
  
  // Load saved keyword gap sessions
  const loadSavedSessions = async () => {
    setLoadingSessions(true);
    
    try {
      const sessions = await getSavedKeywordGaps();
      setSavedSessions(sessions);
    } catch (error) {
      console.error("Error loading saved sessions:", error);
      toast.error("Failed to load saved sessions");
    } finally {
      setLoadingSessions(false);
    }
  };
  
  // Load a specific saved session
  const loadSavedSession = (sessionId: string) => {
    const session = savedSessions.find(s => s.id === sessionId);
    
    if (!session) {
      toast.error("Session not found");
      return;
    }
    
    setAiGaps(session.keyword_gaps);
    setActiveTab("ai");
    toast.success(`Loaded ${session.gaps_count} keyword gaps from saved session`);
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader className="border-b border-border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-semibold">Keyword Gap Analysis</CardTitle>
            <CardDescription>
              Discover keyword opportunities your competitors are ranking for
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={runAIAnalysis} 
              disabled={aiLoading || isLoading || loading || !keywords || keywords.length === 0}
            >
              {aiLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              AI Analysis
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={saveCurrentGaps}
              disabled={aiLoading || isLoading || loading || (!aiGaps.length && !keywordGaps?.length)}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Results
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={loadSavedSessions}
              disabled={loadingSessions}
            >
              {loadingSessions ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ArrowDownToLine className="h-4 w-4 mr-2" />
              )}
              Load Saved
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="px-6 pt-4 border-b">
          <TabsList>
            <TabsTrigger value="standard">Standard Analysis</TabsTrigger>
            <TabsTrigger value="ai" disabled={aiGaps.length === 0 && !aiLoading}>
              AI Analysis
              {aiGaps.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {aiGaps.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="saved" onClick={loadSavedSessions} disabled={loadingSessions}>
              Saved Sessions
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="standard" className="p-0">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 gap-2">
              <div className="flex items-center gap-2">
                <Select value={filterCompetitor} onValueChange={handleCompetitorFilterChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by competitor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Competitors</SelectItem>
                    {competitorDomains.map((domain, index) => (
                      <SelectItem key={index} value={domain}>
                        {domain}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={refreshAnalysis}
                  disabled={loading || isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Select value={apiSource} onValueChange={handleApiSourceChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Data source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dataforseo-intersection">DataForSEO (Preferred)</SelectItem>
                    <SelectItem value="direct-analysis">Direct Analysis</SelectItem>
                    <SelectItem value="openai">OpenAI Analysis</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={locationCode.toString()} onValueChange={(value) => handleLocationChange(parseInt(value))}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2840">United States</SelectItem>
                    <SelectItem value="2826">United Kingdom</SelectItem>
                    <SelectItem value="2124">Canada</SelectItem>
                    <SelectItem value="2036">Australia</SelectItem>
                    <SelectItem value="2276">Germany</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {loading || isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Analyzing keyword gaps...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-red-500 mb-4">{error}</p>
                <Button variant="outline" onClick={refreshAnalysis}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            ) : keywordGaps && keywordGaps.length > 0 ? (
              <div>
                <div className="grid gap-4">
                  <div className="rounded-md border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="h-10 px-4 text-left font-medium">Keyword</th>
                          <th className="h-10 px-4 text-left font-medium">Volume</th>
                          <th className="h-10 px-4 text-left font-medium">Difficulty</th>
                          <th className="h-10 px-4 text-left font-medium">Competitor</th>
                          <th className="h-10 px-4 text-left font-medium">Position</th>
                          <th className="h-10 px-4 text-left font-medium">Opportunity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayedKeywords.map((gap, i) => (
                          <tr key={i} className="border-b hover:bg-muted/50 transition-colors">
                            <td className="p-4 align-middle font-medium">{gap.keyword}</td>
                            <td className="p-4 align-middle">{gap.volume || 0}</td>
                            <td className="p-4 align-middle">{gap.difficulty || 0}/100</td>
                            <td className="p-4 align-middle">{gap.competitor || "N/A"}</td>
                            <td className="p-4 align-middle">{gap.rank || "N/A"}</td>
                            <td className="p-4 align-middle">
                              <Badge variant={
                                gap.opportunity === "high" 
                                  ? "success" 
                                  : gap.opportunity === "medium" 
                                    ? "warning" 
                                    : "outline"
                              }>
                                {gap.opportunity || "low"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {startItem} to {endItem} of {totalKeywords} gaps
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No keyword gaps found</p>
                <p className="text-sm text-muted-foreground mb-4">Try analyzing your domain first or changing filters</p>
                <Button variant="outline" onClick={refreshAnalysis}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Analysis
                </Button>
              </div>
            )}
          </CardContent>
        </TabsContent>
        
        <TabsContent value="ai" className="p-0">
          <CardContent className="pt-6">
            {aiLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Analyzing with AI...</p>
                <p className="text-sm text-muted-foreground">This may take a minute or two</p>
              </div>
            ) : aiGaps.length > 0 ? (
              <div>
                <div className="mb-4 flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-blue-50">AI-Generated Analysis</Badge>
                  {aiGaps.filter(gap => gap.isTopOpportunity).length > 0 && (
                    <Badge variant="outline" className="bg-green-50">
                      {aiGaps.filter(gap => gap.isTopOpportunity).length} Top Opportunities
                    </Badge>
                  )}
                </div>
                
                <div className="grid gap-4">
                  <div className="rounded-md border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="h-10 px-4 text-left font-medium">Keyword</th>
                          <th className="h-10 px-4 text-left font-medium">Volume</th>
                          <th className="h-10 px-4 text-left font-medium">Difficulty</th>
                          <th className="h-10 px-4 text-left font-medium">Competitor</th>
                          <th className="h-10 px-4 text-left font-medium">Relevance</th>
                          <th className="h-10 px-4 text-left font-medium">Comp. Advantage</th>
                          <th className="h-10 px-4 text-left font-medium">Opportunity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {aiGaps.map((gap, i) => (
                          <tr 
                            key={i} 
                            className={`border-b hover:bg-muted/50 transition-colors ${
                              gap.isTopOpportunity ? "bg-green-50" : ""
                            }`}
                          >
                            <td className="p-4 align-middle font-medium">{gap.keyword}</td>
                            <td className="p-4 align-middle">{gap.volume || 0}</td>
                            <td className="p-4 align-middle">{gap.difficulty || 0}/100</td>
                            <td className="p-4 align-middle">{gap.competitor || "N/A"}</td>
                            <td className="p-4 align-middle">{gap.relevance || 0}/100</td>
                            <td className="p-4 align-middle">{gap.competitiveAdvantage || 0}/100</td>
                            <td className="p-4 align-middle">
                              <Badge variant={
                                gap.opportunity === "high" 
                                  ? "success" 
                                  : gap.opportunity === "medium" 
                                    ? "warning" 
                                    : "outline"
                              }>
                                {gap.opportunity || "low"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No AI analysis results</p>
                <p className="text-sm text-muted-foreground mb-4">Run AI analysis to identify keyword opportunities</p>
                <Button variant="outline" onClick={runAIAnalysis}>
                  <Search className="h-4 w-4 mr-2" />
                  Run AI Analysis
                </Button>
              </div>
            )}
          </CardContent>
        </TabsContent>
        
        <TabsContent value="saved" className="p-0">
          <CardContent className="pt-6">
            {loadingSessions ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Loading saved sessions...</p>
              </div>
            ) : savedSessions.length > 0 ? (
              <div>
                <div className="grid gap-4">
                  <div className="rounded-md border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="h-10 px-4 text-left font-medium">Session</th>
                          <th className="h-10 px-4 text-left font-medium">Domain</th>
                          <th className="h-10 px-4 text-left font-medium">Gaps Count</th>
                          <th className="h-10 px-4 text-left font-medium">Created</th>
                          <th className="h-10 px-4 text-left font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {savedSessions.map((session) => (
                          <tr key={session.id} className="border-b hover:bg-muted/50 transition-colors">
                            <td className="p-4 align-middle font-medium">
                              {new Date(session.created_at).toLocaleDateString()}
                            </td>
                            <td className="p-4 align-middle">{session.main_domain}</td>
                            <td className="p-4 align-middle">{session.gaps_count}</td>
                            <td className="p-4 align-middle">
                              {new Date(session.created_at).toLocaleString()}
                            </td>
                            <td className="p-4 align-middle">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => loadSavedSession(session.id)}
                              >
                                Load
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No saved sessions found</p>
                <p className="text-sm text-muted-foreground mb-4">Run analysis and save results to see them here</p>
                <Button variant="outline" onClick={loadSavedSessions}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            )}
          </CardContent>
        </TabsContent>
      </Tabs>
      
      <CardFooter className="flex flex-col items-start border-t px-6 py-4">
        <div className="text-xs text-muted-foreground">
          <p>AI analysis helps identify the most valuable keyword gaps that competitors are ranking for but you aren't.</p>
          <p className="mt-1">Save your analysis sessions to reference them later without re-running the analysis.</p>
        </div>
      </CardFooter>
    </Card>
  );
}

export default KeywordGapCard;
