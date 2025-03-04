import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, ChevronLeft, ChevronRight, Plus, AlertCircle } from "lucide-react";
import { KeywordGap } from "@/services/keywordService";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { findKeywordGaps } from "@/services/keywordService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const keywordGapsCache = {
  data: null as KeywordGap[] | null,
  domain: "",
  competitorDomains: [] as string[],
  keywordsLength: 0,
  selectedKeywords: [] as string[],
  page: 1,
  itemsPerPage: 15
};

interface KeywordGapCardProps {
  domain: string;
  competitorDomains: string[];
  keywords: any[];
  isLoading: boolean;
}

const categorizeKeywordIntent = (keyword: string, difficulty: number, volume: number): 'informational' | 'navigational' | 'commercial' | 'transactional' => {
  const informationalPatterns = ['how', 'what', 'why', 'when', 'where', 'guide', 'tutorial', 'tips', 'learn', 'example', 'definition'];
  const navigationalPatterns = ['login', 'signin', 'account', 'download', 'contact', 'support', 'official'];
  const commercialPatterns = ['best', 'top', 'review', 'compare', 'vs', 'versus', 'comparison', 'alternative'];
  const transactionalPatterns = ['buy', 'price', 'cost', 'purchase', 'cheap', 'deal', 'discount', 'order', 'shop'];
  
  const keywordLower = keyword.toLowerCase();
  
  if (informationalPatterns.some(pattern => keywordLower.includes(pattern))) {
    return 'informational';
  }
  
  if (navigationalPatterns.some(pattern => keywordLower.includes(pattern))) {
    return 'navigational';
  }
  
  if (commercialPatterns.some(pattern => keywordLower.includes(pattern))) {
    return 'commercial';
  }
  
  if (transactionalPatterns.some(pattern => keywordLower.includes(pattern))) {
    return 'transactional';
  }
  
  return difficulty < 40 ? 'informational' : 'commercial';
};

const prioritizeKeywords = (keywords: KeywordGap[]): KeywordGap[] => {
  const keywordsWithIntent = keywords.map(kw => ({
    ...kw,
    intent: categorizeKeywordIntent(kw.keyword, kw.difficulty, kw.volume)
  }));
  
  const informationalKeywords = keywordsWithIntent.filter(kw => kw.intent === 'informational');
  const navigationalKeywords = keywordsWithIntent.filter(kw => kw.intent === 'navigational');
  const commercialKeywords = keywordsWithIntent.filter(kw => kw.intent === 'commercial');
  const transactionalKeywords = keywordsWithIntent.filter(kw => kw.intent === 'transactional');
  
  return [
    ...informationalKeywords,
    ...navigationalKeywords,
    ...commercialKeywords,
    ...transactionalKeywords
  ];
};

export function KeywordGapCard({ domain, competitorDomains, keywords, isLoading }: KeywordGapCardProps) {
  const [keywordGaps, setKeywordGaps] = useState<KeywordGap[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(keywordGapsCache.selectedKeywords || []);
  const [currentPage, setCurrentPage] = useState(keywordGapsCache.page || 1);
  const [itemsPerPage, setItemsPerPage] = useState(keywordGapsCache.itemsPerPage || 15);
  const [displayedKeywords, setDisplayedKeywords] = useState<KeywordGap[]>([]);
  const [filterCompetitor, setFilterCompetitor] = useState<string>("all");

  useEffect(() => {
    const generateKeywordGaps = async () => {
      if (isLoading || !keywords || keywords.length === 0) return;
      
      if (
        keywordGapsCache.data &&
        keywordGapsCache.domain === domain &&
        JSON.stringify(keywordGapsCache.competitorDomains) === JSON.stringify(competitorDomains) &&
        keywordGapsCache.keywordsLength === keywords.length
      ) {
        setKeywordGaps(keywordGapsCache.data);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        console.log(`Generating keyword gaps for ${domain} vs`, competitorDomains);
        
        const gaps = await findKeywordGaps(domain, competitorDomains, keywords);
        
        if (gaps && gaps.length > 0) {
          console.log(`Found ${gaps.length} keyword gaps`);
          
          const gapsByCompetitor = new Map<string, number>();
          gaps.forEach(gap => {
            if (gap.competitor) {
              gapsByCompetitor.set(gap.competitor, (gapsByCompetitor.get(gap.competitor) || 0) + 1);
            }
          });
          console.log("Gaps by competitor:", Object.fromEntries(gapsByCompetitor));
          
          keywordGapsCache.data = gaps;
          keywordGapsCache.domain = domain;
          keywordGapsCache.competitorDomains = [...competitorDomains];
          keywordGapsCache.keywordsLength = keywords.length;
          
          setKeywordGaps(gaps);
          toast.success(`Found ${gaps.length} keyword gaps for analysis`);
        } else {
          console.warn("No keyword gaps found or service returned empty array");
          setKeywordGaps([]);
          setError("No keyword gaps found. This could be due to missing API configuration or insufficient data.");
          toast.warning("No keyword gaps found between your domain and competitors");
        }
      } catch (error) {
        console.error("Error generating keyword gaps:", error);
        setError(`Failed to analyze keyword gaps: ${(error as Error).message}`);
        toast.error(`Failed to generate keyword gaps: ${(error as Error).message}`);
        setKeywordGaps([]);
      } finally {
        setLoading(false);
      }
    };
    
    generateKeywordGaps();
  }, [domain, competitorDomains, keywords, isLoading]);

  useEffect(() => {
    if (!keywordGaps) return;
    
    let filteredKeywords = keywordGaps;
    if (filterCompetitor !== "all") {
      filteredKeywords = keywordGaps.filter(kw => kw.competitor === filterCompetitor);
    }
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayedKeywords(filteredKeywords.slice(startIndex, endIndex));
    
    keywordGapsCache.page = currentPage;
    keywordGapsCache.itemsPerPage = itemsPerPage;
  }, [keywordGaps, currentPage, itemsPerPage, filterCompetitor]);

  const handleKeywordSelection = (keyword: string) => {
    const updatedSelection = selectedKeywords.includes(keyword)
      ? selectedKeywords.filter(k => k !== keyword)
      : [...selectedKeywords, keyword];
    
    if (updatedSelection.length > 10 && !selectedKeywords.includes(keyword)) {
      toast.error("You can select a maximum of 10 keywords");
      return;
    }
    
    setSelectedKeywords(updatedSelection);
    keywordGapsCache.selectedKeywords = updatedSelection;
    
    if (selectedKeywords.includes(keyword)) {
      toast.info(`Removed "${keyword}" from selection`);
    } else {
      toast.success(`Added "${keyword}" to selection`);
    }
  };

  const addMoreKeywords = () => {
    if (!keywordGaps) return;
    
    const newItemsPerPage = itemsPerPage + 15;
    setItemsPerPage(newItemsPerPage);
    
    keywordGapsCache.itemsPerPage = newItemsPerPage;
    
    toast.success("Added more keywords to the list");
  };

  const goToNextPage = () => {
    if (!keywordGaps) return;
    
    let filteredKeywords = keywordGaps;
    if (filterCompetitor !== "all") {
      filteredKeywords = keywordGaps.filter(kw => kw.competitor === filterCompetitor);
    }
    
    if (currentPage < Math.ceil(filteredKeywords.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleCompetitorFilterChange = (value: string) => {
    setFilterCompetitor(value);
    setCurrentPage(1);
  };

  const totalKeywords = keywordGaps ? (
    filterCompetitor === "all" 
      ? keywordGaps.length
      : keywordGaps.filter(kw => kw.competitor === filterCompetitor).length
  ) : 0;
  
  const totalPages = Math.ceil(totalKeywords / itemsPerPage);
  const startItem = totalKeywords === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(startItem + itemsPerPage - 1, totalKeywords);

  const getIntentBadgeColor = (keyword: string, difficulty: number, volume: number) => {
    const intent = categorizeKeywordIntent(keyword, difficulty, volume);
    switch (intent) {
      case 'informational':
        return "bg-blue-100 text-blue-800";
      case 'navigational':
        return "bg-purple-100 text-purple-800";
      case 'commercial':
        return "bg-amber-100 text-amber-800";
      case 'transactional':
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getUniqueCompetitors = () => {
    if (!keywordGaps) return [];
    const competitors = new Set<string>();
    keywordGaps.forEach(gap => {
      if (gap.competitor) competitors.add(gap.competitor);
    });
    return Array.from(competitors);
  };

  const refreshAnalysis = async () => {
    keywordGapsCache.data = null;
    setKeywordGaps(null);
    setError(null);
    
    setLoading(true);
    try {
      console.log(`Refreshing keyword gaps for ${domain} vs`, competitorDomains);
      
      const gaps = await findKeywordGaps(domain, competitorDomains, keywords);
      
      if (gaps && gaps.length > 0) {
        console.log(`Found ${gaps.length} keyword gaps`);
        
        keywordGapsCache.data = gaps;
        keywordGapsCache.domain = domain;
        keywordGapsCache.competitorDomains = [...competitorDomains];
        keywordGapsCache.keywordsLength = keywords.length;
        
        setKeywordGaps(gaps);
        toast.success(`Found ${gaps.length} keyword gaps for analysis`);
      } else {
        console.warn("No keyword gaps found or service returned empty array");
        setKeywordGaps([]);
        setError("No keyword gaps found. Check API configuration or try different competitors.");
        toast.warning("No keyword gaps found between your domain and competitors");
      }
    } catch (error) {
      console.error("Error refreshing keyword gaps:", error);
      setError(`Failed to analyze keyword gaps: ${(error as Error).message}`);
      toast.error(`Failed to refresh keyword gaps: ${(error as Error).message}`);
      setKeywordGaps([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Keyword Gaps 
          {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        </CardTitle>
        <CardDescription>
          <span>Keywords competitors rank for that you don't</span>
          <div className="mt-1 flex justify-between items-center">
            <Badge variant="outline" className="text-xs">
              {competitorDomains.length} competitors analyzed
            </Badge>
            <Badge variant="outline" className="text-xs">
              {selectedKeywords.length}/10 selected
            </Badge>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive" className="bg-amber-50 text-amber-800 border-amber-200">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Analysis Issue</AlertTitle>
            <AlertDescription>
              {error}
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={refreshAnalysis}
                  className="bg-white hover:bg-white/90"
                >
                  Try Again
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {loading || isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : keywordGaps && keywordGaps.length > 0 ? (
          <>
            <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center">
              <div className="w-full sm:w-auto">
                <Select value={filterCompetitor} onValueChange={handleCompetitorFilterChange}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Filter by competitor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Competitors</SelectItem>
                    {getUniqueCompetitors().map(comp => (
                      <SelectItem key={comp} value={comp}>{comp}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant="outline">
                  {totalKeywords} keyword gaps found
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshAnalysis}
                  className="text-xs"
                >
                  Refresh Analysis
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              {displayedKeywords.map((gap, index) => {
                const intent = categorizeKeywordIntent(gap.keyword, gap.difficulty, gap.volume);
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-md hover:bg-muted transition-all">
                    <div>
                      <div className="font-medium">{gap.keyword}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="text-amber-500 font-medium">Rank {gap.rank}</span> on {gap.competitor}
                        <Badge className={`text-xs ${getIntentBadgeColor(gap.keyword, gap.difficulty, gap.volume)}`}>
                          {intent.charAt(0).toUpperCase() + intent.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {gap.volume.toLocaleString()} vol
                      </Badge>
                      <Badge variant="outline" className={`text-xs ${getDifficultyColor(gap.difficulty)}`}>
                        {gap.difficulty} KD
                      </Badge>
                      <Button 
                        variant={selectedKeywords.includes(gap.keyword) ? "success" : "revology"}
                        size="sm"
                        className={`min-w-[80px] flex items-center justify-center gap-1 shadow-sm hover:translate-y-[-1px] transition-all`}
                        onClick={() => handleKeywordSelection(gap.keyword)}
                      >
                        {selectedKeywords.includes(gap.keyword) ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <Plus className="h-3.5 w-3.5" />
                            <span>Add</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {error ? (
              <div>
                <p>Unable to analyze keyword gaps. Please check API configuration in settings.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={refreshAnalysis}
                  className="mt-4"
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <p>No keyword gaps found. This could mean you're ranking well for most keywords in your niche!</p>
            )}
          </div>
        )}
      </CardContent>
      {keywordGaps && keywordGaps.length > 0 && (
        <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2 pb-4 px-6">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={goToPrevPage} 
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground">
              {startItem}-{endItem} of {totalKeywords}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={goToNextPage} 
              disabled={currentPage >= totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Select 
              value={itemsPerPage.toString()} 
              onValueChange={(value) => setItemsPerPage(Number(value))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Page size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 per page</SelectItem>
                <SelectItem value="30">30 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={addMoreKeywords}
            >
              <Plus className="mr-1 h-4 w-4" />
              Show More
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

function getDifficultyColor(difficulty: number): string {
  if (difficulty < 30) return "text-green-500";
  if (difficulty < 60) return "text-amber-500";
  return "text-red-500";
}

export default KeywordGapCard;
