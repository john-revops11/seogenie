
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { KeywordGap } from "@/services/keywordService";
import { toast } from "sonner";
import { findKeywordGaps } from "@/services/keywordService";
import { useKeywordGaps } from "@/hooks/useKeywordGaps";
import KeywordGapFilter from "./keyword-gaps/KeywordGapFilter";
import KeywordGapList from "./keyword-gaps/KeywordGapList";
import KeywordGapPagination from "./keyword-gaps/KeywordGapPagination";
import KeywordGapEmpty from "./keyword-gaps/KeywordGapEmpty";
import KeywordGapLoader from "./keyword-gaps/KeywordGapLoader";
import { keywordGapsCache, getUniqueCompetitors, haveCompetitorsChanged } from "./keyword-gaps/KeywordGapUtils";

export { keywordGapsCache };

interface KeywordGapCardProps {
  domain: string;
  competitorDomains: string[];
  keywords: any[];
  isLoading: boolean;
}

export function KeywordGapCard({ domain, competitorDomains, keywords, isLoading }: KeywordGapCardProps) {
  const [keywordGaps, setKeywordGaps] = useState<KeywordGap[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(keywordGapsCache.selectedKeywords || []);
  const [currentPage, setCurrentPage] = useState(keywordGapsCache.page || 1);
  const [itemsPerPage, setItemsPerPage] = useState(keywordGapsCache.itemsPerPage || 15);
  const [displayedKeywords, setDisplayedKeywords] = useState<KeywordGap[]>([]);
  const [filterCompetitor, setFilterCompetitor] = useState<string>("all");
  const { haveCompetitorsChanged: checkCompetitorsChanged } = useKeywordGaps();

  useEffect(() => {
    const generateKeywordGaps = async () => {
      if (isLoading || !keywords || keywords.length === 0) return;
      
      const shouldRefreshAnalysis = checkCompetitorsChanged(domain, competitorDomains);
      
      if (
        !shouldRefreshAnalysis &&
        keywordGapsCache.data &&
        keywordGapsCache.domain === domain &&
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
          setFilterCompetitor("all");
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
  }, [domain, competitorDomains, keywords, isLoading, checkCompetitorsChanged]);

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

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleCompetitorFilterChange = (value: string) => {
    setFilterCompetitor(value);
    setCurrentPage(1);
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

  const totalKeywords = keywordGaps ? (
    filterCompetitor === "all" 
      ? keywordGaps.length
      : keywordGaps.filter(kw => kw.competitor === filterCompetitor).length
  ) : 0;
  
  const totalPages = Math.ceil(totalKeywords / itemsPerPage);
  const startItem = totalKeywords === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(startItem + itemsPerPage - 1, totalKeywords);

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
        {error && !loading && !isLoading && (
          <KeywordGapEmpty error={error} onRefreshAnalysis={refreshAnalysis} />
        )}
        
        {(loading || isLoading) ? (
          <KeywordGapLoader />
        ) : keywordGaps && keywordGaps.length > 0 ? (
          <>
            <KeywordGapFilter
              filterCompetitor={filterCompetitor}
              onFilterChange={handleCompetitorFilterChange}
              uniqueCompetitors={getUniqueCompetitors(keywordGaps)}
              totalKeywords={totalKeywords}
              onRefreshAnalysis={refreshAnalysis}
            />
            
            <KeywordGapList
              keywords={displayedKeywords}
              selectedKeywords={selectedKeywords}
              onKeywordSelection={handleKeywordSelection}
            />
          </>
        ) : (
          <KeywordGapEmpty error={error} onRefreshAnalysis={refreshAnalysis} />
        )}
      </CardContent>
      {keywordGaps && keywordGaps.length > 0 && (
        <CardFooter className="flex-col sm:flex-row">
          <KeywordGapPagination
            currentPage={currentPage}
            totalPages={totalPages}
            startItem={startItem}
            endItem={endItem}
            totalKeywords={totalKeywords}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={setItemsPerPage}
            onAddMoreKeywords={addMoreKeywords}
          />
        </CardFooter>
      )}
    </Card>
  );
}

export default KeywordGapCard;
