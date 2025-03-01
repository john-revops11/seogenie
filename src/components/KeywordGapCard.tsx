
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// Generate mock keyword gap data
const generateKeywordGapData = (domain: string) => {
  const keywordGaps = [
    { keyword: "seo competitor analysis", volume: 1200, difficulty: 45, opportunity: "high" },
    { keyword: "keyword gap tool", volume: 880, difficulty: 38, opportunity: "high" },
    { keyword: "best keyword research method", volume: 720, difficulty: 52, opportunity: "medium" },
    { keyword: "seo tools comparison", volume: 1600, difficulty: 67, opportunity: "medium" },
    { keyword: "free keyword position checker", volume: 1900, difficulty: 28, opportunity: "high" },
    { keyword: "how to find competitor keywords", volume: 1300, difficulty: 42, opportunity: "high" },
    { keyword: "seo gap analysis template", volume: 590, difficulty: 33, opportunity: "medium" },
    { keyword: "keyword mapping strategy", volume: 650, difficulty: 47, opportunity: "medium" },
    { keyword: "find untapped keywords", volume: 420, difficulty: 29, opportunity: "high" },
    { keyword: "competitor keyword analysis", volume: 780, difficulty: 51, opportunity: "medium" },
  ];
  
  return keywordGaps;
};

interface KeywordGap {
  keyword: string;
  volume: number;
  difficulty: number;
  opportunity: string;
}

interface KeywordGapCardProps {
  domain: string;
}

const KeywordGapCard = ({ domain }: KeywordGapCardProps) => {
  const [keywordGaps, setKeywordGaps] = useState<KeywordGap[]>([]);
  
  useEffect(() => {
    const data = generateKeywordGapData(domain);
    setKeywordGaps(data);
  }, [domain]);
  
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
          <div className="space-y-4">
            {keywordGaps.map((gap, index) => (
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
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default KeywordGapCard;
