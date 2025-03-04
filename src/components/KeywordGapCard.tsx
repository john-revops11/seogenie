
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { KeywordGap } from "@/services/keywordService";
import { toast } from "sonner";
import { findKeywordGaps, ApiSource } from "@/services/keywords/keywordGaps";
import { useKeywordGaps } from "@/hooks/useKeywordGaps";
import KeywordGapFilter from "./keyword-gaps/KeywordGapFilter";
import KeywordGapList from "./keyword-gaps/KeywordGapList";
import KeywordGapPagination from "./keyword-gaps/KeywordGapPagination";
import KeywordGapEmpty from "./keyword-gaps/KeywordGapEmpty";
import KeywordGapLoader from "./keyword-gaps/KeywordGapLoader";
import KeywordGapDataSourceSelector from "./keyword-gaps/KeywordGapDataSourceSelector";
import { 
  keywordGapsCache, 
  getUniqueCompetitors, 
  normalizeDomainList,
  getLocationNameByCode 
} from "./keyword-gaps/KeywordGapUtils";

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
  const [lastKeywordsLength, setLastKeywordsLength] = useState(0);
  const [apiSource, setApiSource] = useState<ApiSource>('sample');
  const [locationCode, setLocationCode] = useState<number>(keywordGapsCache.locationCode || 2840);

  // Check if keywords array has changed (new analysis or competitor added)
  useEffect(() => {
    if (keywords.length !== lastKeywordsLength && keywords.length > 0) {
      console.log(`Keywords array changed: ${lastKeywordsLength} -> ${keywords.length}`);
      setLastKeywordsLength(keywords.length);
      // If we already have keyword gaps, this means a competitor was likely added
      if (keywordGapsCache.data && keywordGapsCache.data.length > 0) {
        refreshAnalysis();
      }
    }
  }, [keywords.length, lastKeywordsLength]);

  // Detect competitor changes
  useEffect(() => {
    const normalizedCachedCompetitors = normalizeDomainList(keywordGapsCache.competitorDomains || []);
    const normalizedCurrentCompetitors = normalizeDomainList(competitorDomains);
    
    // Check if the competitor list is different
    const hasChanged = normalizedCachedCompetitors.length !== normalizedCurrentCompetitors.length ||
                      !normalizedCachedCompetitors.every(comp => normalizedCurrentCompetitors.includes(comp));
    
    if (hasChanged && keywords.length > 0 && keywordGapsCache.data?.length > 0) {
      console.log("Competitor domains have changed, refreshing analysis");
      console.log("Cached:", normalizedCachedCompetitors);
      console.log("Current:", normalizedCurrentCompetitors);
      refreshAnalysis();
    }
  }, [competitorDomains, domain, keywords]);

  useEffect(() => {
    const generateKeywordGaps = async () => {
      if (isLoading || !keywords || keywords.length === 0) return;
      
      const shouldRefreshAnalysis = checkCompetitorsChanged(domain, competitorDomains);
      
      if (
        !shouldRefreshAnalysis &&
        keywordGapsCache.data &&
        keywordGapsCache.domain === domain &&
        keywordGapsCache.keywordsLength === keywords.length &&
        keywordGapsCache.locationCode === locationCode
      ) {
        setKeywordGaps(keywordGapsCache.data);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        console.log(`Generating keyword gaps for ${domain} vs`, competitorDomains);
        console.log(`Using API source: ${apiSource} and location: ${getLocationNameByCode(locationCode)}`);
        
        const gaps = await findKeywordGaps(domain, competitorDomains, keywords, 100, apiSource, locationCode);
        
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
          keywordGapsCache.locationCode = locationCode;
          
          setKeywordGaps(gaps);
          setFilterCompetitor("all");
          setCurrentPage(1); // Reset to first page when new data is loaded
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
  }, [domain, competitorDomains, keywords, isLoading, checkCompetitorsChanged, apiSource, locationCode]);

  useEffect(() => {
    if (!keywordGaps) return;
    
    let filteredKeywords = [...keywordGaps]; // Create a copy to avoid mutations
    
    if (filterCompetitor !== "all") {
      filteredKeywords = keywordGaps.filter(kw => kw.competitor === filterCompetitor);
    }
    
    // Calculate pagination values
    const totalFilteredKeywords = filteredKeywords.length;
    const maxPage = Math.max(1, Math.ceil(totalFilteredKeywords / itemsPerPage));
    
    // Ensure current page is valid
    const validCurrentPage = Math.min(maxPage, Math.max(1, currentPage));
    if (validCurrentPage !== currentPage) {
      setCurrentPage(validCurrentPage);
    }
    
    const startIndex = (validCurrentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalFilteredKeywords);
    
    setDisplayedKeywords(filteredKeywords.slice(startIndex, endIndex));
    
    keywordGapsCache.page = validCurrentPage;
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

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleCompetitorFilterChange = (value: string) => {
    setFilterCompetitor(value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleApiSourceChange = (value: ApiSource) => {
    if (value !== apiSource) {
      setApiSource(value);
      toast.info(`Switched to ${value} data source`);
      
      // Refresh the analysis with the new API source
      if (keywords.length > 0) {
        refreshAnalysis();
      }
    }
  };

  const handleLocationChange = (newLocationCode: number) => {
    if (newLocationCode !== locationCode) {
      setLocationCode(newLocationCode);
      keywordGapsCache.locationCode = newLocationCode;
      toast.info(`Switched location to ${getLocationNameByCode(newLocationCode)}`);
      
      // Refresh the analysis with the new location
      if (keywords.length > 0) {
        refreshAnalysis();
      }
    }
  };

  const refreshAnalysis = async () => {
    keywordGapsCache.data = null;
    setKeywordGaps(null);
    setError(null);
    
    setLoading(true);
    try {
      console.log(`Refreshing keyword gaps for ${domain} vs`, competitorDomains);
      console.log(`Using API source: ${apiSource} and location: ${getLocationNameByCode(locationCode)}`);
      
      const gaps = await findKeywordGaps(domain, competitorDomains, keywords, 100, apiSource, locationCode);
      
      if (gaps && gaps.length > 0) {
        console.log(`Found ${gaps.length} keyword gaps`);
        
        keywordGapsCache.data = gaps;
        keywordGapsCache.domain = domain;
        keywordGapsCache.competitorDomains = [...competitorDomains];
        keywordGapsCache.keywordsLength = keywords.length;
        keywordGapsCache.locationCode = locationCode;
        
        setKeywordGaps(gaps);
        setFilterCompetitor("all");
        setCurrentPage(1); // Reset to first page when new data is loaded
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

  // Calculate pagination values for display
  const filteredKeywords = keywordGaps ? (
    filterCompetitor === "all" 
      ? keywordGaps
      : keywordGaps.filter(kw => kw.competitor === filterCompetitor)
  ) : [];
  
  const totalKeywords = filteredKeywords.length;
  const totalPages = Math.max(1, Math.ceil(totalKeywords / itemsPerPage));
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
          <div className="flex flex-col gap-2">
            <span>Keywords competitors rank for that you don't</span>
            <div className="flex justify-between items-center">
              <Badge variant="outline" className="text-xs">
                {competitorDomains.length} competitors analyzed
              </Badge>
              <Badge variant="outline" className="text-xs">
                {selectedKeywords.length}/10 selected
              </Badge>
            </div>
            
            <KeywordGapDataSourceSelector 
              apiSource={apiSource}
              onApiSourceChange={handleApiSourceChange}
              locationCode={locationCode}
              onLocationChange={handleLocationChange}
            />
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
            onAddMoreKeywords={() => {
              const newItemsPerPage = itemsPerPage + 15;
              setItemsPerPage(newItemsPerPage);
              keywordGapsCache.itemsPerPage = newItemsPerPage;
              toast.success("Added more keywords to the list");
            }}
          />
        </CardFooter>
      )}
    </Card>
  );
}

export default KeywordGapCard;
