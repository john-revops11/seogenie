
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Zap } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { OPENAI_API_KEY } from "@/services/keywords/apiConfig";
import { generateTopicSuggestions } from "@/utils/topicGenerator";

interface KeywordResearchProps {
  domain: string;
  onGenerateContent: (keyword: string, relatedKeywords: string[]) => void;
}

interface ResearchKeyword {
  keyword: string;
  volume: number;
  difficulty: number;
  cpc: number;
  recommendation: string;
  relatedKeywords: string[];
}

// Sample data for when the API is unavailable
const getSampleKeywords = (searchTerm: string): ResearchKeyword[] => {
  const baseKeywords = [
    {
      keyword: `${searchTerm} analytics`,
      volume: Math.floor(Math.random() * 5000) + 500,
      difficulty: Math.floor(Math.random() * 70) + 20,
      cpc: parseFloat((Math.random() * 5 + 1).toFixed(2)),
      recommendation: "Create a dedicated landing page focusing on analytics solutions",
      relatedKeywords: ["data analytics", "business analytics", "analytics dashboard", "metrics tracking"]
    },
    {
      keyword: `${searchTerm} software`,
      volume: Math.floor(Math.random() * 8000) + 1000,
      difficulty: Math.floor(Math.random() * 60) + 30,
      cpc: parseFloat((Math.random() * 8 + 2).toFixed(2)),
      recommendation: "Develop a product comparison page highlighting software benefits",
      relatedKeywords: ["SaaS platforms", "business software", "software solutions", "cloud software"]
    },
    {
      keyword: `${searchTerm} management`,
      volume: Math.floor(Math.random() * 6000) + 800,
      difficulty: Math.floor(Math.random() * 50) + 20,
      cpc: parseFloat((Math.random() * 6 + 1.5).toFixed(2)),
      recommendation: "Write detailed guides on management best practices",
      relatedKeywords: ["management strategies", "team management", "performance management"]
    },
    {
      keyword: `best ${searchTerm} tools`,
      volume: Math.floor(Math.random() * 4000) + 600,
      difficulty: Math.floor(Math.random() * 40) + 10,
      cpc: parseFloat((Math.random() * 4 + 0.8).toFixed(2)),
      recommendation: "Create a listicle comparing the top tools in the industry",
      relatedKeywords: ["top tools", "recommended tools", "tool comparison", "productivity tools"]
    },
    {
      keyword: `${searchTerm} examples`,
      volume: Math.floor(Math.random() * 3000) + 400,
      difficulty: Math.floor(Math.random() * 30) + 10,
      cpc: parseFloat((Math.random() * 3 + 0.5).toFixed(2)),
      recommendation: "Showcase real-world examples and case studies",
      relatedKeywords: ["case studies", "success stories", "implementation examples"]
    },
    {
      keyword: `${searchTerm} strategies`,
      volume: Math.floor(Math.random() * 3500) + 450,
      difficulty: Math.floor(Math.random() * 45) + 15,
      cpc: parseFloat((Math.random() * 4 + 1.2).toFixed(2)),
      recommendation: "Develop long-form content on strategic approaches",
      relatedKeywords: ["growth strategies", "optimization strategies", "strategic planning"]
    }
  ];
  
  // Return between 4-6 keywords for realistic results
  return baseKeywords.slice(0, Math.floor(Math.random() * 3) + 4);
};

const KeywordResearch = ({ domain, onGenerateContent }: KeywordResearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [keywords, setKeywords] = useState<ResearchKeyword[]>([]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error("Please enter a keyword to research");
      return;
    }

    setIsSearching(true);
    try {
      // Try to generate keyword research with OpenAI
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: 'You are an expert SEO researcher who can identify valuable keyword opportunities and provide actionable recommendations.'
              },
              {
                role: 'user',
                content: `Generate keyword research data for the term "${searchTerm}" related to domain "${domain}". 
                
                For each keyword, provide:
                - Estimated monthly search volume (number between 10-10000)
                - SEO difficulty score (1-100 scale where higher is more difficult)
                - Estimated CPC in USD (0.1-20.0)
                - A specific implementation recommendation for how to use this keyword
                - 3-5 related secondary keywords that would complement this keyword
                
                Generate 5-8 keywords total.
                
                Format your response EXACTLY like this JSON example:
                {
                  "keywords": [
                    {
                      "keyword": "example keyword 1",
                      "volume": 1200,
                      "difficulty": 45,
                      "cpc": 2.50,
                      "recommendation": "Use as primary H1 on a dedicated landing page with informational content",
                      "relatedKeywords": ["related term 1", "related term 2", "related term 3"]
                    },
                    {
                      "keyword": "example keyword 2",
                      "volume": 800,
                      "difficulty": 30,
                      "cpc": 1.75,
                      "recommendation": "Create a blog post that targets this long-tail keyword for higher conversion potential",
                      "relatedKeywords": ["related term 4", "related term 5", "related term 6", "related term 7"]
                    }
                  ]
                }`
              }
            ],
            temperature: 0.7,
            response_format: { type: 'json_object' }
          })
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        const parsedData = JSON.parse(data.choices[0].message.content);
        
        if (!parsedData.keywords || !Array.isArray(parsedData.keywords)) {
          throw new Error("Invalid response format from OpenAI");
        }

        setKeywords(parsedData.keywords);
        toast.success(`Found ${parsedData.keywords.length} keyword opportunities`);
      } catch (apiError) {
        console.error("Error with OpenAI API, using sample data:", apiError);
        // Use sample data if OpenAI API fails
        const sampleKeywords = getSampleKeywords(searchTerm);
        setKeywords(sampleKeywords);
        toast.success(`Generated ${sampleKeywords.length} keyword ideas for "${searchTerm}"`);
        toast.info("Using sample data for demonstration purposes");
      }
    } catch (error) {
      console.error("Error researching keywords:", error);
      toast.error(`Research failed: ${(error as Error).message}`);
      
      // Fallback to sample data on any error
      const sampleKeywords = getSampleKeywords(searchTerm);
      setKeywords(sampleKeywords);
      toast.info("Using sample data for demonstration purposes");
    } finally {
      setIsSearching(false);
    }
  };

  const handleGenerateContent = (keyword: string, relatedKeywords: string[]) => {
    // Generate initial topic suggestion based on the selected keyword
    const initialTopics = generateTopicSuggestions(domain, [], null, [keyword, ...relatedKeywords]);
    
    // Call the parent component's handler with keyword data
    onGenerateContent(keyword, relatedKeywords);
    
    // Show success toast with more specific message
    toast.success(`Preparing to generate content for "${keyword}" - switched to Content tab`);
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 30) return "bg-green-100 text-green-800";
    if (difficulty < 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Keyword Research</CardTitle>
        <CardDescription>Discover relevant keywords and content opportunities</CardDescription>
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
