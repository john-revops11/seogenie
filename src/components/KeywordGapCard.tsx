
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { KeywordGap } from "@/services/keywordService";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Create a cache to store keyword gaps
export const keywordGapsCache = {
  data: null as KeywordGap[] | null,
  domain: "",
  competitorDomains: [] as string[],
  keywordsLength: 0,
  selectedKeywords: [] as string[],
  page: 1,
  itemsPerPage: 10
};

interface KeywordGapCardProps {
  domain: string;
  competitorDomains: string[];
  keywords: any[];
  isLoading: boolean;
}

// Helper function to categorize keyword intent
const categorizeKeywordIntent = (keyword: string, difficulty: number, volume: number): 'informational' | 'navigational' | 'commercial' | 'transactional' => {
  // Informational keywords typically contain question words or phrases like "how to", "what is", etc.
  const informationalPatterns = ['how', 'what', 'why', 'when', 'where', 'guide', 'tutorial', 'tips', 'learn', 'example', 'definition'];
  
  // Navigational keywords typically contain brand names or specific website names
  const navigationalPatterns = ['login', 'signin', 'account', 'download', 'contact', 'support', 'official'];
  
  // Commercial keywords indicate research before purchase
  const commercialPatterns = ['best', 'top', 'review', 'compare', 'vs', 'versus', 'comparison', 'alternative'];
  
  // Transactional keywords indicate purchase intent
  const transactionalPatterns = ['buy', 'price', 'cost', 'purchase', 'cheap', 'deal', 'discount', 'order', 'shop'];
  
  const keywordLower = keyword.toLowerCase();
  
  // Check for informational intent
  if (informationalPatterns.some(pattern => keywordLower.includes(pattern))) {
    return 'informational';
  }
  
  // Check for navigational intent
  if (navigationalPatterns.some(pattern => keywordLower.includes(pattern))) {
    return 'navigational';
  }
  
  // Check for commercial intent
  if (commercialPatterns.some(pattern => keywordLower.includes(pattern))) {
    return 'commercial';
  }
  
  // Check for transactional intent
  if (transactionalPatterns.some(pattern => keywordLower.includes(pattern))) {
    return 'transactional';
  }
  
  // Default to informational for low difficulty keywords and commercial for high difficulty ones
  return difficulty < 40 ? 'informational' : 'commercial';
};

// Function to prioritize keywords based on intent
const prioritizeKeywords = (keywords: KeywordGap[]): KeywordGap[] => {
  // Add intent to each keyword
  const keywordsWithIntent = keywords.map(kw => ({
    ...kw,
    intent: categorizeKeywordIntent(kw.keyword, kw.difficulty, kw.volume)
  }));
  
  // First priority: Informational keywords
  const informationalKeywords = keywordsWithIntent.filter(kw => kw.intent === 'informational');
  
  // Second priority: Navigational keywords
  const navigationalKeywords = keywordsWithIntent.filter(kw => kw.intent === 'navigational');
  
  // Third priority: Commercial keywords
  const commercialKeywords = keywordsWithIntent.filter(kw => kw.intent === 'commercial');
  
  // Fourth priority: Transactional keywords
  const transactionalKeywords = keywordsWithIntent.filter(kw => kw.intent === 'transactional');
  
  // Combine in priority order
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
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(keywordGapsCache.selectedKeywords || []);
  const [currentPage, setCurrentPage] = useState(keywordGapsCache.page || 1);
  const [itemsPerPage, setItemsPerPage] = useState(keywordGapsCache.itemsPerPage || 10);
  const [displayedKeywords, setDisplayedKeywords] = useState<KeywordGap[]>([]);
  
  // Generate keyword gaps based on keyword data
  useEffect(() => {
    const generateKeywordGaps = () => {
      if (isLoading || keywords.length === 0) return;
      
      // Check if we already have cached data for this domain and competitor combination
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
      
      try {
        // Identify keywords that competitors rank for but the main domain doesn't
        const competitorKeywordGaps: KeywordGap[] = [];
        
        // Get the domain's base names for easier comparison
        const getDomainName = (url: string) => {
          try {
            return new URL(url).hostname.replace(/^www\./, '');
          } catch (e) {
            return url;
          }
        };
        
        const mainDomainName = getDomainName(domain);
        const competitorNames = competitorDomains.map(getDomainName);
        
        // Extract ranks from keywords data
        // Process each keyword to check if competitors rank for it but main domain doesn't
        keywords.forEach(kw => {
          // Create a simplified representation of ranks
          const ranks: Record<string, number> = {};
          
          // If the keyword has a ranks property with domain rankings
          if (kw.ranks) {
            Object.keys(kw.ranks).forEach(domainKey => {
              if (kw.ranks[domainKey] && kw.ranks[domainKey] <= 20) {
                ranks[getDomainName(domainKey)] = kw.ranks[domainKey];
              }
            });
          } 
          // If the keyword uses competitorRankings format
          else if (kw.competitorRankings) {
            // Add competitor rankings
            Object.keys(kw.competitorRankings).forEach(domainKey => {
              if (kw.competitorRankings[domainKey] && kw.competitorRankings[domainKey] <= 20) {
                ranks[domainKey] = kw.competitorRankings[domainKey];
              }
            });
            
            // Add main domain ranking if it exists
            if (kw.position && kw.position <= 20) {
              ranks[mainDomainName] = kw.position;
            }
          }
          
          // Check if main domain doesn't rank but at least one competitor does
          const mainDomainRanks = ranks[mainDomainName];
          const hasCompetitorRanking = competitorNames.some(comp => ranks[comp] && ranks[comp] <= 20);
          
          if ((!mainDomainRanks || mainDomainRanks > 20) && hasCompetitorRanking) {
            // Find the best ranking competitor
            let bestCompetitor = '';
            let bestRank = 100;
            
            competitorNames.forEach(comp => {
              if (ranks[comp] && ranks[comp] < bestRank) {
                bestRank = ranks[comp];
                bestCompetitor = comp;
              }
            });
            
            if (bestCompetitor) {
              // Calculate opportunity based on difficulty
              let opportunity: 'high' | 'medium' | 'low' = 'medium';
              const difficultyValue = kw.difficulty || kw.competition_index || 0;
              
              if (difficultyValue < 30) {
                opportunity = 'high';
              } else if (difficultyValue > 60) {
                opportunity = 'low';
              }
              
              competitorKeywordGaps.push({
                keyword: kw.keyword,
                volume: kw.volume || kw.monthly_search || 0,
                difficulty: difficultyValue,
                opportunity: opportunity,
                competitor: bestCompetitor,
                rank: ranks[bestCompetitor]
              });
            }
          }
        });
        
        // Sort by volume (highest first) and limit to 20 per competitor
        const keywordsByCompetitor = new Map<string, KeywordGap[]>();
        
        // Group keywords by competitor
        competitorKeywordGaps.forEach(gap => {
          if (!keywordsByCompetitor.has(gap.competitor!)) {
            keywordsByCompetitor.set(gap.competitor!, []);
          }
          keywordsByCompetitor.get(gap.competitor!)!.push(gap);
        });
        
        // For each competitor, prioritize and limit to 20 keywords
        let allKeywords: KeywordGap[] = [];
        keywordsByCompetitor.forEach((gaps, competitor) => {
          // Prioritize gaps by intent
          const prioritizedGaps = prioritizeKeywords(gaps);
          // Take up to 20 keywords per competitor
          const topGaps = prioritizedGaps.slice(0, 20);
          allKeywords = [...allKeywords, ...topGaps];
        });
        
        // Final sorting by priority and volume
        const finalSortedGaps = allKeywords.sort((a, b) => {
          // First sort by intent priority
          const intents = {
            'informational': 1,
            'navigational': 2,
            'commercial': 3,
            'transactional': 4
          };
          
          const intentA = categorizeKeywordIntent(a.keyword, a.difficulty, a.volume);
          const intentB = categorizeKeywordIntent(b.keyword, b.difficulty, b.volume);
          
          const intentPriorityA = intents[intentA] || 5;
          const intentPriorityB = intents[intentB] || 5;
          
          if (intentPriorityA !== intentPriorityB) {
            return intentPriorityA - intentPriorityB;
          }
          
          // If same intent, sort by volume
          return b.volume - a.volume;
        });
        
        console.log("Found keyword gaps:", finalSortedGaps.length);
        
        // Update cache
        keywordGapsCache.data = finalSortedGaps;
        keywordGapsCache.domain = domain;
        keywordGapsCache.competitorDomains = [...competitorDomains];
        keywordGapsCache.keywordsLength = keywords.length;
        
        setKeywordGaps(finalSortedGaps);
      } catch (error) {
        console.error("Error generating keyword gaps:", error);
      } finally {
        setLoading(false);
      }
    };
    
    generateKeywordGaps();
  }, [domain, competitorDomains, keywords, isLoading]);

  // Effect for pagination
  useEffect(() => {
    if (!keywordGaps) return;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayedKeywords(keywordGaps.slice(startIndex, endIndex));
    
    // Update cache
    keywordGapsCache.page = currentPage;
    keywordGapsCache.itemsPerPage = itemsPerPage;
  }, [keywordGaps, currentPage, itemsPerPage]);

  // Handle keyword selection
  const handleKeywordSelection = (keyword: string) => {
    const updatedSelection = selectedKeywords.includes(keyword)
      ? selectedKeywords.filter(k => k !== keyword)
      : [...selectedKeywords, keyword];
    
    // Limit selection to 10 keywords
    if (updatedSelection.length > 10 && !selectedKeywords.includes(keyword)) {
      toast.error("You can select a maximum of 10 keywords");
      return;
    }
    
    setSelectedKeywords(updatedSelection);
    keywordGapsCache.selectedKeywords = updatedSelection;
    
    // Show toast message
    if (selectedKeywords.includes(keyword)) {
      toast.info(`Removed "${keyword}" from selection`);
    } else {
      toast.success(`Added "${keyword}" to selection`);
    }
  };
  
  // Function to load more keyword results
  const addMoreKeywords = () => {
    if (!keywordGaps) return;
    
    // Increase the items per page by 10
    const newItemsPerPage = itemsPerPage + 10;
    setItemsPerPage(newItemsPerPage);
    
    // Update displayed keywords
    const startIndex = (currentPage - 1) * newItemsPerPage;
    const endIndex = startIndex + newItemsPerPage;
    setDisplayedKeywords(keywordGaps.slice(startIndex, endIndex));
    
    // Update cache
    keywordGapsCache.itemsPerPage = newItemsPerPage;
    
    toast.success("Added more keywords to the list");
  };
  
  // Pagination handlers
  const goToNextPage = () => {
    if (keywordGaps && currentPage < Math.ceil(keywordGaps.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Calculate pagination info
  const totalKeywords = keywordGaps?.length || 0;
  const totalPages = Math.ceil(totalKeywords / itemsPerPage);
  const startItem = totalKeywords === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(startItem + itemsPerPage - 1, totalKeywords);

  // Get intent badge color
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

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Keyword Gaps 
          {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        </CardTitle>
        <CardDescription className="flex justify-between items-center">
          <span>Keywords competitors rank for that you don't</span>
          <Badge variant="outline" className="ml-2">
            {selectedKeywords.length}/10 selected
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading || isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : keywordGaps && keywordGaps.length > 0 ? (
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
                      variant={selectedKeywords.includes(gap.keyword) ? "default" : "outline"}
                      size="sm"
                      className={`h-7 w-7 p-0 ${selectedKeywords.includes(gap.keyword) ? 'bg-revology text-white' : ''}`}
                      onClick={() => handleKeywordSelection(gap.keyword)}
                    >
                      {selectedKeywords.includes(gap.keyword) ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <span className="text-xs">+</span>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No keyword gaps found. This could mean you're ranking well for most keywords in your niche!
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
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={addMoreKeywords}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-1 h-4 w-4" />
            Show More Keywords
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

// Helper function to get color based on keyword difficulty
function getDifficultyColor(difficulty: number): string {
  if (difficulty < 30) return "text-green-500";
  if (difficulty < 60) return "text-amber-500";
  return "text-red-500";
}

export default KeywordGapCard;
