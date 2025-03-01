
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { KeywordGap, findKeywordGaps } from "@/services/keywordService";
import { Loader2 } from "lucide-react";

interface KeywordGapCardProps {
  domain: string;
  competitorDomains: string[];
  keywords: any[]; // Using any here to avoid circular dependency
  isLoading: boolean;
}

const KeywordGapCard = ({ domain, competitorDomains, keywords, isLoading }: KeywordGapCardProps) => {
  const [keywordGaps, setKeywordGaps] = useState<KeywordGap[]>([]);
  const [isLoadingGaps, setIsLoadingGaps] = useState(false);
  
  useEffect(() => {
    const fetchGaps = async () => {
      if (keywords.length > 0 && !isLoading) {
        setIsLoadingGaps(true);
        
        try {
          const gaps = await findKeywordGaps(domain, competitorDomains, keywords);
          setKeywordGaps(gaps);
        } catch (error) {
          console.error("Error fetching keyword gaps:", error);
        } finally {
          setIsLoadingGaps(false);
        }
      }
    };
    
    fetchGaps();
  }, [domain, competitorDomains, keywords, isLoading]);
  
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
        <ScrollArea className="h-[350px] pr-4">
          {isLoading || isLoadingGaps ? (
            <div className="flex items-center justify-center h-[300px]">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Analyzing keyword gaps...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {keywordGaps.length > 0 ? (
                keywordGaps.map((gap, index) => (
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
      </CardContent>
    </Card>
  );
};

export default KeywordGapCard;
