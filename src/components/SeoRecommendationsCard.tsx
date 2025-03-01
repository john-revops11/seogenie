
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, AlertCircle, Lightbulb, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SeoRecommendation, generateSeoRecommendations } from "@/services/keywordService";

interface SeoRecommendationsCardProps {
  domain: string;
  keywords: any[]; // Using any here to avoid circular dependency
  isLoading: boolean;
}

const SeoRecommendationsCard = ({ domain, keywords, isLoading }: SeoRecommendationsCardProps) => {
  const [recommendations, setRecommendations] = useState<{
    onPage: SeoRecommendation[];
    technical: SeoRecommendation[];
    content: SeoRecommendation[];
  }>({
    onPage: [],
    technical: [],
    content: []
  });
  
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  
  // Pagination state
  const [currentPages, setCurrentPages] = useState({
    onPage: 1,
    technical: 1,
    content: 1
  });
  const itemsPerPage = 10;
  const [paginatedRecs, setPaginatedRecs] = useState<{
    onPage: SeoRecommendation[];
    technical: SeoRecommendation[];
    content: SeoRecommendation[];
  }>({
    onPage: [],
    technical: [],
    content: []
  });
  
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (keywords && keywords.length > 0 && !isLoading) {
        setIsLoadingRecs(true);
        
        try {
          const recs = await generateSeoRecommendations(domain, keywords);
          
          if (recs) {
            // Group recommendations by type
            const grouped = {
              onPage: recs.filter(r => r.type === 'onPage'),
              technical: recs.filter(r => r.type === 'technical'),
              content: recs.filter(r => r.type === 'content')
            };
            
            setRecommendations(grouped);
          } else {
            console.error("No recommendations returned");
          }
        } catch (error) {
          console.error("Error fetching SEO recommendations:", error);
        } finally {
          setIsLoadingRecs(false);
        }
      }
    };
    
    fetchRecommendations();
  }, [domain, keywords, isLoading]);
  
  // Handle pagination for each tab
  useEffect(() => {
    const paginateRecs = () => {
      const paginated = {
        onPage: getPaginatedItems(recommendations.onPage, currentPages.onPage),
        technical: getPaginatedItems(recommendations.technical, currentPages.technical),
        content: getPaginatedItems(recommendations.content, currentPages.content)
      };
      
      setPaginatedRecs(paginated);
    };
    
    paginateRecs();
  }, [recommendations, currentPages]);
  
  const getPaginatedItems = (items: SeoRecommendation[], page: number) => {
    if (!items) return [];
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  };
  
  const getTotalPages = (items: SeoRecommendation[]) => {
    if (!items) return 1;
    return Math.ceil(items.length / itemsPerPage);
  };
  
  const goToNextPage = (tab: keyof typeof currentPages) => {
    const totalPages = getTotalPages(recommendations[tab]);
    if (currentPages[tab] < totalPages) {
      setCurrentPages(prev => ({
        ...prev,
        [tab]: prev[tab] + 1
      }));
    }
  };
  
  const goToPreviousPage = (tab: keyof typeof currentPages) => {
    if (currentPages[tab] > 1) {
      setCurrentPages(prev => ({
        ...prev,
        [tab]: prev[tab] - 1
      }));
    }
  };
  
  const getIconForType = (type: string) => {
    switch (type) {
      case 'onPage':
        return <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />;
      case 'technical':
        return <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />;
      case 'content':
        return <Lightbulb className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />;
      default:
        return <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />;
    }
  };
  
  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return "text-red-500 font-semibold";
      case 'medium':
        return "text-amber-500";
      case 'low':
        return "text-blue-500";
      default:
        return "";
    }
  };

  const renderPagination = (tab: keyof typeof currentPages) => {
    const items = recommendations[tab];
    const totalPages = getTotalPages(items);
    const showingFrom = items && items.length > 0 ? (currentPages[tab] - 1) * itemsPerPage + 1 : 0;
    const showingTo = Math.min(currentPages[tab] * itemsPerPage, items?.length || 0);
    
    if (!items || items.length <= itemsPerPage) return null;
    
    return (
      <div className="flex items-center justify-between mt-4">
        <div className="text-xs text-muted-foreground">
          Showing {showingFrom} to {showingTo} of {items.length}
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => goToPreviousPage(tab)}
            disabled={currentPages[tab] === 1 || isLoading || isLoadingRecs}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-xs">
            Page {currentPages[tab]} of {totalPages || 1}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => goToNextPage(tab)}
            disabled={currentPages[tab] === totalPages || totalPages === 0 || isLoading || isLoadingRecs}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className="glass-panel transition-all duration-300 hover:shadow-xl">
      <CardHeader>
        <CardTitle>SEO Recommendations</CardTitle>
        <CardDescription>Actionable suggestions to improve your SEO performance</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading || isLoadingRecs ? (
          <div className="flex items-center justify-center h-[280px]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Generating SEO recommendations...</p>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="onPage" className="space-y-4">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="onPage">On-Page</TabsTrigger>
              <TabsTrigger value="technical">Technical</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
            </TabsList>
            
            <TabsContent value="onPage" className="space-y-4">
              <ScrollArea className="h-[280px] pr-4">
                <div className="space-y-3">
                  {paginatedRecs.onPage && paginatedRecs.onPage.length > 0 ? (
                    paginatedRecs.onPage.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-md transition-all hover:bg-muted/50">
                        {getIconForType(recommendation.type)}
                        <div>
                          <p className="text-sm">{recommendation.recommendation}</p>
                          <p className={`text-xs mt-1 ${getPriorityClass(recommendation.priority)}`}>
                            {recommendation.priority} priority
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-8">
                      <p className="text-muted-foreground">No on-page recommendations available.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
              {renderPagination('onPage')}
            </TabsContent>
            
            <TabsContent value="technical" className="space-y-4">
              <ScrollArea className="h-[280px] pr-4">
                <div className="space-y-3">
                  {paginatedRecs.technical && paginatedRecs.technical.length > 0 ? (
                    paginatedRecs.technical.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-md transition-all hover:bg-muted/50">
                        {getIconForType(recommendation.type)}
                        <div>
                          <p className="text-sm">{recommendation.recommendation}</p>
                          <p className={`text-xs mt-1 ${getPriorityClass(recommendation.priority)}`}>
                            {recommendation.priority} priority
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-8">
                      <p className="text-muted-foreground">No technical recommendations available.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
              {renderPagination('technical')}
            </TabsContent>
            
            <TabsContent value="content" className="space-y-4">
              <ScrollArea className="h-[280px] pr-4">
                <div className="space-y-3">
                  {paginatedRecs.content && paginatedRecs.content.length > 0 ? (
                    paginatedRecs.content.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-md transition-all hover:bg-muted/50">
                        {getIconForType(recommendation.type)}
                        <div>
                          <p className="text-sm">{recommendation.recommendation}</p>
                          <p className={`text-xs mt-1 ${getPriorityClass(recommendation.priority)}`}>
                            {recommendation.priority} priority
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-8">
                      <p className="text-muted-foreground">No content recommendations available.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
              {renderPagination('content')}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default SeoRecommendationsCard;
