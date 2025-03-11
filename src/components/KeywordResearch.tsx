import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Zap, Target, Settings, ChevronDown, ChevronRight, Plus, X, AlertCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { generateTopicSuggestions } from "@/utils/topicGenerator";
import { runRevologySeoActions } from "@/services/keywords/revologySeoStrategy";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { commonLocations, getLocationNameByCode } from "@/components/keyword-gaps/KeywordGapUtils";

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
  isExpanded?: boolean;
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
  const [apiError, setApiError] = useState<string | null>(null);
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

  const fetchKeywordsFromAPI = async () => {
    if (keywordList.length === 0) {
      toast.error("Please add at least one keyword to research");
      return;
    }

    setIsSearching(true);
    setApiError(null);
    
    try {
      toast.info(`Researching ${keywordList.length} keywords...`);
      
      // Generate mock research data
      const processedKeywords: ResearchKeyword[] = [];
      const groups: KeywordGroup[] = [];

      keywordList.forEach(seedKeyword => {
        const relatedKeywords: ResearchKeyword[] = [];
        
        // Generate 5-10 related keywords for the seed keyword
        const keywordCount = Math.floor(Math.random() * 5) + 5;
        
        for (let i = 0; i < keywordCount; i++) {
          const processedKeyword: ResearchKeyword = {
            keyword: generateRelatedKeyword(seedKeyword, i),
            volume: Math.floor(Math.random() * 10000),
            difficulty: Math.floor(Math.random() * 100),
            cpc: Math.random() * 5,
            recommendation: getRecommendationForKeyword(seedKeyword),
            relatedKeywords: getRelatedKeywordsFor(seedKeyword),
            isExpanded: false
          };
          
          relatedKeywords.push(processedKeyword);
          processedKeywords.push(processedKeyword);
        }
        
        if (relatedKeywords.length > 0) {
          groups.push({
            parentKeyword: seedKeyword,
            keywords: relatedKeywords,
            isExpanded: false
          });
        }
      });

      console.log(`Generated ${processedKeywords.length} mock keywords across ${groups.length} groups`);
      
      setKeywords(processedKeywords);
      setKeywordGroups(groups);
      
      toast.success(`Found ${processedKeywords.length} keywords related to your search`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error fetching keywords:", error);
      
      setApiError(errorMessage);
      toast.error(`Failed to fetch keywords: ${errorMessage}`);
    } finally {
      setIsSearching(false);
    }
  };

  const generateRelatedKeyword = (seedKeyword: string, index: number): string => {
    const prefixes = ["best", "top", "how to", "guide to", "cheap", "professional", "advanced", "beginner", "ultimate", "complete"];
    const suffixes = ["guide", "tutorial", "tips", "strategies", "examples", "services", "tools", "software", "solutions", "providers"];
    
    if (index % 2 === 0) {
      return `${prefixes[index % prefixes.length]} ${seedKeyword}`;
    } else {
      return `${seedKeyword} ${suffixes[index % suffixes.length]}`;
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
    onGenerateContent(keyword, relatedKeywords);
    
    toast.success(`Preparing to generate content for "${keyword}"`);
    
    console.log(`Generating content for keyword: ${keyword} with related keywords:`, relatedKeywords);
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
            <CardDescription>Discover new keyword opportunities</CardDescription>
          </div>
          
          <Button 
            variant="outline"
            size="sm"
            onClick={handleRunRevologySeoStrategy}
            disabled={!domain || competitorDomains.length === 0 || existingKeywords.length === 0 || isRunningSeoStrategy}
          >
            {isRunningSeoStrategy ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Running SEO Strategy...
              </>
            ) : (
              <>
                <Target className="h-4 w-4 mr-1" />
                Run SEO Strategy
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-1">
              <div className="text-sm font-medium">Add keywords to research</div>
              <div className="flex gap-2">
                <Input
                  value={keywordInput}
                  onChange={e => setKeywordInput(e.target.value)}
                  onKeyDown={handleKeywordInputKeyDown}
                  placeholder="Enter a keyword"
                  className="flex-1"
                />
                <Button onClick={addKeyword} size="sm" disabled={!keywordInput.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="w-full md:w-32">
              <div className="text-sm font-medium">Location</div>
              <Select
                value={locationCode.toString()}
                onValueChange={(value) => setLocationCode(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {commonLocations.map(location => (
                    <SelectItem key={location.code} value={location.code.toString()}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full md:w-auto flex items-end">
              <Button 
                onClick={fetchKeywordsFromAPI} 
                disabled={isSearching || keywordList.length === 0}
                className="w-full md:w-auto"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-1" />
                    Research Keywords
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {keywordList.map(keyword => (
              <Badge key={keyword} variant="secondary" className="px-3 py-1">
                {keyword}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => removeKeyword(keyword)}
                />
              </Badge>
            ))}
          </div>
          
          {apiError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}
          
          {keywordGroups.length > 0 && (
            <div className="mt-4">
              <div className="text-sm font-medium mb-2">Keyword Results</div>
              <div className="space-y-4">
                {keywordGroups.map(group => (
                  <div key={group.parentKeyword} className="border rounded-md overflow-hidden">
                    <div 
                      className="flex items-center justify-between bg-muted p-2 cursor-pointer"
                      onClick={() => toggleKeywordGroup(group.parentKeyword)}
                    >
                      <div className="font-medium">{group.parentKeyword}</div>
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-2">
                          {group.keywords.length} keywords
                        </Badge>
                        {group.isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                    
                    {group.isExpanded && (
                      <div className="p-2">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Keyword</TableHead>
                              <TableHead className="text-right">Volume</TableHead>
                              <TableHead className="text-right">Difficulty</TableHead>
                              <TableHead className="text-right">CPC</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {group.keywords.map(keyword => (
                              <TableRow key={keyword.keyword}>
                                <TableCell className="font-medium">{keyword.keyword}</TableCell>
                                <TableCell className="text-right">{keyword.volume.toLocaleString()}</TableCell>
                                <TableCell className="text-right">
                                  <Badge variant="outline" className={getDifficultyColor(keyword.difficulty)}>
                                    {keyword.difficulty}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">${keyword.cpc.toFixed(2)}</TableCell>
                                <TableCell className="text-right">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleGenerateContent(keyword.keyword, keyword.relatedKeywords)}
                                  >
                                    <Zap className="h-3 w-3 mr-1" />
                                    Content
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default KeywordResearch;
