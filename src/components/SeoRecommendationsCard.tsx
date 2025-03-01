
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2 } from "lucide-react";
import { SeoRecommendation } from "@/services/keywordService";

// Create a cache to store SEO recommendations
export const recommendationsCache = {
  data: null as SeoRecommendation[] | null,
  domain: "",
  keywordsLength: 0
};

interface SeoRecommendationsCardProps {
  domain: string;
  keywords: any[];
  isLoading: boolean;
}

export function SeoRecommendationsCard({ domain, keywords, isLoading }: SeoRecommendationsCardProps) {
  const [recommendations, setRecommendations] = useState<SeoRecommendation[] | null>(null);
  const [loading, setLoading] = useState(false);

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
        // Generate SEO recommendations based on keyword data
        const seoRecommendations: SeoRecommendation[] = [
          {
            type: "technical",
            recommendation: "Improve page load speed",
            details: "Fast-loading pages rank better. Optimize images, use browser caching, and minimize JavaScript.",
            priority: "high",
            implementationDifficulty: "medium"
          },
          {
            type: "content",
            recommendation: "Add more comprehensive content around your top keywords",
            details: "Create in-depth content (2000+ words) that covers all aspects of your top-ranking keywords.",
            priority: "high",
            implementationDifficulty: "medium"
          },
          {
            type: "technical",
            recommendation: "Ensure mobile-friendliness",
            details: "Google primarily uses mobile-first indexing. Test your site on various mobile devices.",
            priority: "high",
            implementationDifficulty: "medium"
          },
          
          // For high-volume keywords
          {
            type: "keyword",
            recommendation: "Focus on high-volume, medium-difficulty keywords",
            details: `Target keywords with higher search volumes (>1000) and moderate difficulty scores (<50).`,
            priority: "high",
            implementationDifficulty: "hard"
          },
          {
            type: "content",
            recommendation: "Create a content calendar for keyword gaps",
            details: "Plan content to target the keyword gaps identified in the analysis.",
            priority: "medium",
            implementationDifficulty: "easy"
          },
          {
            type: "technical",
            recommendation: "Optimize internal linking structure",
            details: "Link between related content to distribute page authority and help users navigate.",
            priority: "medium",
            implementationDifficulty: "medium"
          },
          
          // For on-page optimization
          {
            type: "on-page",
            recommendation: "Optimize meta titles and descriptions",
            details: "Include main keywords in meta titles and write compelling meta descriptions.",
            priority: "high",
            implementationDifficulty: "easy"
          },
          {
            type: "on-page",
            recommendation: "Use schema markup",
            details: "Implement structured data to help search engines understand your content better.",
            priority: "medium", 
            implementationDifficulty: "hard"
          },
          {
            type: "backlink",
            recommendation: "Build quality backlinks",
            details: "Create shareable content and reach out to industry websites for backlinks.",
            priority: "high",
            implementationDifficulty: "hard"
          }
        ];
        
        // Sort recommendations by priority (high first)
        const sortedRecommendations = seoRecommendations.sort((a, b) => {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority as keyof typeof priorityOrder] - 
                 priorityOrder[b.priority as keyof typeof priorityOrder];
        });
        
        // Update cache
        recommendationsCache.data = sortedRecommendations;
        recommendationsCache.domain = domain;
        recommendationsCache.keywordsLength = keywords.length;
        
        setRecommendations(sortedRecommendations);
      } catch (error) {
        console.error("Error generating SEO recommendations:", error);
      } finally {
        setLoading(false);
      }
    };
    
    generateRecommendations();
  }, [domain, keywords, isLoading]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-500 border-red-200 bg-red-50";
      case "medium": return "text-amber-500 border-amber-200 bg-amber-50";
      case "low": return "text-green-500 border-green-200 bg-green-50";
      default: return "text-blue-500 border-blue-200 bg-blue-50";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
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
      case "keyword": return "🔑";
      case "on-page": return "📄";
      case "backlink": return "🔗";
      default: return "📊";
    }
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
        ) : recommendations && recommendations.length > 0 ? (
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
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
                    <Badge className={`${getDifficultyColor(rec.implementationDifficulty)}`}>
                      {rec.implementationDifficulty}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground ml-7">{rec.details}</p>
                {index < recommendations.length - 1 && <div className="pt-1 pb-1 border-b border-border/40" />}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No recommendations available. Run a keyword analysis first.
          </div>
        )}

        {recommendations && recommendations.length > 0 && (
          <div className="text-xs text-muted-foreground mt-6 text-center">
            These recommendations are tailored based on your domain and keyword analysis
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SeoRecommendationsCard;
