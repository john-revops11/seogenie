
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Loader2, BarChart2, AlertCircle, Globe, Clock, Zap, Crosshair } from "lucide-react";
import { useDataForSEOAnalysis } from "@/hooks/dataforseo/useDataForSEOAnalysis";
import { DataForSEOAnalysisResult, SerpResult, VolumeResult, CompetitorResult } from "./types";

const DataForSEODashboard = () => {
  const [domain, setDomain] = useState("example.com");
  const [keywordsInput, setKeywordsInput] = useState("example keyword\nanother test keyword");
  const [activeResultTab, setActiveResultTab] = useState("rankings");
  
  const { runAnalysis, loading, error, analysisData } = useDataForSEOAnalysis();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse keywords from textarea (one per line)
    const keywords = keywordsInput
      .split("\n")
      .map(k => k.trim())
      .filter(k => k !== "");
    
    runAnalysis(domain, keywords);
  };
  
  // Combine SERP and volume data for the rankings table
  const combineKeywordData = () => {
    if (!analysisData?.serp?.results || !analysisData?.volume?.results) {
      return [];
    }
    
    return analysisData.serp.results.map(serpItem => {
      const volumeItem = analysisData.volume.results.find(
        v => v.keyword.toLowerCase() === serpItem.keyword.toLowerCase()
      );
      
      return {
        ...serpItem,
        search_volume: volumeItem?.search_volume || 0,
        cpc: volumeItem?.cpc || 0,
        competition: volumeItem?.competition || 0,
      };
    });
  };
  
  const combinedKeywordData = combineKeywordData();
  
  // Calculate summary metrics
  const calculateSummary = () => {
    if (!analysisData) return null;
    
    const keywordsRanked = analysisData.serp.results.filter(item => item.position !== null).length;
    const totalKeywords = analysisData.serp.results.length;
    const avgPosition = analysisData.serp.results
      .filter(item => item.position !== null)
      .reduce((sum, item) => sum + (item.position || 0), 0) / (keywordsRanked || 1);
    
    const totalVolume = analysisData.volume.results.reduce(
      (sum, item) => sum + (item.search_volume || 0), 0
    );
    
    const avgCpc = analysisData.volume.results.reduce(
      (sum, item) => sum + (item.cpc || 0), 0
    ) / analysisData.volume.results.length;
    
    return {
      keywordsRanked,
      totalKeywords,
      avgPosition: avgPosition.toFixed(1),
      totalVolume,
      avgCpc: avgCpc.toFixed(2),
      organicTraffic: analysisData.traffic.results.organic_traffic,
      paidTraffic: analysisData.traffic.results.paid_traffic,
      totalTraffic: analysisData.traffic.results.total_traffic,
    };
  };
  
  const summary = calculateSummary();
  
  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader className="border-b border-border">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>DataForSEO Dashboard</CardTitle>
              <CardDescription>Analyze domain rankings, search volume, and traffic data</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="domain">Domain</Label>
              <Input
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="example.com"
                className="transition-all"
              />
              <p className="text-sm text-muted-foreground">Enter a domain name without http:// or https://</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords</Label>
              <Textarea
                id="keywords"
                value={keywordsInput}
                onChange={(e) => setKeywordsInput(e.target.value)}
                placeholder="Enter keywords (one per line)"
                className="min-h-[120px] transition-all"
              />
              <p className="text-sm text-muted-foreground">Enter each keyword on a new line</p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full mt-4 transition-all bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Run Analysis
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {analysisData && (
        <div className="space-y-6 animate-slide-up">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Keywords Ranked</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-bold">
                    {summary?.keywordsRanked}/{summary?.totalKeywords}
                  </div>
                  <Badge variant={summary?.keywordsRanked === 0 ? "destructive" : "default"}>
                    {summary?.keywordsRanked === 0 ? "No Rankings" : `${Math.round((summary?.keywordsRanked / summary?.totalKeywords) * 100)}%`}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Average Position</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-bold">
                    {summary?.avgPosition}
                  </div>
                  <Badge variant={Number(summary?.avgPosition) <= 10 ? "success" : "warning"}>
                    {Number(summary?.avgPosition) <= 10 ? "First Page" : "Below Top 10"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Search Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-bold">
                    {summary?.totalVolume?.toLocaleString() || 0}
                  </div>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Estimated Traffic</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-bold">
                    {summary?.totalTraffic?.toLocaleString() || 0}/mo
                  </div>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {summary?.organicTraffic?.toLocaleString() || 0} organic · {summary?.paidTraffic?.toLocaleString() || 0} paid
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="rankings" value={activeResultTab} onValueChange={setActiveResultTab}>
            <TabsList>
              <TabsTrigger value="rankings">Rankings</TabsTrigger>
              <TabsTrigger value="volume">Search Volume</TabsTrigger>
              <TabsTrigger value="competitors">Competitors</TabsTrigger>
            </TabsList>
            
            <TabsContent value="rankings" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Keyword Rankings</CardTitle>
                  <CardDescription>Search engine positions for your domain</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Keyword</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead className="hidden md:table-cell">Title</TableHead>
                        <TableHead className="text-right">Search Volume</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {combinedKeywordData.length > 0 ? (
                        combinedKeywordData.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.keyword}</TableCell>
                            <TableCell>
                              {item.position ? (
                                <Badge variant={item.position <= 10 ? "success" : "outline"}>
                                  {item.position}
                                </Badge>
                              ) : (
                                <Badge variant="outline">Not Ranked</Badge>
                              )}
                            </TableCell>
                            <TableCell className="hidden md:table-cell max-w-[300px] truncate">
                              {item.title || "-"}
                            </TableCell>
                            <TableCell className="text-right">{item.search_volume?.toLocaleString() || 0}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                            No ranking data available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="volume" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Keyword Search Volume</CardTitle>
                  <CardDescription>Monthly search volume and CPC data</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Keyword</TableHead>
                        <TableHead>Search Volume</TableHead>
                        <TableHead>CPC</TableHead>
                        <TableHead className="text-right">Competition</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analysisData.volume.results.length > 0 ? (
                        analysisData.volume.results.map((item: VolumeResult, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.keyword}</TableCell>
                            <TableCell>{item.search_volume?.toLocaleString() || 0}</TableCell>
                            <TableCell>${item.cpc?.toFixed(2) || "0.00"}</TableCell>
                            <TableCell className="text-right">
                              <Badge variant={item.competition < 0.3 ? "success" : item.competition < 0.7 ? "warning" : "destructive"}>
                                {(item.competition * 100).toFixed(0)}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                            No search volume data available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="competitors" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Competitor Domains</CardTitle>
                  <CardDescription>Similar websites competing for the same keywords</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Domain</TableHead>
                        <TableHead>Relevance Score</TableHead>
                        <TableHead className="text-right">Common Keywords</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analysisData.competitors.results.length > 0 ? (
                        analysisData.competitors.results.map((item: CompetitorResult, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              <a href={`https://${item.domain}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                {item.domain}
                              </a>
                            </TableCell>
                            <TableCell>
                              <div className="w-full bg-muted rounded-full h-2.5">
                                <div 
                                  className="bg-blue-600 h-2.5 rounded-full" 
                                  style={{ width: `${item.score * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-xs mt-1 block">{(item.score * 100).toFixed(0)}%</span>
                            </TableCell>
                            <TableCell className="text-right">{item.common_keywords?.toLocaleString() || 0}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                            No competitor data available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter className="border-t p-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Crosshair className="h-4 w-4" />
                    Top 5 competitors based on keyword overlap and relevance
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default DataForSEODashboard;
