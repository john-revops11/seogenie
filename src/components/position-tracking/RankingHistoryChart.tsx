
import React, { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RankingData } from "@/services/keywords/api/dataForSeo/positionTracking";

interface RankingHistoryChartProps {
  historyData: Record<string, RankingData[]>;
  isLoading?: boolean;
}

const RankingHistoryChart: React.FC<RankingHistoryChartProps> = ({ 
  historyData,
  isLoading = false
}) => {
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  
  // Extract available keywords from the history data
  const keywords = useMemo(() => {
    const keywordSet = new Set<string>();
    
    // Go through all dates and collect unique keywords
    Object.values(historyData).forEach(rankings => {
      rankings.forEach(ranking => {
        keywordSet.add(ranking.keyword);
      });
    });
    
    return Array.from(keywordSet);
  }, [historyData]);
  
  // If no keywords or no history data, show a message
  if (keywords.length === 0 || Object.keys(historyData).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ranking History</CardTitle>
          <CardDescription>
            Track your keyword positions over time
          </CardDescription>
        </CardHeader>
        <CardContent className="h-72 flex items-center justify-center">
          <p className="text-gray-500">No ranking history data available yet</p>
        </CardContent>
      </Card>
    );
  }
  
  // Set the first keyword as selected if none is selected yet
  if (selectedKeyword === null && keywords.length > 0) {
    setSelectedKeyword(keywords[0]);
  }
  
  // Prepare chart data for the selected keyword
  const chartData = useMemo(() => {
    if (!selectedKeyword) return [];
    
    // Format: [{ date, position }, ...]
    return Object.entries(historyData)
      .map(([date, rankings]) => {
        // Find the ranking for the selected keyword on this date
        const keywordRanking = rankings.find(r => r.keyword === selectedKeyword);
        
        return {
          date: new Date(date).toLocaleDateString(),
          // Convert null to 0 for the chart, and invert for better visualization
          // (e.g., position 1 is highest on chart, not lowest)
          position: keywordRanking?.position ? 101 - keywordRanking.position : 0
        };
      })
      // Sort by date ascending
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [historyData, selectedKeyword]);
  
  // Custom tooltip formatter that shows original position, not inverted
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const originalPosition = payload[0].value > 0 ? 101 - payload[0].value : "Not Ranking";
      return (
        <div className="bg-white p-2 border rounded shadow">
          <p className="font-bold">{label}</p>
          <p>Position: {originalPosition}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              Ranking History
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            </CardTitle>
            <CardDescription>
              Track your keyword positions over time
            </CardDescription>
          </div>
          
          <Select
            value={selectedKeyword || ''}
            onValueChange={(value) => setSelectedKeyword(value)}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Select keyword" />
            </SelectTrigger>
            <SelectContent>
              {keywords.map(keyword => (
                <SelectItem key={keyword} value={keyword}>
                  {keyword}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis 
                domain={[0, 100]} 
                ticks={[0, 25, 50, 75, 100]} 
                tickFormatter={(value) => {
                  if (value === 0) return "Not Ranking";
                  if (value === 100) return "1";
                  if (value === 75) return "25";
                  if (value === 50) return "50";
                  if (value === 25) return "75";
                  return `${value}`;
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="position" 
                stroke="#2563eb" 
                strokeWidth={2} 
                dot={{ r: 4 }} 
                activeDot={{ r: 6 }} 
                name={selectedKeyword}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RankingHistoryChart;
