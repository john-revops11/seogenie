import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Zap, Target, Settings, ChevronDown, ChevronRight, Plus, X } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { generateTopicSuggestions } from "@/utils/topicGenerator";
import { runRevologySeoActions } from "@/services/keywords/revologySeoStrategy";
import { getApiKey } from "@/services/keywords/api";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { commonLocations, getLocationNameByCode } from "./keyword-gaps/KeywordGapUtils";

interface KeywordResearchProps {
  domain: string;
  competitorDomains: string[];
  keywords: any[];
  onGenerateContent: (keyword: string, relatedKeywords: string[]) => void;
  onRunSeoStrategy?: () => void;
}

interface ResearchKeyword {
  keyword: string;
  volume: number;
  difficulty: number;
  cpc: number;
  recommendation: string;
  relatedKeywords: string[];
  isExpanded?: boolean;
}

interface KeywordGroup {
  parentKeyword: string;
  keywords: ResearchKeyword[];
}

const KeywordResearch = ({ 
  domain, 
  competitorDomains, 
  keywords: existingKeywords, 
  onGenerateContent,
  onRunSeoStrategy
}: KeywordResearchProps) => {
  const [keywordInput, setKeywordInput] = useState("");
  const [keywordList, setKeywordList] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [locationCode, setLocationCode] = useState(2840); // Default to US
  const [keywords, setKeywords] = useState<ResearchKeyword[]>([]);
  const [keywordGroups, setKeywordGroups] = useState<KeywordGroup[]>([]);
  const [isRunningSeoStrategy, setIsRunningSeoStrategy] = useState(false);
  const navigate = useNavigate();

  const addKeyword = () => {
    if (!keywordInput.trim()) return;
    if (keywordList.includes(keywordInput.trim())) {
      toast.error("This keyword is already in your list");
      return;
    }
    setKeywordList([...keywordList, keywordInput.trim()]);
    setKeywordInput("");
  };

  const removeKeyword = (keyword: string) => {
    setKeywordList(keywordList.filter(k => k !== keyword));
  };

  const handleKeywordInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };

  const fetchKeywordsFromDataForSEO = async () => {
    if (keywordList.length === 0) {
      toast.error("Please add at least one keyword to research");
      return;
    }

    setIsSearching(true);
    try {
      // Get DataForSEO credentials
      const credentials = getApiKey("dataforseo");
      if (!credentials) {
        toast.error("DataForSEO API credentials not configured");
        toast.info("Go to API Integrations tab to configure your DataForSEO credentials", {
          action: {
            label: "Go to API Settings",
            onClick: () => navigate("/settings")
          }
        });
        return;
      }

      // Format credentials for API call
      const encodedCredentials = btoa(credentials);
      
      // Prepare the request
      const DATAFORSEO_KEYWORDS_API_URL = "https://api.dataforseo.com/v3/keywords_data/google_ads/keywords_for_keywords/live";
      
      toast.info(`Researching ${keywordList.length} keywords...`);
      
      const requestBody = JSON.stringify([{
        location_code: locationCode,
        language_code: "en",
        keywords: keywordList
      }]);
      
      const response = await fetch(DATAFORSEO_KEYWORDS_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${encodedCredentials}`,
          "Content-Type": "application/json"
        },
        body: requestBody
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error ${response.status}: ${errorText.substring(0, 100)}`);
      }

      const data = await response.json();
      
      if (data.status_code !== 20000) {
        throw new Error(`DataForSEO API error: ${data.status_message || "Unknown error"}`);
      }
      
      if (!data.tasks || data.tasks.length === 0 || !data.tasks[0].result) {
        throw new Error("No results returned from DataForSEO API");
      }

      // Process the results
      const processedKeywords: ResearchKeyword[] = [];
      const groups: KeywordGroup[] = [];

      // For each seed keyword
      keywordList.forEach(seedKeyword => {
        const relatedKeywords: ResearchKeyword[] = [];
        
        // Find the related keywords for this seed keyword in the response
        data.tasks[0].result.forEach((result: any) => {
          if (result.keyword_data && result.keyword_data.keywords) {
            result.keyword_data.keywords.forEach((keywordData: any) => {
              // Check if this keyword is related to the seed keyword
              if (keywordData.keyword.toLowerCase().includes(seedKeyword.toLowerCase()) || 
                  seedKeyword.toLowerCase().includes(keywordData.keyword.toLowerCase())) {
                const processedKeyword: ResearchKeyword = {
                  keyword: keywordData.keyword,
                  volume: keywordData.search_volume || 0,
                  difficulty: keywordData.competition_index || 50,
                  cpc: keywordData.cpc || 0,
                  recommendation: getRecommendationForKeyword(keywordData.keyword),
                  relatedKeywords: getRelatedKeywordsFor(keywordData.keyword),
                  isExpanded: false
                };
                relatedKeywords.push(processedKeyword);
                processedKeywords.push(processedKeyword);
              }
            });
          }
        });
        
        // Add this group
        if (relatedKeywords.length > 0) {
          groups.push({
            parentKeyword: seedKeyword,
            keywords: relatedKeywords
          });
        }
      });

      setKeywords(processedKeywords);
      setKeywordGroups(groups);
      
      toast.success(`Found ${processedKeywords.length} keywords related to your search`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error fetching keywords:", error);
      
      toast.error(`Failed to fetch keywords: ${errorMessage}`);
      
      // Check for specific errors and provide helpful messages
      if (errorMessage.includes("401") || errorMessage.includes("authentication")) {
        toast.info("Check your DataForSEO API credentials in Settings", {
          action: {
            label: "Go to Settings",
            onClick: () => navigate("/settings")
          }
        });
      }
    } finally {
      setIsSearching(false);
    }
  };

  const getRecommendationForKeyword = (keyword: string): string => {
    const recommendations = [
      `Create a dedicated landing page focusing on ${keyword}`,
      `Develop a comprehensive guide about ${keyword}`,
      `Write a detailed blog post targeting ${keyword}`,
      `Add ${keyword} to your product descriptions and metadata`,
      `Create a FAQ section addressing common questions about ${keyword}`,
      `Develop comparison content featuring ${keyword}`,
      `Add testimonials mentioning ${keyword}`
    ];
    
    return recommendations[Math.floor(Math.random() * recommendations.length)];
  };
  
  const getRelatedKeywordsFor = (keyword: string): string[] => {
    const words = keyword.split(' ');
    const related = [
      `best ${keyword}`,
      `${keyword} guide`,
      `${keyword} tips`,
      `${keyword} strategies`,
      `${keyword} examples`,
      `${keyword} tools`,
      `how to ${keyword}`,
      `${keyword} for business`,
      `${keyword} benefits`,
      `${keyword} vs ${words[0]} alternatives`
    ];
    
    const count = Math.floor(Math.random() * 3) + 3;
    const shuffled = related.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const handleGenerateContent = (keyword: string, relatedKeywords: string[]) => {
    const initialTopics = generateTopicSuggestions(domain, [], null, [keyword, ...relatedKeywords]);
    
    onGenerateContent(keyword, relatedKeywords);
    
    toast.success(`Preparing to generate content for "${keyword}" - switched to Content tab`);
  };

  const handleRunRevologySeoStrategy = async () => {
    if (!domain || competitorDomains.length === 0 || existingKeywords.length === 0) {
      toast.error("Please run a domain analysis first to collect competitor data");
      return;
    }

    setIsRunningSeoStrategy(true);
    try {
      await runRevologySeoActions(domain, competitorDomains, existingKeywords);
      if (onRunSeoStrategy) {
        onRunSeoStrategy();
      }
    } catch (error) {
      console.error("Error running SEO strategy:", error);
      toast.error(`Failed to run SEO strategy: ${(error as Error).message}`);
    } finally {
      setIsRunningSeoStrategy(false);
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 30) return "bg-green-100 text-green-800";
    if (difficulty < 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const toggleKeywordGroup = (parentKeyword: string) => {
    setKeywordGroups(prevGroups => 
      prevGroups.map(group => 
        group.parentKeyword === parentKeyword 
          ? { ...group, isExpanded: !group.isExpanded } 
          : group
      )
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Keyword Research</CardTitle>
            <CardDescription>Discover relevant keywords and content opportunities</CardDescription>
          </div>
          <div className="flex gap-2">
            {domain && competitorDomains.length > 0 && existingKeywords.length > 0 && (
              <Button 
                variant="danger" 
                size="sm"
                onClick={handleRunRevologySeoStrategy}
                disabled={isRunningSeoStrategy}
                className="whitespace-nowrap"
              >
                {isRunningSeoStrategy ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    Running Strategy...
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4 mr-1" /> 
                    Run SEO Strategy for Revology
                  </>
                )}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/settings")}
              className="whitespace-nowrap"
            >
              <Settings className="w-4 h-4 mr-1" />
              Configure API
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <Input
                placeholder="Add a keyword..."
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={handleKeywordInputKeyDown}
              />
            </div>
            <Button 
              onClick={addKeyword}
              size="sm"
              variant="outline"
            >
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>
          
          {keywordList.length > 0 && (
            <div className="flex flex-wrap gap-2 p-2 border rounded-md">
              {keywordList.map((keyword, idx) => (
                <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                  {keyword}
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-4 w-4 p-0 ml-1 text-muted-foreground hover:text-foreground"
                    onClick={() => removeKeyword(keyword)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <div className="w-1/3">
              <Select value={locationCode.toString()} onValueChange={(val) => setLocationCode(parseInt(val))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  {commonLocations.map((location) => (
                    <SelectItem key={location.code} value={location.code.toString()}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={fetchKeywordsFromDataForSEO} 
              disabled={isSearching || keywordList.length === 0}
              className="flex-1 bg-revology hover:bg-revology-dark"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Researching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Research Keywords
                </>
              )}
            </Button>
          </div>
        </div>

        {keywordGroups.length > 0 && (
          <div className="space-y-4">
            {keywordGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="border rounded-md overflow-hidden">
                <div 
                  className="flex items-center justify-between p-3 bg-muted/30 cursor-pointer"
                  onClick={() => toggleKeywordGroup(group.parentKeyword)}
                >
                  <div className="font-medium flex items-center gap-2">
                    {group.isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                    {group.parentKeyword}
                    <Badge variant="outline">{group.keywords.length}</Badge>
                  </div>
                </div>
                
                {group.isExpanded && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Keyword</TableHead>
                        <TableHead className="w-[100px] text-right">Volume</TableHead>
                        <TableHead className="w-[100px] text-right">Difficulty</TableHead>
                        <TableHead className="w-[100px] text-right">CPC ($)</TableHead>
                        <TableHead className="w-[180px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.keywords.map((keyword, keywordIndex) => (
                        <TableRow key={keywordIndex} className="group">
                          <TableCell className="font-medium">
                            {keyword.keyword}
                            <div className="mt-1 flex flex-wrap gap-1">
                              {keyword.relatedKeywords.map((related, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {related}
                                </Badge>
                              ))}
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">{keyword.recommendation}</p>
                          </TableCell>
                          <TableCell className="text-right">{keyword.volume.toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <Badge className={getDifficultyColor(keyword.difficulty)}>
                              {keyword.difficulty}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">${keyword.cpc.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              onClick={() => handleGenerateContent(keyword.keyword, keyword.relatedKeywords)}
                              className="opacity-80 group-hover:opacity-100 bg-revology hover:bg-revology-dark"
                            >
                              <Zap className="w-3 h-3 mr-1" />
                              Generate Content
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KeywordResearch;
