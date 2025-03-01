
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, AlertCircle, Lightbulb, Loader2 } from "lucide-react";
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
  
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (keywords.length > 0 && !isLoading) {
        setIsLoadingRecs(true);
        
        try {
          const recs = await generateSeoRecommendations(domain, keywords);
          
          // Group recommendations by type
          const grouped = {
            onPage: recs.filter(r => r.type === 'onPage'),
            technical: recs.filter(r => r.type === 'technical'),
            content: recs.filter(r => r.type === 'content')
          };
          
          setRecommendations(grouped);
        } catch (error) {
          console.error("Error fetching SEO recommendations:", error);
        } finally {
          setIsLoadingRecs(false);
        }
      }
    };
    
    fetchRecommendations();
  }, [domain, keywords, isLoading]);
  
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
                  {recommendations.onPage.length > 0 ? (
                    recommendations.onPage.map((recommendation, index) => (
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
            </TabsContent>
            
            <TabsContent value="technical" className="space-y-4">
              <ScrollArea className="h-[280px] pr-4">
                <div className="space-y-3">
                  {recommendations.technical.length > 0 ? (
                    recommendations.technical.map((recommendation, index) => (
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
            </TabsContent>
            
            <TabsContent value="content" className="space-y-4">
              <ScrollArea className="h-[280px] pr-4">
                <div className="space-y-3">
                  {recommendations.content.length > 0 ? (
                    recommendations.content.map((recommendation, index) => (
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
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default SeoRecommendationsCard;
