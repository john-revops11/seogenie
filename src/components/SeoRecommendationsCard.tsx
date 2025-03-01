
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2 } from "lucide-react";
import { SeoRecommendation, generateSeoRecommendations } from "@/services/keywordService";

// Create a cache to store SEO recommendations
export const recommendationsCache = {
  data: null as {
    onPage: SeoRecommendation[];
    technical: SeoRecommendation[];
    content: SeoRecommendation[];
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
    onPage: SeoRecommendation[];
    technical: SeoRecommendation[];
    content: SeoRecommendation[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "technical": return "🔧";
      case "content": return "📝";
      case "onPage": return "📄";
      default: return "📊";
    }
  };

  // Flatten recommendations for display
  const getAllRecommendations = () => {
    if (!recommendations) return [];
    const allRecs = [
      ...(recommendations.onPage || []),
      ...(recommendations.technical || []),
      ...(recommendations.content || [])
    ];
    
    // Sort by priority (high first)
    return allRecs.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority as keyof typeof priorityOrder] - 
             priorityOrder[b.priority as keyof typeof priorityOrder];
    });
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          SEO Recommendations
          {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        </CardTitle>
        <CardDescription>
          Priority actions to improve your rankings
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading || isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : recommendations ? (
          <div className="space-y-4">
            {getAllRecommendations().map((rec, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getTypeIcon(rec.type)}</span>
                    <h3 className="font-semibold">{rec.recommendation}</h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge className={`${getPriorityColor(rec.priority)}`}>
                      {rec.priority} priority
                    </Badge>
                    {rec.implementationDifficulty && (
                      <Badge className={`${getDifficultyColor(rec.implementationDifficulty)}`}>
                        {rec.implementationDifficulty}
                      </Badge>
                    )}
                  </div>
                </div>
                {rec.details && <p className="text-sm text-muted-foreground ml-7">{rec.details}</p>}
                {index < getAllRecommendations().length - 1 && <div className="pt-1 pb-1 border-b border-border/40" />}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No recommendations available. Run a keyword analysis first.
          </div>
        )}

        {recommendations && (
          <div className="text-xs text-muted-foreground mt-6 text-center">
            These AI-generated recommendations are tailored based on your domain and keyword analysis
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SeoRecommendationsCard;
