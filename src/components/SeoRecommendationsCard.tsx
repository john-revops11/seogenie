
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SeoRecommendation, generateSeoRecommendations } from "@/services/keywordService";
import { Loader2, AlertCircle, BarChart3, FileText, ChevronLeft, ChevronRight } from "lucide-react";

interface SeoRecommendationsCardProps {
  domain: string;
  keywords: any[];
  isLoading: boolean;
}

const SeoRecommendationsCard = ({ domain, keywords, isLoading }: SeoRecommendationsCardProps) => {
  const [recommendations, setRecommendations] = useState<SeoRecommendation[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [activeTab, setActiveTab] = useState("onPage");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Filter recommendations by type and paginate
  const filterRecommendations = (type: string) => {
    const filtered = recommendations.filter(rec => rec.type === type);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };
  
  const totalPages = (type: string) => {
    const count = recommendations.filter(rec => rec.type === type).length;
    return Math.ceil(count / itemsPerPage);
  };
  
  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);
  
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!isLoading && keywords && keywords.length > 0) {
        setIsLoadingRecs(true);
        
        try {
          const recs = await generateSeoRecommendations(domain, keywords);
          setRecommendations(recs);
        } catch (error) {
          console.error("Error fetching SEO recommendations:", error);
        } finally {
          setIsLoadingRecs(false);
        }
      }
    };
    
    fetchRecommendations();
  }, [domain, keywords, isLoading]);
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-amber-100 text-amber-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const getIcon = (type: string) => {
    switch (type) {
      case "onPage":
        return <FileText className="h-4 w-4" />;
      case "technical":
        return <BarChart3 className="h-4 w-4" />;
      case "content":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };
  
  const goToNextPage = () => {
    if (currentPage < totalPages(activeTab)) {
      setCurrentPage(prev => prev + 1);
    }
  };
  
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <Card className="glass-panel transition-all duration-300 hover:shadow-xl">
      <CardHeader>
        <CardTitle>SEO Recommendations</CardTitle>
        <CardDescription>Actionable steps to improve your SEO</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="onPage" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="onPage">On-Page</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>
          
          {isLoading || isLoadingRecs ? (
            <div className="flex items-center justify-center h-[315px]">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Analyzing and generating recommendations...</p>
              </div>
            </div>
          ) : (
            <>
              <TabsContent value="onPage" className="mt-4">
                <ScrollArea className="h-[315px] pr-4">
                  <div className="space-y-4">
                    {filterRecommendations("onPage").length > 0 ? (
                      filterRecommendations("onPage").map((rec, index) => (
                        <div key={index} className="p-4 rounded-lg border bg-background/50 transition-all hover:bg-background">
                          <div className="flex items-start">
                            <FileText className="h-5 w-5 mr-3 text-muted-foreground mt-0.5" />
                            <div className="space-y-1">
                              <div className="flex justify-between items-start">
                                <p className="text-sm font-medium pr-2">{rec.recommendation}</p>
                                <Badge className={getPriorityColor(rec.priority)}>
                                  {rec.priority}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center p-8">
                        <p className="text-muted-foreground">No on-page recommendations found.</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="technical" className="mt-4">
                <ScrollArea className="h-[315px] pr-4">
                  <div className="space-y-4">
                    {filterRecommendations("technical").length > 0 ? (
                      filterRecommendations("technical").map((rec, index) => (
                        <div key={index} className="p-4 rounded-lg border bg-background/50 transition-all hover:bg-background">
                          <div className="flex items-start">
                            <BarChart3 className="h-5 w-5 mr-3 text-muted-foreground mt-0.5" />
                            <div className="space-y-1">
                              <div className="flex justify-between items-start">
                                <p className="text-sm font-medium pr-2">{rec.recommendation}</p>
                                <Badge className={getPriorityColor(rec.priority)}>
                                  {rec.priority}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center p-8">
                        <p className="text-muted-foreground">No technical recommendations found.</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="content" className="mt-4">
                <ScrollArea className="h-[315px] pr-4">
                  <div className="space-y-4">
                    {filterRecommendations("content").length > 0 ? (
                      filterRecommendations("content").map((rec, index) => (
                        <div key={index} className="p-4 rounded-lg border bg-background/50 transition-all hover:bg-background">
                          <div className="flex items-start">
                            <AlertCircle className="h-5 w-5 mr-3 text-muted-foreground mt-0.5" />
                            <div className="space-y-1">
                              <div className="flex justify-between items-start">
                                <p className="text-sm font-medium pr-2">{rec.recommendation}</p>
                                <Badge className={getPriorityColor(rec.priority)}>
                                  {rec.priority}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center p-8">
                        <p className="text-muted-foreground">No content recommendations found.</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              {/* Pagination Controls */}
              {recommendations.filter(rec => rec.type === activeTab).length > itemsPerPage && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-xs text-muted-foreground">
                    Showing {filterRecommendations(activeTab).length} of {recommendations.filter(rec => rec.type === activeTab).length} recommendations
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1 || isLoading || isLoadingRecs}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-xs">
                      Page {currentPage} of {totalPages(activeTab) || 1}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages(activeTab) || totalPages(activeTab) === 0 || isLoading || isLoadingRecs}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SeoRecommendationsCard;
