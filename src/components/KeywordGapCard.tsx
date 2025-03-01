
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { KeywordGap } from "@/services/keywordService";

// Create a cache to store keyword gaps
export const keywordGapsCache = {
  data: null as KeywordGap[] | null,
  domain: "",
  competitorDomains: [] as string[],
  keywordsLength: 0
};

interface KeywordGapCardProps {
  domain: string;
  competitorDomains: string[];
  keywords: any[];
  isLoading: boolean;
}

export function KeywordGapCard({ domain, competitorDomains, keywords, isLoading }: KeywordGapCardProps) {
  const [keywordGaps, setKeywordGaps] = useState<KeywordGap[] | null>(null);
  const [loading, setLoading] = useState(false);

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
        
        // Sort by volume (highest first)
        const sortedGaps = competitorKeywordGaps.sort((a, b) => b.volume - a.volume);
        
        // Take top 10 gaps
        const topGaps = sortedGaps.slice(0, 10);
        
        console.log("Found keyword gaps:", topGaps.length);
        
        // Update cache
        keywordGapsCache.data = topGaps;
        keywordGapsCache.domain = domain;
        keywordGapsCache.competitorDomains = [...competitorDomains];
        keywordGapsCache.keywordsLength = keywords.length;
        
        setKeywordGaps(topGaps);
      } catch (error) {
        console.error("Error generating keyword gaps:", error);
      } finally {
        setLoading(false);
      }
    };
    
    generateKeywordGaps();
  }, [domain, competitorDomains, keywords, isLoading]);

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Keyword Gaps 
          {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        </CardTitle>
        <CardDescription>
          Keywords competitors rank for that you don't
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading || isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : keywordGaps && keywordGaps.length > 0 ? (
          <div className="space-y-4">
            {keywordGaps.map((gap, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-md hover:bg-muted transition-all">
                <div>
                  <div className="font-medium">{gap.keyword}</div>
                  <div className="text-xs text-muted-foreground">
                    <span className="text-amber-500 font-medium">Rank {gap.rank}</span> on {gap.competitor}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {gap.volume.toLocaleString()} vol
                  </Badge>
                  <Badge variant="outline" className={`text-xs ${getDifficultyColor(gap.difficulty)}`}>
                    {gap.difficulty} KD
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No keyword gaps found. This could mean you're ranking well for most keywords in your niche!
          </div>
        )}
      </CardContent>
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
