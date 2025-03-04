
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Zap, Target, Settings } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { generateTopicSuggestions } from "@/utils/topicGenerator";
import { runRevologySeoActions } from "@/services/keywords/revologySeoStrategy";
import { fetchRelatedKeywords } from "@/services/keywords/api";
import { useNavigate } from "react-router-dom";

interface KeywordResearchProps {
  domain: string;
  competitorDomains: string[];
  keywords: any[];
  onGenerateContent: (keyword: string, relatedKeywords: string[]) => void;
  onRunSeoStrategy?: () => void;
}

interface ResearchKeyword {
  keyword: string;
  volume: number;
  difficulty: number;
  cpc: number;
  recommendation: string;
  relatedKeywords: string[];
}

const KeywordResearch = ({ 
  domain, 
  competitorDomains, 
  keywords: existingKeywords, 
  onGenerateContent,
  onRunSeoStrategy
}: KeywordResearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [keywords, setKeywords] = useState<ResearchKeyword[]>([]);
  const [isRunningSeoStrategy, setIsRunningSeoStrategy] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error("Please enter a keyword to research");
      return;
    }

    setIsSearching(true);
    try {
      toast.info("Fetching keyword data from DataForSEO API...");
      console.log("Calling DataForSEO API with keyword:", searchTerm);
      const dataForSeoResults = await fetchRelatedKeywords([searchTerm]);
      
      if (dataForSeoResults && dataForSeoResults.length > 0) {
        const formattedKeywords: ResearchKeyword[] = dataForSeoResults.map(kw => ({
          keyword: kw.keyword,
          volume: kw.monthly_search || 0,
          difficulty: kw.competition_index || 50,
          cpc: kw.cpc || 0,
          recommendation: getRecommendationForKeyword(kw.keyword),
          relatedKeywords: getRelatedKeywordsFor(kw.keyword)
        }));
        
        setKeywords(formattedKeywords);
        toast.success(`Found ${formattedKeywords.length} keywords from DataForSEO API`);
      } else {
        toast.error("No keywords found. Please try a different search term or check your DataForSEO API configuration.");
      }
    } catch (error) {
      console.error("Error with DataForSEO API:", error);
      
      // Provide specific error guidance based on the error message
      const errorMessage = (error as Error).message || "Unknown error";
      
      if (errorMessage.includes("401") || errorMessage.includes("authentication") || errorMessage.includes("Authorization")) {
        toast.error("DataForSEO API authentication failed. Please check your API credentials.");
        toast.info("Go to API Integrations tab to configure your DataForSEO credentials in format: username:password", {
          action: {
            label: "Go to API Settings",
            onClick: () => navigate("/settings")
          }
        });
      } else if (errorMessage.includes("429") || errorMessage.includes("rate limit")) {
        toast.error("DataForSEO API rate limit exceeded. Please wait a moment and try again.");
      } else if (errorMessage.includes("No valid keywords")) {
        toast.error("No valid keywords found. Please try a different search term.");
      } else if (errorMessage.includes("not configured")) {
        toast.error("DataForSEO API is not configured correctly.");
        toast.info("Go to API Integrations tab to set up your DataForSEO credentials", {
          action: {
            label: "Configure API",
            onClick: () => navigate("/settings")
          }
        });
      } else {
        toast.error(`DataForSEO API error: ${errorMessage}. Please check your API configuration.`);
      }
      
      // Show recovery steps
      toast.info(
        "To fix this issue: 1) Check your DataForSEO API credentials in API Integrations, " +
        "2) Make sure to use the format username:password, " +
        "3) Verify your account has sufficient credits"
      );
    } finally {
      setIsSearching(false);
    }
  };

  const getRecommendationForKeyword = (keyword: string): string => {
    const recommendations = [
      `Create a dedicated landing page focusing on ${keyword}`,
      `Develop a comprehensive guide about ${keyword}`,
      `Write a detailed blog post targeting ${keyword}`,
      `Add ${keyword} to your product descriptions and metadata`,
      `Create a FAQ section addressing common questions about ${keyword}`,
      `Develop comparison content featuring ${keyword}`,
      `Add testimonials mentioning ${keyword}`
    ];
    
    return recommendations[Math.floor(Math.random() * recommendations.length)];
  };
  
  const getRelatedKeywordsFor = (keyword: string): string[] => {
    const words = keyword.split(' ');
    const related = [
      `best ${keyword}`,
      `${keyword} guide`,
      `${keyword} tips`,
      `${keyword} strategies`,
      `${keyword} examples`,
      `${keyword} tools`,
      `how to ${keyword}`,
      `${keyword} for business`,
      `${keyword} benefits`,
      `${keyword} vs ${words[0]} alternatives`
    ];
    
    const count = Math.floor(Math.random() * 3) + 3;
    const shuffled = related.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const handleGenerateContent = (keyword: string, relatedKeywords: string[]) => {
    const initialTopics = generateTopicSuggestions(domain, [], null, [keyword, ...relatedKeywords]);
    
    onGenerateContent(keyword, relatedKeywords);
    
    toast.success(`Preparing to generate content for "${keyword}" - switched to Content tab`);
  };

  const handleRunRevologySeoStrategy = async () => {
    if (!domain || competitorDomains.length === 0 || existingKeywords.length === 0) {
      toast.error("Please run a domain analysis first to collect competitor data");
      return;
    }

    setIsRunningSeoStrategy(true);
    try {
      await runRevologySeoActions(domain, competitorDomains, existingKeywords);
      if (onRunSeoStrategy) {
        onRunSeoStrategy();
      }
    } catch (error) {
      console.error("Error running SEO strategy:", error);
      toast.error(`Failed to run SEO strategy: ${(error as Error).message}`);
    } finally {
      setIsRunningSeoStrategy(false);
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 30) return "bg-green-100 text-green-800";
    if (difficulty < 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Keyword Research</CardTitle>
            <CardDescription>Discover relevant keywords and content opportunities</CardDescription>
          </div>
          <div className="flex gap-2">
            {domain && competitorDomains.length > 0 && existingKeywords.length > 0 && (
              <Button 
                variant="danger" 
                size="sm"
                onClick={handleRunRevologySeoStrategy}
                disabled={isRunningSeoStrategy}
                className="whitespace-nowrap"
              >
                {isRunningSeoStrategy ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    Running Strategy...
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4 mr-1" /> 
                    Run SEO Strategy for Revology
                  </>
                )}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/settings")}
              className="whitespace-nowrap"
            >
              <Settings className="w-4 h-4 mr-1" />
              Configure API
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Enter a topic or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button 
            onClick={handleSearch} 
            disabled={isSearching}
            className="bg-revology hover:bg-revology-dark"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Researching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Research
              </>
            )}
          </Button>
        </div>

        {keywords.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Keyword</TableHead>
                <TableHead className="w-[100px] text-right">Volume</TableHead>
                <TableHead className="w-[100px] text-right">Difficulty</TableHead>
                <TableHead className="w-[100px] text-right">CPC ($)</TableHead>
                <TableHead className="w-[180px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keywords.map((keyword, index) => (
                <TableRow key={index} className="group">
                  <TableCell className="font-medium">
                    {keyword.keyword}
                    <div className="mt-1 flex flex-wrap gap-1">
                      {keyword.relatedKeywords.map((related, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {related}
                        </Badge>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{keyword.recommendation}</p>
                  </TableCell>
                  <TableCell className="text-right">{keyword.volume.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Badge className={getDifficultyColor(keyword.difficulty)}>
                      {keyword.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">${keyword.cpc.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => handleGenerateContent(keyword.keyword, keyword.relatedKeywords)}
                      className="opacity-80 group-hover:opacity-100 bg-revology hover:bg-revology-dark"
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      Generate Content
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default KeywordResearch;
