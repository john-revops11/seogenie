
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { KeywordGap, findKeywordGaps } from "@/services/keywordService";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KeywordGapCardProps {
  domain: string;
  competitorDomains: string[];
  keywords: any[]; // Using any here to avoid circular dependency
  isLoading: boolean;
}

const KeywordGapCard = ({ domain, competitorDomains, keywords, isLoading }: KeywordGapCardProps) => {
  const [keywordGaps, setKeywordGaps] = useState<KeywordGap[]>([]);
  const [isLoadingGaps, setIsLoadingGaps] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [paginatedGaps, setPaginatedGaps] = useState<KeywordGap[]>([]);
  
  useEffect(() => {
    const fetchGaps = async () => {
      if (keywords && keywords.length > 0 && !isLoading) {
        setIsLoadingGaps(true);
        
        try {
          // Limit to top 100 keyword gaps
          const gaps = await findKeywordGaps(domain, competitorDomains, keywords.slice(0, 100));
          
          // Sort gaps by volume (descending)
          const sortedGaps = [...gaps].sort((a, b) => b.volume - a.volume);
          setKeywordGaps(sortedGaps);
        } catch (error) {
          console.error("Error fetching keyword gaps:", error);
        } finally {
          setIsLoadingGaps(false);
        }
      }
    };
    
    fetchGaps();
  }, [domain, competitorDomains, keywords, isLoading]);
  
  // Handle pagination
  useEffect(() => {
    if (keywordGaps && keywordGaps.length > 0) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setPaginatedGaps(keywordGaps.slice(startIndex, endIndex));
    } else {
      setPaginatedGaps([]);
    }
  }, [keywordGaps, currentPage]);
  
  const totalPages = Math.ceil((keywordGaps?.length || 0) / itemsPerPage);
  
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };
  
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };
  
  const getOpportunityColor = (opportunity: string) => {
    switch (opportunity) {
      case "high":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-blue-100 text-blue-800";
      case "low":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="glass-panel transition-all duration-300 hover:shadow-xl">
      <CardHeader>
        <CardTitle>Keyword Gaps</CardTitle>
        <CardDescription>Keywords your competitors rank for that you don't</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[315px] pr-4">
          {isLoading || isLoadingGaps ? (
            <div className="flex items-center justify-center h-[300px]">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Analyzing keyword gaps...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedGaps && paginatedGaps.length > 0 ? (
                paginatedGaps.map((gap, index) => (
                  <div key={index} className="p-4 rounded-lg border bg-background/50 transition-all hover:bg-background">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-sm">{gap.keyword}</h4>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-muted-foreground">
                            Vol: {gap.volume.toLocaleString()}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Diff: {gap.difficulty}/100
                          </span>
                        </div>
                      </div>
                      <Badge className={getOpportunityColor(gap.opportunity)}>
                        {gap.opportunity} opportunity
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-8">
                  <p className="text-muted-foreground">No keyword gaps found. Try analyzing more competitor domains.</p>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
        
        {/* Pagination Controls */}
        {keywordGaps && keywordGaps.length > itemsPerPage && !isLoading && !isLoadingGaps && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-xs text-muted-foreground">
              Showing {paginatedGaps.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, keywordGaps.length)} of {keywordGaps.length} gaps
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={goToPreviousPage}
                disabled={currentPage === 1 || isLoading || isLoadingGaps}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-xs">
                Page {currentPage} of {totalPages || 1}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={goToNextPage}
                disabled={currentPage === totalPages || totalPages === 0 || isLoading || isLoadingGaps}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KeywordGapCard;
