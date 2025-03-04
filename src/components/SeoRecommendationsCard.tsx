
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronRight, ChevronDown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SeoRecommendation } from "@/services/keywords/types";
import { generateSeoRecommendations } from "@/services/keywordService";

// Create a cache to store SEO recommendations
export const recommendationsCache = {
  data: null as {
    technical: SeoRecommendation[];
    onPage: SeoRecommendation[];
    offPage: SeoRecommendation[];
    content: SeoRecommendation[];
    summary: SeoRecommendation[];
  } | null,
  domain: "",
  keywordsLength: 0
};

interface SeoRecommendationsCardProps {
  domain: string;
  keywords: any[];
  isLoading: boolean;
}

export function SeoRecommendationsCard({ domain, keywords, isLoading }: SeoRecommendationsCardProps) {
  const [recommendations, setRecommendations] = useState<{
    technical: SeoRecommendation[];
    onPage: SeoRecommendation[];
    offPage: SeoRecommendation[];
    content: SeoRecommendation[];
    summary: SeoRecommendation[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");
  const [expandedRecs, setExpandedRecs] = useState<Record<string, boolean>>({});

  // Generate SEO recommendations based on keyword data
  useEffect(() => {
    const fetchRecommendations = async () => {
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
        // Use AI-generated recommendations
        const aiRecommendations = await generateSeoRecommendations(domain, keywords);
        
        // Update cache
        recommendationsCache.data = aiRecommendations;
        recommendationsCache.domain = domain;
        recommendationsCache.keywordsLength = keywords.length;
        
        setRecommendations(aiRecommendations);
      } catch (error) {
        console.error("Error generating SEO recommendations:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendations();
  }, [domain, keywords, isLoading]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-500 border-red-200 bg-red-50";
      case "medium": return "text-amber-500 border-amber-200 bg-amber-50";
      case "low": return "text-green-500 border-green-200 bg-green-50";
      default: return "text-blue-500 border-blue-200 bg-blue-50";
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "easy": return "text-green-600 border-green-200 bg-green-50";
      case "medium": return "text-amber-600 border-amber-200 bg-amber-50";
      case "hard": return "text-red-600 border-red-200 bg-red-50";
      default: return "text-blue-600 border-blue-200 bg-blue-50";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "technical": return "Technical SEO";
      case "onPage": return "On-Page SEO";
      case "offPage": return "Off-Page SEO";
      case "content": return "Content Strategy";
      case "summary": return "Action Plan";
      default: return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "technical": return "🔧";
      case "onPage": return "📄";
      case "offPage": return "🔗";
      case "content": return "📝";
      case "summary": return "📊";
      default: return "📌";
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedRecs(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const renderRecommendations = (recs: SeoRecommendation[]) => {
    if (!recs || recs.length === 0) {
      return (
        <div className="text-center py-4 text-muted-foreground">
          No recommendations available for this category.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {recs.map((rec, index) => {
          // Use category or type, whichever is available
          const recType = rec.category || rec.type || "";
          const recId = `${recType}-${index}`;
          const isExpanded = expandedRecs[recId] || false;
          
          // Use either recommendation or title based on what's available
          const title = rec.recommendation || rec.title || "";
          
          return (
            <div key={recId} className="space-y-2 transition-all">
              <div 
                className="flex items-start justify-between cursor-pointer hover:bg-muted/20 p-2 rounded-md transition-all"
                onClick={() => toggleExpand(recId)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getTypeIcon(recType)}</span>
                  <h3 className="font-semibold">{title}</h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge className={`${getPriorityColor(rec.priority)}`}>
                    {rec.priority}
                  </Badge>
                  {(rec.difficulty || rec.implementationDifficulty) && (
                    <Badge className={`${getDifficultyColor(rec.difficulty || rec.implementationDifficulty)}`}>
                      {rec.difficulty || rec.implementationDifficulty}
                    </Badge>
                  )}
                  {isExpanded ? 
                    <ChevronDown className="h-4 w-4 text-muted-foreground" /> : 
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  }
                </div>
              </div>
              
              {isExpanded && (rec.details || rec.description) && (
                <div className="ml-7 text-sm text-muted-foreground bg-muted/10 p-2 rounded-md border-l-2 border-revology/30 animate-fade-in">
                  {rec.details || rec.description}
                </div>
              )}
              
              {index < recs.length - 1 && <div className="pt-1 pb-1 border-b border-border/40" />}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="animate-fade-in w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          SEO Recommendations
          {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        </CardTitle>
        <CardDescription>
          Comprehensive SEO strategy for {domain}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading || isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : recommendations ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="w-full grid grid-cols-5">
              <TabsTrigger value="summary" className="text-xs">
                {getTypeIcon("summary")} Action Plan
              </TabsTrigger>
              <TabsTrigger value="technical" className="text-xs">
                {getTypeIcon("technical")} Technical
              </TabsTrigger>
              <TabsTrigger value="onPage" className="text-xs">
                {getTypeIcon("onPage")} On-Page
              </TabsTrigger>
              <TabsTrigger value="offPage" className="text-xs">
                {getTypeIcon("offPage")} Off-Page
              </TabsTrigger>
              <TabsTrigger value="content" className="text-xs">
                {getTypeIcon("content")} Content
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary">
              {renderRecommendations(recommendations.summary)}
            </TabsContent>
            
            <TabsContent value="technical">
              {renderRecommendations(recommendations.technical)}
            </TabsContent>
            
            <TabsContent value="onPage">
              {renderRecommendations(recommendations.onPage)}
            </TabsContent>
            
            <TabsContent value="offPage">
              {renderRecommendations(recommendations.offPage)}
            </TabsContent>
            
            <TabsContent value="content">
              {renderRecommendations(recommendations.content)}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No recommendations available. Run a keyword analysis first.
          </div>
        )}

        {recommendations && (
          <div className="text-xs text-muted-foreground mt-6 text-center">
            These AI-generated recommendations are tailored based on your domain and keyword analysis. Click on any recommendation to see details.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SeoRecommendationsCard;
