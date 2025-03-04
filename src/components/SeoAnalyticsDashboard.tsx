
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, TrendingUp, TrendingDown, Search, Globe, ExternalLink } from "lucide-react";

// Mock data for demonstration purposes
const keywordRankingData = [
  { date: "Jan", ranking: 45 },
  { date: "Feb", ranking: 38 },
  { date: "Mar", ranking: 42 },
  { date: "Apr", ranking: 30 },
  { date: "May", ranking: 25 },
  { date: "Jun", ranking: 18 },
  { date: "Jul", ranking: 15 },
  { date: "Aug", ranking: 12 },
];

const organicTrafficData = [
  { date: "Jan", traffic: 1200 },
  { date: "Feb", traffic: 1350 },
  { date: "Mar", traffic: 1450 },
  { date: "Apr", traffic: 1600 },
  { date: "May", traffic: 2000 },
  { date: "Jun", traffic: 2400 },
  { date: "Jul", traffic: 2800 },
  { date: "Aug", traffic: 3200 },
];

const keywordOpportunities = [
  { keyword: "pricing strategy consulting", volume: 1200, competition: "medium", potential: "high" },
  { keyword: "revenue optimization services", volume: 980, competition: "low", potential: "high" },
  { keyword: "pricing analytics software", volume: 2400, competition: "high", potential: "medium" },
  { keyword: "b2b pricing strategy", volume: 760, competition: "medium", potential: "high" },
  { keyword: "price optimization tools", volume: 1800, competition: "medium", potential: "medium" },
];

const SeoAnalyticsDashboard = () => {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [domain, setDomain] = useState("revologyanalytics.com");
  const [isLoading, setIsLoading] = useState(false);
  
  // This would be replaced with real data fetching
  useEffect(() => {
    // In a real implementation, this would fetch data from your SEO API
    console.log("SeoAnalyticsDashboard would fetch data for:", domain);
  }, [domain]);
  
  // Calculate metrics
  const averageRanking = keywordRankingData.reduce((acc, item) => acc + item.ranking, 0) / keywordRankingData.length;
  const rankingImprovement = keywordRankingData[0].ranking - keywordRankingData[keywordRankingData.length - 1].ranking;
  const trafficGrowth = Math.round(((organicTrafficData[organicTrafficData.length - 1].traffic / organicTrafficData[0].traffic) - 1) * 100);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>SEO Analytics Dashboard</CardTitle>
            <CardDescription>Track your SEO performance and discover opportunities</CardDescription>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Globe className="mr-1 h-3 w-3" />
            {domain}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="keywords">Keywords</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Keyword Rankings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-2xl font-bold">{averageRanking.toFixed(1)}</div>
                      <p className="text-xs text-muted-foreground">Average Position</p>
                    </div>
                    <div className={rankingImprovement > 0 ? "text-green-500" : "text-red-500"}>
                      {rankingImprovement > 0 ? (
                        <div className="flex items-center">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          <span>+{rankingImprovement}</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <TrendingDown className="h-4 w-4 mr-1" />
                          <span>{rankingImprovement}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={keywordRankingData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" />
                      <YAxis reversed domain={[0, 50]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="ranking" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="text-xs text-center mt-2 text-muted-foreground">
                    Rankings over the last 8 months (lower is better)
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Organic Traffic</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-2xl font-bold">{organicTrafficData[organicTrafficData.length - 1].traffic.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">Monthly Visitors</p>
                    </div>
                    <div className="text-green-500">
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span>+{trafficGrowth}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={organicTrafficData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="traffic" fill="#4ade80" />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="text-xs text-center mt-2 text-muted-foreground">
                    Organic traffic over the last 8 months
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="keywords" className="pt-4">
            <div className="rounded-md border">
              <div className="p-4">
                <h3 className="font-medium text-sm mb-3">Top Performing Keywords</h3>
                <div className="space-y-2">
                  {[
                    { keyword: "revenue optimization", position: 3, volume: 1200 },
                    { keyword: "pricing strategy", position: 5, volume: 2400 },
                    { keyword: "b2b pricing", position: 7, volume: 980 },
                    { keyword: "price intelligence", position: 9, volume: 760 },
                    { keyword: "competitor price analysis", position: 12, volume: 650 },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs">
                          {item.position}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{item.keyword}</div>
                          <div className="text-xs text-muted-foreground">{item.volume.toLocaleString()} searches/mo</div>
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="opportunities" className="pt-4">
            <div className="rounded-md border">
              <div className="p-4">
                <h3 className="font-medium text-sm mb-3">Keyword Opportunities</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  These keywords have high potential for your domain based on current rankings and competitor analysis.
                </p>
                
                <div className="space-y-3">
                  {keywordOpportunities.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-md bg-gray-50">
                      <div>
                        <div className="font-medium text-sm">{item.keyword}</div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {item.volume.toLocaleString()} monthly
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              item.competition === "low" 
                                ? "bg-green-50 text-green-700" 
                                : item.competition === "medium"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {item.competition} competition
                          </Badge>
                        </div>
                      </div>
                      <Badge 
                        className={`${
                          item.potential === "high" 
                            ? "bg-green-100 text-green-800 hover:bg-green-200" 
                            : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                        }`}
                      >
                        {item.potential} potential
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SeoAnalyticsDashboard;
