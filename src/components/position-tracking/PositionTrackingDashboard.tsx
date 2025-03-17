
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RankingData } from "@/services/keywords/api/dataForSeo/positionTracking";
import VisibilityScoreCard from "./VisibilityScoreCard";
import RankingHistoryChart from "./RankingHistoryChart";
import KeywordRankingsTable from "./KeywordRankingsTable";

interface PositionTrackingDashboardProps {
  domain: string;
  rankings: RankingData[];
  isLoading: boolean;
  error: string | null;
  visibilityScore: number;
  lastUpdated: string | null;
  historyData: Record<string, RankingData[]>;
  onTrackKeywords: (keywords: string[]) => Promise<void>;
}

const PositionTrackingDashboard: React.FC<PositionTrackingDashboardProps> = ({
  domain,
  rankings,
  isLoading,
  error,
  visibilityScore,
  lastUpdated,
  historyData,
  onTrackKeywords
}) => {
  const [keywords, setKeywords] = useState<string>("");
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const keywordList = keywords
      .split(",")
      .map(k => k.trim())
      .filter(k => k !== "");
    await onTrackKeywords(keywordList);
  };

  // Get the historical data for the selected keyword
  const getKeywordHistory = (keyword: string) => {
    const history: { date: string; position: number | null }[] = [];
    
    Object.keys(historyData).sort().forEach(date => {
      const ranking = historyData[date].find(r => r.keyword === keyword);
      if (ranking) {
        history.push({
          date,
          position: ranking.position
        });
      }
    });
    
    return history;
  };

  // Calculate SERP feature counts
  const serpFeatureCounts = {
    featuredSnippet: rankings.filter(r => r.hasFeaturedSnippet).length,
    knowledgePanel: rankings.filter(r => r.hasKnowledgePanel).length,
    peopleAlsoAsk: rankings.filter(r => r.hasPaa).length,
    localPack: rankings.filter(r => r.hasLocalPack).length,
    video: rankings.filter(r => r.hasVideo).length,
    image: rankings.filter(r => r.hasImage).length
  };

  // Calculate position distribution
  const positionDistribution = {
    top3: rankings.filter(r => r.position !== null && r.position <= 3).length,
    top10: rankings.filter(r => r.position !== null && r.position > 3 && r.position <= 10).length,
    top50: rankings.filter(r => r.position !== null && r.position > 10 && r.position <= 50).length,
    top100: rankings.filter(r => r.position !== null && r.position > 50 && r.position <= 100).length,
    notRanked: rankings.filter(r => r.position === null).length
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Position Tracking</CardTitle>
          <CardDescription>
            Track your keyword rankings and SERP features over time for {domain || "your domain"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <div className="flex-1">
              <label htmlFor="track-keywords" className="text-sm font-medium mb-2 block">
                Keywords to Track (comma-separated)
              </label>
              <div className="flex gap-4">
                <Input
                  id="track-keywords"
                  placeholder="keyword1, keyword2, keyword3"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading || !keywords}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Tracking...
                    </>
                  ) : (
                    "Track Keywords"
                  )}
                </Button>
              </div>
            </div>
          </form>
          
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}
          
          {lastUpdated && (
            <div className="mt-4 text-sm text-gray-500">
              Last updated: {lastUpdated}
            </div>
          )}
        </CardContent>
      </Card>

      {rankings.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <VisibilityScoreCard score={visibilityScore} />
            
            <Card>
              <CardHeader>
                <CardTitle>Position Distribution</CardTitle>
                <CardDescription>
                  How your keywords rank across different positions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Positions 1-3:</span>
                    <Badge className="bg-green-500">{positionDistribution.top3}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Positions 4-10:</span>
                    <Badge className="bg-blue-500">{positionDistribution.top10}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Positions 11-50:</span>
                    <Badge className="bg-yellow-500">{positionDistribution.top50}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Positions 51-100:</span>
                    <Badge className="bg-orange-500">{positionDistribution.top100}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Not Ranking:</span>
                    <Badge variant="destructive">{positionDistribution.notRanked}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>SERP Features</CardTitle>
              <CardDescription>
                Special search features your site appears in
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="border rounded-md p-3">
                  <div className="text-lg font-bold">{serpFeatureCounts.featuredSnippet}</div>
                  <div className="text-sm text-gray-500">Featured Snippets</div>
                </div>
                <div className="border rounded-md p-3">
                  <div className="text-lg font-bold">{serpFeatureCounts.peopleAlsoAsk}</div>
                  <div className="text-sm text-gray-500">People Also Ask</div>
                </div>
                <div className="border rounded-md p-3">
                  <div className="text-lg font-bold">{serpFeatureCounts.knowledgePanel}</div>
                  <div className="text-sm text-gray-500">Knowledge Panels</div>
                </div>
                <div className="border rounded-md p-3">
                  <div className="text-lg font-bold">{serpFeatureCounts.localPack}</div>
                  <div className="text-sm text-gray-500">Local Packs</div>
                </div>
                <div className="border rounded-md p-3">
                  <div className="text-lg font-bold">{serpFeatureCounts.video}</div>
                  <div className="text-sm text-gray-500">Video Results</div>
                </div>
                <div className="border rounded-md p-3">
                  <div className="text-lg font-bold">{serpFeatureCounts.image}</div>
                  <div className="text-sm text-gray-500">Image Results</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Keyword Ranking History</CardTitle>
                <CardDescription>
                  Select a keyword to see its ranking history
                </CardDescription>
              </div>
              <Select 
                value={selectedKeyword || ''} 
                onValueChange={(value) => setSelectedKeyword(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select keyword" />
                </SelectTrigger>
                <SelectContent>
                  {rankings.map((ranking) => (
                    <SelectItem key={ranking.keyword} value={ranking.keyword}>
                      {ranking.keyword}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {selectedKeyword ? (
                <RankingHistoryChart 
                  data={getKeywordHistory(selectedKeyword)} 
                  keyword={selectedKeyword} 
                />
              ) : (
                <div className="text-center py-10 text-gray-500">
                  Select a keyword to view its ranking history
                </div>
              )}
            </CardContent>
          </Card>

          <KeywordRankingsTable rankings={rankings} />
        </>
      )}

      {rankings.length === 0 && !isLoading && !error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-6">
              <p className="text-gray-500">No ranking data available yet. Start tracking keywords to see your position data.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PositionTrackingDashboard;
