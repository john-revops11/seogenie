
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, PlusCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import KeywordRankingsTable from "./KeywordRankingsTable";
import VisibilityScoreCard from "./VisibilityScoreCard";
import RankingHistoryChart from "./RankingHistoryChart";
import { RankingData } from "@/services/keywords/api/dataForSeo/positionTracking";

interface PositionTrackingDashboardProps {
  domain: string;
  rankings: RankingData[];
  isLoading: boolean;
  error: string | null;
  visibilityScore: number;
  historyData: Record<string, RankingData[]>;
  lastUpdated: string | null;
  onTrackKeywords: (keywords: string[]) => Promise<void>;
}

const PositionTrackingDashboard = ({
  domain,
  rankings,
  isLoading,
  error,
  visibilityScore,
  historyData,
  lastUpdated,
  onTrackKeywords
}: PositionTrackingDashboardProps) => {
  const [newKeyword, setNewKeyword] = useState("");
  const [keywordsToAdd, setKeywordsToAdd] = useState<string[]>([]);
  
  const handleAddKeyword = () => {
    if (newKeyword.trim()) {
      setKeywordsToAdd([...keywordsToAdd, newKeyword.trim()]);
      setNewKeyword("");
    }
  };
  
  const handleRemoveKeyword = (index: number) => {
    setKeywordsToAdd(keywordsToAdd.filter((_, i) => i !== index));
  };
  
  const handleTrackKeywords = async () => {
    if (keywordsToAdd.length === 0) return;
    
    // Add existing keywords to prevent overwriting
    const existingKeywords = rankings.map(r => r.keyword);
    const allKeywords = [...existingKeywords, ...keywordsToAdd];
    
    // Call the tracking function
    await onTrackKeywords(allKeywords);
    
    // Clear the list after tracking
    setKeywordsToAdd([]);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <VisibilityScoreCard 
          score={visibilityScore} 
          lastUpdated={lastUpdated}
          isLoading={isLoading}
        />
        
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Track New Keywords</CardTitle>
            <CardDescription>
              Add keywords you want to track for {domain}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter a keyword to track"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
                  disabled={isLoading}
                />
                <Button
                  onClick={handleAddKeyword}
                  disabled={!newKeyword.trim() || isLoading}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              
              {keywordsToAdd.length > 0 && (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {keywordsToAdd.map((keyword, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {keyword}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => handleRemoveKeyword(index)}
                        >
                          <span className="text-xs">×</span>
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  
                  <Button
                    onClick={handleTrackKeywords}
                    disabled={isLoading}
                    className="mt-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Tracking...
                      </>
                    ) : (
                      "Track Keywords"
                    )}
                  </Button>
                </div>
              )}
              
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="text-sm text-muted-foreground">
                <p>Currently tracking {rankings.length} keywords for {domain}</p>
                {lastUpdated && (
                  <p>Last updated: {lastUpdated}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Display a hint about popular domains */}
      <Alert className="bg-blue-50 text-blue-800 border-blue-200">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          If you're having trouble with API errors, try using a more established domain with better search visibility. 
          Popular examples include: amazon.com, nytimes.com, walmart.com, or shopify.com
        </AlertDescription>
      </Alert>
      
      {Object.keys(historyData).length > 0 && (
        <RankingHistoryChart 
          historyData={historyData}
          isLoading={isLoading}
        />
      )}
      
      <KeywordRankingsTable rankings={rankings} />
    </div>
  );
};

export default PositionTrackingDashboard;
