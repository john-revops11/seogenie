
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CheckCircle2, AlertCircle, FileText } from "lucide-react";
import { SeoRecommendation } from "@/services/keywordService";

// Create a cache to store recommendations
export const recommendationsCache = {
  data: null as {
    onPage: SeoRecommendation[];
    technical: SeoRecommendation[];
    content: SeoRecommendation[];
  } | null,
  domain: "",
  keywordsLength: 0
};

export default function SeoRecommendationsCard({ domain, keywords, isLoading }: {
  domain: string;
  keywords: any[];
  isLoading: boolean;
}) {
  const [recommendations, setRecommendations] = useState<{
    onPage: SeoRecommendation[];
    technical: SeoRecommendation[];
    content: SeoRecommendation[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("on-page");

  // Generate SEO recommendations based on keyword data
  useEffect(() => {
    const generateRecommendations = () => {
      if (isLoading || keywords.length === 0) return;
      
      // Check if we already have cached data for this domain
      if (
        recommendationsCache.data &&
        recommendationsCache.domain === domain &&
        recommendationsCache.keywordsLength === keywords.length
      ) {
        setRecommendations(recommendationsCache.data);
        return;
      }
      
      setLoading(true);
      
      try {
        // On-page recommendations
        const onPageRecs: SeoRecommendation[] = [
          {
            title: "Optimize Meta Titles",
            description: "Include top keywords in your page titles to improve CTR and rankings",
            impact: "high",
            action: `Ensure titles include high-volume keywords like ${getTopKeywords(keywords, 2).join(', ')}`
          },
          {
            title: "Improve Meta Descriptions",
            description: "Create compelling meta descriptions that include target keywords",
            impact: "medium",
            action: "Write unique meta descriptions for each page that include primary and secondary keywords"
          },
          {
            title: "Optimize Header Tags",
            description: "Structure your content with proper H1, H2, and H3 tags",
            impact: "medium",
            action: "Use a single H1 per page and organize subtopics with H2s and H3s"
          }
        ];
        
        // Technical recommendations
        const technicalRecs: SeoRecommendation[] = [
          {
            title: "Improve Page Speed",
            description: "Fast-loading pages improve user experience and rankings",
            impact: "high",
            action: "Optimize images, use browser caching, and minimize render-blocking resources"
          },
          {
            title: "Ensure Mobile Responsiveness",
            description: "Your site must work perfectly on all devices",
            impact: "high",
            action: "Test your site on various devices and fix any usability issues"
          },
          {
            title: "Fix Broken Links",
            description: "Broken links negatively impact user experience and crawl budget",
            impact: "medium",
            action: "Regularly audit your site for 404 errors and fix or redirect broken links"
          }
        ];
        
        // Content recommendations
        const contentRecs: SeoRecommendation[] = [
          {
            title: "Create Content for Keyword Gaps",
            description: "Target keywords your competitors rank for but you don't",
            impact: "high",
            action: "Develop comprehensive content that addresses user intent for these keywords"
          },
          {
            title: "Improve Content Depth",
            description: "Longer, more detailed content tends to rank better",
            impact: "medium",
            action: `Write comprehensive guides on topics like ${getTopKeywords(keywords, 1).join(', ')}`
          },
          {
            title: "Add Visual Content",
            description: "Images, videos, and infographics improve engagement",
            impact: "medium",
            action: "Include relevant visual content in your articles to increase time on page"
          }
        ];
        
        const allRecommendations = {
          onPage: onPageRecs,
          technical: technicalRecs,
          content: contentRecs
        };
        
        // Update cache
        recommendationsCache.data = allRecommendations;
        recommendationsCache.domain = domain;
        recommendationsCache.keywordsLength = keywords.length;
        
        setRecommendations(allRecommendations);
      } catch (error) {
        console.error("Error generating SEO recommendations:", error);
      } finally {
        setLoading(false);
      }
    };
    
    generateRecommendations();
  }, [domain, keywords, isLoading]);

  // Get top keywords by volume
  function getTopKeywords(keywords: any[], count: number): string[] {
    if (!keywords || keywords.length === 0) return ["sample keyword"];
    
    const sortedKeywords = [...keywords].sort((a, b) => (b.volume || 0) - (a.volume || 0));
    return sortedKeywords.slice(0, count).map(k => k.keyword);
  }

  // Get impact badge color
  function getImpactColor(impact: string): string {
    switch (impact.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  }

  // Get icon based on tab
  function getTabIcon(tab: string) {
    switch (tab) {
      case 'on-page': return <CheckCircle2 className="w-4 h-4" />;
      case 'technical': return <AlertCircle className="w-4 h-4" />;
      case 'content': return <FileText className="w-4 h-4" />;
      default: return null;
    }
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          SEO Recommendations
          {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        </CardTitle>
        <CardDescription>
          Actionable suggestions to improve your rankings
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading || isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : recommendations ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-3 mb-4">
              <TabsTrigger value="on-page" className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> On-Page
              </TabsTrigger>
              <TabsTrigger value="technical" className="flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> Technical
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center gap-1">
                <FileText className="w-4 h-4" /> Content
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="on-page" className="space-y-4 mt-2">
              {recommendations.onPage.map((rec, index) => (
                <RecommendationItem key={index} recommendation={rec} getImpactColor={getImpactColor} />
              ))}
            </TabsContent>
            
            <TabsContent value="technical" className="space-y-4 mt-2">
              {recommendations.technical.map((rec, index) => (
                <RecommendationItem key={index} recommendation={rec} getImpactColor={getImpactColor} />
              ))}
            </TabsContent>
            
            <TabsContent value="content" className="space-y-4 mt-2">
              {recommendations.content.map((rec, index) => (
                <RecommendationItem key={index} recommendation={rec} getImpactColor={getImpactColor} />
              ))}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No recommendations available. Complete a keyword analysis first.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Recommendation item component
function RecommendationItem({ recommendation, getImpactColor }: { 
  recommendation: SeoRecommendation, 
  getImpactColor: (impact: string) => string 
}) {
  return (
    <div className="bg-muted/50 p-4 rounded-md hover:bg-muted transition-all">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium">{recommendation.title}</h3>
        <Badge className={`ml-2 ${getImpactColor(recommendation.impact)}`}>
          {recommendation.impact.charAt(0).toUpperCase() + recommendation.impact.slice(1)} Impact
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground mb-2">{recommendation.description}</p>
      <div className="text-xs font-medium">
        <span className="text-revology">Action:</span> {recommendation.action}
      </div>
    </div>
  );
}
