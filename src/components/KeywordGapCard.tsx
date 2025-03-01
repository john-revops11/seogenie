
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { KeywordGap, findKeywordGaps } from "@/services/keywordService";
import { Loader2, BarChart2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

interface KeywordGapCardProps {
  domain: string;
  competitorDomains: string[];
  keywords: any[]; // Using any here to avoid circular dependency
  isLoading: boolean;
}

const KeywordGapCard = ({ domain, competitorDomains, keywords, isLoading }: KeywordGapCardProps) => {
  const [keywordGaps, setKeywordGaps] = useState<KeywordGap[]>([]);
  const [isLoadingGaps, setIsLoadingGaps] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompetitor, setSelectedCompetitor] = useState<string | "all">("all");
  
  const validateDomains = () => {
    if (!domain || !domain.trim()) return false;
    
    // Make sure competitorDomains is an array and has at least one valid domain
    if (!Array.isArray(competitorDomains)) return false;
    const validCompetitors = competitorDomains.filter(d => d && d.trim().length > 0);
    return validCompetitors.length > 0;
  };
  
  useEffect(() => {
    const fetchGaps = async () => {
      setError(null);
      
      // Ensure keywords is an array and has items before proceeding
      if (!Array.isArray(keywords)) {
        console.error("Keywords is not an array:", keywords);
        setKeywordGaps([]);
        return;
      }
      
      if (keywords.length > 0 && !isLoading && validateDomains()) {
        setIsLoadingGaps(true);
        
        try {
          // Request at least 10 gaps per competitor
          const gapsPerCompetitor = 12; // Aim slightly higher to ensure we get at least 10
          const targetGapCount = gapsPerCompetitor * competitorDomains.length;
          
          console.log(`Requesting ${targetGapCount} keyword gaps (${gapsPerCompetitor} per competitor)`);
          
          // Pass the number of gaps we want to the function
          const gaps = await findKeywordGaps(domain, competitorDomains, keywords, targetGapCount);
          
          if (Array.isArray(gaps) && gaps.length > 0) {
            setKeywordGaps(gaps);
            
            // Count gaps per competitor for logging
            const gapsByCompetitor = new Map<string, number>();
            gaps.forEach(gap => {
              const competitor = gap.competitor || "unknown";
              gapsByCompetitor.set(competitor, (gapsByCompetitor.get(competitor) || 0) + 1);
            });
            
            console.log("Gaps by competitor:", Object.fromEntries(gapsByCompetitor));
            
            // Check if we have enough gaps for each competitor
            const allCompetitorsHaveEnough = competitorDomains.every(comp => {
              const domainName = extractDomainName(comp);
              return (gapsByCompetitor.get(domainName) || 0) >= 10;
            });
            
            if (allCompetitorsHaveEnough) {
              toast.success(`Found ${gaps.length} keyword gaps to target`);
            } else {
              toast.info(`Found ${gaps.length} keyword gaps, but some competitors have fewer than 10 gaps`);
            }
          } else {
            setKeywordGaps([]);
            setError("No keyword gaps found. Try adjusting your analysis parameters.");
          }
        } catch (error) {
          console.error("Error fetching keyword gaps:", error);
          setError(`Failed to load keyword gaps: ${(error as Error).message}`);
          setKeywordGaps([]);
        } finally {
          setIsLoadingGaps(false);
        }
      }
    };
    
    fetchGaps();
  }, [domain, competitorDomains, keywords, isLoading]);
  
  // Extract domain name from URL string
  const extractDomainName = (url: string): string => {
    try {
      // If it's already a valid URL, extract the hostname
      if (url.startsWith('http://') || url.startsWith('https://')) {
        const urlObj = new URL(url);
        return urlObj.hostname.replace(/^www\./, '');
      }
      
      // Try with https:// prefix
      try {
        const urlObj = new URL(`https://${url}`);
        return urlObj.hostname.replace(/^www\./, '');
      } catch (e) {
        // If that fails, just return the original string
        return url.replace(/^www\./, '');
      }
    } catch (error) {
      console.warn(`Failed to extract domain from: ${url}`, error);
      return url; // Return original string if all parsing fails
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

  // Filter gaps based on selected competitor
  const filteredGaps = selectedCompetitor === "all" 
    ? keywordGaps 
    : keywordGaps.filter(gap => gap.competitor === selectedCompetitor);

  // Get unique competitor domains for the filter
  const uniqueCompetitors = ["all", ...Array.from(new Set(
    keywordGaps.map(gap => gap.competitor || "unknown")
  ))];

  // Count gaps per competitor for display
  const gapCounts = new Map<string, number>();
  keywordGaps.forEach(gap => {
    const competitor = gap.competitor || "unknown";
    gapCounts.set(competitor, (gapCounts.get(competitor) || 0) + 1);
  });

  return (
    <Card className="glass-panel transition-all duration-300 hover:shadow-xl">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-primary" />
              Keyword Gaps
            </CardTitle>
            <CardDescription>Keywords your competitors rank for that you don't</CardDescription>
          </div>
          
          {keywordGaps.length > 0 && (
            <div className="flex flex-wrap gap-2 max-w-[60%]">
              {uniqueCompetitors.map((competitor) => (
                <Badge 
                  key={competitor}
                  variant={selectedCompetitor === competitor ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCompetitor(competitor)}
                >
                  {competitor === "all" ? "All Competitors" : `${competitor} (${gapCounts.get(competitor) || 0})`}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px] pr-4">
          {isLoading || isLoadingGaps ? (
            <div className="flex items-center justify-center h-[300px]">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Analyzing keyword gaps using AI...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          ) : (
            <>
              {filteredGaps.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Keyword</TableHead>
                      <TableHead>Volume</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Opportunity</TableHead>
                      {selectedCompetitor === "all" && <TableHead>Competitor</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGaps.map((gap, index) => (
                      <TableRow key={index} className="hover:bg-background/60">
                        <TableCell className="font-medium">{gap.keyword}</TableCell>
                        <TableCell>{gap.volume.toLocaleString()}</TableCell>
                        <TableCell>{gap.difficulty}/100</TableCell>
                        <TableCell>
                          <Badge className={getOpportunityColor(gap.opportunity)}>
                            {gap.opportunity}
                          </Badge>
                        </TableCell>
                        {selectedCompetitor === "all" && (
                          <TableCell className="text-xs">
                            {gap.competitor ? extractDomainName(gap.competitor) : "unknown"}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center p-8">
                  <p className="text-muted-foreground">
                    {keywordGaps.length > 0 
                      ? "No keyword gaps found for the selected competitor. Try selecting a different competitor." 
                      : "No keyword gaps found. Try analyzing pricing strategy terms and revenue management keywords."}
                  </p>
                </div>
              )}
            </>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default KeywordGapCard;
