
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ExternalLink, TrendingUp, Activity, Link as LinkIcon, Shield, Award } from "lucide-react";

// Mock data for demonstration purposes
const backlinkGrowthData = [
  { month: "Jan", backlinks: 420 },
  { month: "Feb", backlinks: 480 },
  { month: "Mar", backlinks: 510 },
  { month: "Apr", backlinks: 550 },
  { month: "May", backlinks: 620 },
  { month: "Jun", backlinks: 680 },
  { month: "Jul", backlinks: 750 },
  { month: "Aug", backlinks: 820 },
];

const domainAuthorityData = [
  { month: "Jan", da: 32 },
  { month: "Feb", da: 33 },
  { month: "Mar", da: 34 },
  { month: "Apr", da: 35 },
  { month: "May", da: 37 },
  { month: "Jun", da: 38 },
  { month: "Jul", da: 40 },
  { month: "Aug", da: 42 },
];

const backlinkQualityData = [
  { name: "High Quality", value: 35 },
  { name: "Medium Quality", value: 45 },
  { name: "Low Quality", value: 20 },
];

const COLORS = ["#4ade80", "#facc15", "#f87171"];

const BacklinkAnalysisCard = () => {
  const [selectedTab, setSelectedTab] = useState("overview");
  
  // Calculate current metrics
  const totalBacklinks = backlinkGrowthData[backlinkGrowthData.length - 1].backlinks;
  const backlinkGrowth = Math.round(((backlinkGrowthData[backlinkGrowthData.length - 1].backlinks / backlinkGrowthData[0].backlinks) - 1) * 100);
  const currentDA = domainAuthorityData[domainAuthorityData.length - 1].da;
  const daGrowth = currentDA - domainAuthorityData[0].da;
  
  // Top referring domains data
  const topReferringDomains = [
    { domain: "business.com", backlinks: 42, da: 85 },
    { domain: "forbes.com", backlinks: 12, da: 92 },
    { domain: "entrepreneur.com", backlinks: 8, da: 88 },
    { domain: "techcrunch.com", backlinks: 7, da: 94 },
    { domain: "inc.com", backlinks: 5, da: 91 },
  ];
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Backlink Analysis</CardTitle>
        <CardDescription>Monitor your backlink profile and domain authority</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="quality">Link Quality</TabsTrigger>
            <TabsTrigger value="referring">Referring Domains</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Backlink Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-2xl font-bold">{totalBacklinks.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">Total Backlinks</p>
                    </div>
                    <div className="text-green-500">
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span>+{backlinkGrowth}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={backlinkGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="backlinks" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Domain Authority</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-2xl font-bold">{currentDA}/100</div>
                      <p className="text-xs text-muted-foreground">Current DA Score</p>
                    </div>
                    <div className="text-green-500">
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span>+{daGrowth} points</span>
                      </div>
                    </div>
                  </div>
                  
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={domainAuthorityData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="da" stroke="#4ade80" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="quality" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Backlink Quality Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={backlinkQualityData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {backlinkQualityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
              
              <div className="md:col-span-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Quality Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-50 rounded-lg p-3 flex items-center justify-between">
                          <div>
                            <h3 className="text-xs font-medium text-green-800">Dofollow Links</h3>
                            <p className="text-xl font-bold text-green-600">68%</p>
                          </div>
                          <LinkIcon className="h-6 w-6 text-green-500" />
                        </div>
                        
                        <div className="bg-blue-50 rounded-lg p-3 flex items-center justify-between">
                          <div>
                            <h3 className="text-xs font-medium text-blue-800">Referring Domains</h3>
                            <p className="text-xl font-bold text-blue-600">145</p>
                          </div>
                          <Globe className="h-6 w-6 text-blue-500" />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm">Toxic Backlinks</span>
                            <span className="text-sm font-medium">5%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-red-500 h-2 rounded-full" style={{ width: "5%" }}></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm">Education & Gov Links</span>
                            <span className="text-sm font-medium">12%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: "12%" }}></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm">High Authority Sites (DA 70+)</span>
                            <span className="text-sm font-medium">23%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: "23%" }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="referring" className="pt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Top Referring Domains</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topReferringDomains.map((domain, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center 
                          ${index === 0 ? "bg-amber-100 text-amber-700" : 
                            index === 1 ? "bg-gray-200 text-gray-700" : 
                            index === 2 ? "bg-amber-900 text-amber-50" : "bg-blue-100 text-blue-700"}`}>
                          {index < 3 ? <Award className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                        </div>
                        <div className="ml-3">
                          <div className="font-medium">{domain.domain}</div>
                          <div className="text-xs text-muted-foreground">{domain.backlinks} backlinks</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Badge variant="secondary" className="mr-2">
                          DA {domain.da}
                        </Badge>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-700">145</div>
                    <div className="text-xs text-blue-600">Total Referring Domains</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-700">24</div>
                    <div className="text-xs text-green-600">New This Month</div>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <div className="text-xl font-bold text-amber-700">5.7</div>
                    <div className="text-xs text-amber-600">Links per Domain</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Using these for typechecking
const Globe = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

export default BacklinkAnalysisCard;
