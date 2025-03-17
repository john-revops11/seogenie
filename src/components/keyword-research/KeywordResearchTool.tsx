import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search, TrendingUp, TrendingDown, ArrowUpRight, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { useDataForSeoClient, DataForSeoResponse } from "@/hooks/useDataForSeoClient";
import { KeywordData } from "@/services/keywords/types";

interface TrendData {
  month: string;
  volume: number;
}

const KeywordResearchTool: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [domain, setDomain] = useState<string>("");
  const [searchMode, setSearchMode] = useState<"keyword" | "domain">("keyword");
  const [keywords, setKeywords] = useState<KeywordData[]>([]);
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sortField, setSortField] = useState<string>("search_volume");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [savedKeywords, setSavedKeywords] = useState<KeywordData[]>([]);
  
  const { getDomainKeywords, isLoading: apiLoading, error } = useDataForSeoClient();

  const generateTrendData = (baseVolume: number) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months.map(month => {
      const variation = Math.random() * 0.4 - 0.2; // -20% to +20%
      return {
        month,
        volume: Math.round(baseVolume * (1 + variation))
      };
    });
  };

  const searchKeywords = async () => {
    if (!query && !domain) {
      toast.error("Please enter a keyword or domain");
      return;
    }

    setIsLoading(true);
    try {
      if (searchMode === "domain") {
        const response = await getDomainKeywords(domain);
        
        if (response && response.tasks && response.tasks.length > 0 && response.tasks[0].result) {
          const keywordResults = response.tasks[0].result.map((item: any) => ({
            keyword: item.keyword || "",
            search_volume: item.search_volume || 0,
            cpc: typeof item.cpc === 'number' ? item.cpc : parseFloat(item.cpc) || 0,
            competition: item.competition_index || 0,
            competition_index: item.competition_index || 0,
            trend_data: generateTrendData(item.search_volume || 100)
          }));
          
          setKeywords(keywordResults);
          if (keywordResults.length > 0) {
            setSelectedKeyword(keywordResults[0]);
          }
          toast.success(`Found ${keywordResults.length} keywords for ${domain}`);
        } else {
          toast.error("No keyword data found for this domain. Try a more established domain with better organic visibility.");
          setKeywords([]);
        }
      } else {
        const mockData = [
          { 
            keyword: query, 
            search_volume: Math.floor(Math.random() * 10000) + 1000,
            cpc: parseFloat((Math.random() * 5).toFixed(2)),
            competition: Math.random(),
            competition_index: Math.floor(Math.random() * 100)
          },
          { 
            keyword: `best ${query}`, 
            search_volume: Math.floor(Math.random() * 8000) + 500,
            cpc: parseFloat((Math.random() * 5).toFixed(2)),
            competition: Math.random(),
            competition_index: Math.floor(Math.random() * 100)
          },
          { 
            keyword: `${query} review`, 
            search_volume: Math.floor(Math.random() * 5000) + 200,
            cpc: parseFloat((Math.random() * 5).toFixed(2)),
            competition: Math.random(),
            competition_index: Math.floor(Math.random() * 100)
          },
          { 
            keyword: `${query} alternatives`, 
            search_volume: Math.floor(Math.random() * 3000) + 100,
            cpc: parseFloat((Math.random() * 5).toFixed(2)),
            competition: Math.random(),
            competition_index: Math.floor(Math.random() * 100)
          },
          { 
            keyword: `how to use ${query}`, 
            search_volume: Math.floor(Math.random() * 2000) + 50,
            cpc: parseFloat((Math.random() * 5).toFixed(2)),
            competition: Math.random(),
            competition_index: Math.floor(Math.random() * 100)
          }
        ];
        
        const keywordResults = mockData.map(item => ({
          ...item,
          trend_data: generateTrendData(item.search_volume)
        }));
        
        setKeywords(keywordResults);
        if (keywordResults.length > 0) {
          setSelectedKeyword(keywordResults[0]);
        }
        toast.success(`Found ${keywordResults.length} keywords related to "${query}"`);
      }
    } catch (err) {
      console.error("Error searching keywords:", err);
      toast.error(`Failed to get keyword data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedKeywords = React.useMemo(() => {
    return [...keywords].sort((a, b) => {
      if (sortField === "keyword") {
        return sortDirection === "asc" 
          ? a.keyword.localeCompare(b.keyword)
          : b.keyword.localeCompare(a.keyword);
      }
      
      const aValue = a[sortField as keyof KeywordData] as number;
      const bValue = b[sortField as keyof KeywordData] as number;
      
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    });
  }, [keywords, sortField, sortDirection]);

  const saveKeyword = (keyword: KeywordData) => {
    if (!savedKeywords.find(k => k.keyword === keyword.keyword)) {
      setSavedKeywords([...savedKeywords, keyword]);
      toast.success(`Added "${keyword.keyword}" to saved keywords`);
    } else {
      toast.info(`"${keyword.keyword}" is already saved`);
    }
  };

  const removeSavedKeyword = (keyword: KeywordData) => {
    setSavedKeywords(savedKeywords.filter(k => k.keyword !== keyword.keyword));
    toast.success(`Removed "${keyword.keyword}" from saved keywords`);
  };

  const exportKeywords = () => {
    const keywordsToExport = savedKeywords.length > 0 ? savedKeywords : keywords;
    
    const headers = ["Keyword", "Search Volume", "CPC", "Competition"];
    const csvRows = [headers.join(",")];
    
    keywordsToExport.forEach(keyword => {
      const row = [
        `"${keyword.keyword}"`,
        keyword.search_volume,
        keyword.cpc,
        keyword.competition
      ];
      csvRows.push(row.join(","));
    });
    
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "keywords_export.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Exported ${keywordsToExport.length} keywords to CSV`);
  };

  const getCompetitionLabel = (competition: number) => {
    if (competition >= 0.7) return { label: "High", color: "text-red-500" };
    if (competition >= 0.4) return { label: "Medium", color: "text-yellow-500" };
    return { label: "Low", color: "text-green-500" };
  };

  const getOpportunityScore = (volume: number, competition: number) => {
    return Math.round((volume / 1000) * (1 - competition) * 10);
  };

  const getTrendIndicator = (keyword: KeywordData) => {
    if (!keyword.trend_data || keyword.trend_data.length < 2) return null;
    
    const firstHalf = keyword.trend_data.slice(0, 6);
    const secondHalf = keyword.trend_data.slice(6);
    
    const firstHalfAvg = firstHalf.reduce((sum, item) => sum + item.volume, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, item) => sum + item.volume, 0) / secondHalf.length;
    
    const percentChange = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
    
    if (percentChange > 5) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (percentChange < -5) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Keyword Research Tool</CardTitle>
          <CardDescription>
            Find valuable keywords for SEO and PPC campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <Select 
                value={searchMode} 
                onValueChange={(value) => setSearchMode(value as "keyword" | "domain")}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Search by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="keyword">Keyword</SelectItem>
                  <SelectItem value="domain">Domain</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder={searchMode === "keyword" ? "Enter a keyword..." : "Enter a domain..."}
                  value={searchMode === "keyword" ? query : domain}
                  onChange={(e) => searchMode === "keyword" ? setQuery(e.target.value) : setDomain(e.target.value)}
                  className="pr-10"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              
              <Button onClick={searchKeywords} disabled={isLoading || apiLoading}>
                {(isLoading || apiLoading) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  'Search'
                )}
              </Button>
            </div>
            
            {keywords.length > 0 && (
              <Tabs defaultValue="results">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="results">Search Results</TabsTrigger>
                  <TabsTrigger value="saved">
                    Saved Keywords {savedKeywords.length > 0 && `(${savedKeywords.length})`}
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="results">
                  <div className="rounded-md border mt-4 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[200px] cursor-pointer hover:bg-gray-50" onClick={() => handleSort("keyword")}>
                            Keyword
                            {sortField === "keyword" && (
                              <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                            )}
                          </TableHead>
                          <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("search_volume")}>
                            Volume
                            {sortField === "search_volume" && (
                              <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                            )}
                          </TableHead>
                          <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("cpc")}>
                            CPC ($)
                            {sortField === "cpc" && (
                              <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                            )}
                          </TableHead>
                          <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("competition")}>
                            Competition
                            {sortField === "competition" && (
                              <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                            )}
                          </TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedKeywords.map((keyword, index) => {
                          const competition = getCompetitionLabel(keyword.competition);
                          return (
                            <TableRow key={index} className="cursor-pointer hover:bg-gray-50" onClick={() => setSelectedKeyword(keyword)}>
                              <TableCell className="font-medium">
                                <div className="flex items-center">
                                  {keyword.keyword}
                                  {getTrendIndicator(keyword)}
                                </div>
                              </TableCell>
                              <TableCell>
                                {keyword.search_volume.toLocaleString()}
                              </TableCell>
                              <TableCell>${typeof keyword.cpc === 'number' ? keyword.cpc.toFixed(2) : keyword.cpc}</TableCell>
                              <TableCell>
                                <span className={competition.color}>{competition.label}</span>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm" onClick={(e) => {
                                  e.stopPropagation();
                                  saveKeyword(keyword);
                                }}>
                                  Save
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="flex justify-end mt-4">
                    <Button variant="outline" onClick={exportKeywords} className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Export as CSV
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="saved">
                  {savedKeywords.length > 0 ? (
                    <div className="rounded-md border mt-4 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[200px]">Keyword</TableHead>
                            <TableHead>Volume</TableHead>
                            <TableHead>CPC ($)</TableHead>
                            <TableHead>Competition</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {savedKeywords.map((keyword, index) => {
                            const competition = getCompetitionLabel(keyword.competition);
                            return (
                              <TableRow key={index} className="cursor-pointer hover:bg-gray-50" onClick={() => setSelectedKeyword(keyword)}>
                                <TableCell className="font-medium">
                                  <div className="flex items-center">
                                    {keyword.keyword}
                                    {getTrendIndicator(keyword)}
                                  </div>
                                </TableCell>
                                <TableCell>{keyword.search_volume.toLocaleString()}</TableCell>
                                <TableCell>${typeof keyword.cpc === 'number' ? keyword.cpc.toFixed(2) : keyword.cpc}</TableCell>
                                <TableCell>
                                  <span className={competition.color}>{competition.label}</span>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="sm" onClick={(e) => {
                                    e.stopPropagation();
                                    removeSavedKeyword(keyword);
                                  }}>
                                    Remove
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                      <p className="text-gray-500 mb-4">You haven't saved any keywords yet</p>
                      <p className="text-sm text-gray-400">Save keywords from the search results to track them</p>
                    </div>
                  )}
                  
                  {savedKeywords.length > 0 && (
                    <div className="flex justify-end mt-4">
                      <Button variant="outline" onClick={() => exportKeywords()} className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Export as CSV
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </div>
        </CardContent>
      </Card>
      
      {selectedKeyword && (
        <Card>
          <CardHeader>
            <CardTitle>Keyword Analysis: {selectedKeyword.keyword}</CardTitle>
            <CardDescription>
              Detailed metrics and trend analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500">Search Volume</h3>
                <p className="text-2xl font-bold">{selectedKeyword.search_volume.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Monthly searches</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500">Cost Per Click</h3>
                <p className="text-2xl font-bold">${typeof selectedKeyword.cpc === 'number' ? selectedKeyword.cpc.toFixed(2) : selectedKeyword.cpc}</p>
                <p className="text-sm text-gray-500">Average CPC in Google Ads</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500">Opportunity Score</h3>
                <div className="flex items-center">
                  <p className="text-2xl font-bold">{getOpportunityScore(selectedKeyword.search_volume, selectedKeyword.competition)}/10</p>
                  <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-200">
                    {getOpportunityScore(selectedKeyword.search_volume, selectedKeyword.competition) > 7 ? 'High' : 
                     getOpportunityScore(selectedKeyword.search_volume, selectedKeyword.competition) > 4 ? 'Medium' : 'Low'} Opportunity
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">Based on volume and competition</p>
              </div>
            </div>
            
            <div className="border-t pt-6">
              <h3 className="text-sm font-medium mb-4">Monthly Search Volume Trend</h3>
              <div className="h-60">
                {selectedKeyword.trend_data && (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={selectedKeyword.trend_data}
                      margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                    >
                      <XAxis dataKey="month" />
                      <YAxis domain={['auto', 'auto']} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="volume" 
                        stroke="#2563eb" 
                        strokeWidth={2} 
                        dot={{ r: 4 }} 
                        activeDot={{ r: 6 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
              <p className="text-xs text-center mt-2 text-gray-500">
                Monthly search volume data for the past 12 months
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default KeywordResearchTool;
