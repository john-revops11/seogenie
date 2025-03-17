
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, TrendingUp, TrendingDown, Globe, Clock, MousePointer } from "lucide-react";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

interface TrafficSource {
  name: string;
  value: number;
  color: string;
}

interface EngagementMetrics {
  monthlyVisits: number;
  bounceRate: number;
  pagesPerVisit: number;
  avgDuration: string; // in seconds
  monthlyChange: number; // percentage
}

interface TrafficHistoryPoint {
  month: string;
  visits: number;
}

const TrafficAnalytics: React.FC = () => {
  const [domain, setDomain] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasData, setHasData] = useState<boolean>(false);
  
  // Sample data - in a real application this would come from the DataForSEO API
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([
    { name: "Organic", value: 60, color: "#10b981" },
    { name: "Direct", value: 25, color: "#3b82f6" },
    { name: "Referral", value: 10, color: "#f59e0b" },
    { name: "Social", value: 5, color: "#8b5cf6" },
  ]);
  
  const [engagement, setEngagement] = useState<EngagementMetrics>({
    monthlyVisits: 0,
    bounceRate: 0,
    pagesPerVisit: 0,
    avgDuration: "0s",
    monthlyChange: 0,
  });
  
  const [trafficHistory, setTrafficHistory] = useState<TrafficHistoryPoint[]>([]);
  
  const fetchTrafficData = async () => {
    if (!domain) {
      toast.error("Please enter a domain");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate some random but realistic data
      const visits = Math.floor(Math.random() * 1000000) + 10000;
      const bounce = Math.floor(Math.random() * 30) + 40; // 40-70%
      const pages = (Math.random() * 4 + 1).toFixed(1); // 1-5 pages
      const duration = Math.floor(Math.random() * 180) + 60; // 60-240 seconds
      const change = Math.floor(Math.random() * 40) - 20; // -20 to +20%
      
      // Format the duration nicely
      const durationFormatted = duration >= 60 
        ? `${Math.floor(duration / 60)}m ${duration % 60}s`
        : `${duration}s`;
      
      setEngagement({
        monthlyVisits: visits,
        bounceRate: bounce,
        pagesPerVisit: parseFloat(pages),
        avgDuration: durationFormatted,
        monthlyChange: change,
      });
      
      // Generate 12 months of traffic history
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const history = months.map((month, index) => {
        // Create a trend with some seasonal variation
        const seasonalFactor = 1 + 0.3 * Math.sin((index / 11) * Math.PI * 2);
        // Add some noise
        const noise = (Math.random() * 0.2) - 0.1;
        // Calculate visits with base value, trend, seasonal component and noise
        const trendFactor = 1 + (index / 11) * (Math.random() > 0.5 ? 0.5 : -0.3);
        
        return {
          month,
          visits: Math.floor(visits * trendFactor * seasonalFactor * (1 + noise))
        };
      });
      
      setTrafficHistory(history);
      
      // Randomize the traffic sources a bit
      const organic = Math.floor(Math.random() * 30) + 40; // 40-70%
      const direct = Math.floor(Math.random() * 20) + 10; // 10-30%
      const referral = Math.floor(Math.random() * 15) + 5; // 5-20%
      const social = 100 - organic - direct - referral;
      
      setTrafficSources([
        { name: "Organic", value: organic, color: "#10b981" },
        { name: "Direct", value: direct, color: "#3b82f6" },
        { name: "Referral", value: referral, color: "#f59e0b" },
        { name: "Social", value: social, color: "#8b5cf6" },
      ]);
      
      setHasData(true);
      toast.success(`Traffic data fetched for ${domain}`);
    } catch (error) {
      console.error("Error fetching traffic data:", error);
      toast.error("Failed to fetch traffic data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Traffic Analytics</CardTitle>
          <CardDescription>
            Analyze website traffic sources and engagement metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder="Enter a domain..."
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="pr-10"
                />
                <Globe className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              
              <Button onClick={fetchTrafficData} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Analyze Traffic'
                )}
              </Button>
            </div>
            
            {hasData && (
              <div className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <Card className="bg-white shadow-sm">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Monthly Visits</p>
                          <p className="text-2xl font-bold mt-1">{formatNumber(engagement.monthlyVisits)}</p>
                        </div>
                        {engagement.monthlyChange > 0 ? (
                          <div className="flex items-center text-green-500 text-sm">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            +{engagement.monthlyChange}%
                          </div>
                        ) : (
                          <div className="flex items-center text-red-500 text-sm">
                            <TrendingDown className="h-4 w-4 mr-1" />
                            {engagement.monthlyChange}%
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white shadow-sm">
                    <CardContent className="pt-6">
                      <div className="flex items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Bounce Rate</p>
                          <p className="text-2xl font-bold mt-1">{engagement.bounceRate}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white shadow-sm">
                    <CardContent className="pt-6">
                      <div className="flex items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Pages / Visit</p>
                          <p className="text-2xl font-bold mt-1">{engagement.pagesPerVisit}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white shadow-sm">
                    <CardContent className="pt-6">
                      <div className="flex items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Avg. Duration</p>
                          <p className="text-2xl font-bold mt-1">{engagement.avgDuration}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Traffic Sources</h3>
                    <div className="h-64 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={trafficSources}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {trafficSources.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${value}%`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Traffic Trend</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={trafficHistory}
                          margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="month" />
                          <YAxis tickFormatter={formatNumber} />
                          <Tooltip formatter={(value) => formatNumber(value as number)} />
                          <Line 
                            type="monotone" 
                            dataKey="visits" 
                            stroke="#3b82f6" 
                            strokeWidth={2} 
                            dot={{ r: 3 }} 
                            activeDot={{ r: 5 }} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 mt-6 text-center">
                  Data provided by DataForSEO. Traffic numbers are estimates and may vary from actual analytics.
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrafficAnalytics;
