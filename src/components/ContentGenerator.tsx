import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Loader2, RefreshCw, FileEdit, Copy, Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { generateContent } from "@/services/keywordService";
import { keywordGapsCache } from "@/components/KeywordGapCard";
import { recommendationsCache } from "@/components/SeoRecommendationsCard";

interface ContentGeneratorProps {
  domain: string;
  allKeywords: string[];
}

const generateTopicSuggestions = (
  domain: string,
  keywordGaps: any[] = [],
  seoRecommendations: any[] = []
): string[] => {
  if ((!keywordGaps || keywordGaps.length === 0) && 
      (!seoRecommendations || seoRecommendations.length === 0)) {
    return [
      "Pricing Strategy Optimization",
      "Revenue Growth Management",
      "Dynamic Pricing Models",
      "Value-Based Pricing",
      "Pricing Analytics Frameworks"
    ];
  }
  
  const gapKeywords = keywordGaps?.map(gap => gap.keyword) || [];
  
  const contentRecs = seoRecommendations?.filter(rec => rec.type === "content") || [];
  
  const topics = new Set<string>();
  
  if (gapKeywords.length > 0) {
    const keywordGroups: Record<string, string[]> = {};
    
    gapKeywords.forEach(keyword => {
      const mainTerm = keyword.split(' ').slice(0, 2).join(' ');
      if (!keywordGroups[mainTerm]) {
        keywordGroups[mainTerm] = [];
      }
      keywordGroups[mainTerm].push(keyword);
    });
    
    Object.entries(keywordGroups).forEach(([mainTerm, keywords]) => {
      if (keywords.length >= 2) {
        const topicName = mainTerm.charAt(0).toUpperCase() + mainTerm.slice(1);
        
        const pricingTopics = [
          `${topicName} Pricing Strategies`,
          `${topicName} for Revenue Growth`,
          `${topicName} Analytics Framework`
        ];
        
        pricingTopics.forEach(topic => topics.add(topic));
      }
    });
  }
  
  contentRecs.forEach(rec => {
    const recommendation = rec.recommendation.toLowerCase();
    
    if (recommendation.includes('pricing') || 
        recommendation.includes('revenue') || 
        recommendation.includes('strategy')) {
      
      const topicWords = recommendation.split(' ').slice(0, 4);
      const topicName = topicWords
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      topics.add(topicName);
    }
  });
  
  const defaultTopics = [
    "Pricing Strategy Optimization",
    "Revenue Growth Management",
    "Dynamic Pricing Models",
    "Value-Based Pricing",
    "Pricing Analytics Frameworks",
    "Competitive Pricing Analysis",
    "Subscription Revenue Optimization"
  ];
  
  defaultTopics.forEach(topic => {
    if (topics.size < 5) {
      topics.add(topic);
    }
  });
  
  return Array.from(topics).slice(0, 8);
};

const generateTitleSuggestions = (
  topic: string,
  keywordGaps: any[] = [],
  seoRecommendations: any[] = []
): string[] => {
  if ((!keywordGaps || keywordGaps.length === 0) && 
      (!seoRecommendations || seoRecommendations.length === 0)) {
    return [
      `Ultimate Guide to ${topic} for Business Growth`,
      `How ${topic} Drives Revenue: Proven Strategies`,
      `${topic}: Benchmarks and Best Practices for 2023`
    ];
  }
  
  const titles = new Set<string>();
  
  const relatedKeywords = keywordGaps?.filter(gap => {
    const keyword = gap.keyword.toLowerCase();
    const topicWords = topic.toLowerCase().split(' ');
    return topicWords.some(word => keyword.includes(word)) || 
           keyword.includes('pricing') || 
           keyword.includes('revenue');
  }) || [];
  
  relatedKeywords.forEach(gap => {
    const keyword = gap.keyword;
    titles.add(`${topic}: Optimizing for ${keyword.charAt(0).toUpperCase() + keyword.slice(1)}`);
    titles.add(`The Ultimate Guide to ${topic} and ${keyword.charAt(0).toUpperCase() + keyword.slice(1)}`);
  });
  
  const contentRecs = seoRecommendations?.filter(rec => rec.type === "content") || [];
  contentRecs.forEach(rec => {
    const recommendation = rec.recommendation;
    if (recommendation.toLowerCase().includes(topic.toLowerCase().split(' ')[0])) {
      titles.add(`${topic}: ${recommendation.split(':').pop()?.trim() || 'Best Practices and Strategies'}`);
    }
  });
  
  const defaultTitles = [
    `Ultimate Guide to ${topic} for Revenue Growth`,
    `How ${topic} Drives Profitability: Proven Strategies`,
    `${topic}: Benchmarks and Best Practices for 2023`,
    `Implementing ${topic} to Maximize Customer Lifetime Value`,
    `${topic}: Analytics-Driven Approach for Business Success`
  ];
  
  defaultTitles.forEach(title => {
    if (titles.size < 3) {
      titles.add(title);
    }
  });
  
  return Array.from(titles).slice(0, 3);
};

const ContentGenerator = ({ domain, allKeywords }: ContentGeneratorProps) => {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [contentType, setContentType] = useState("blog");
  const [creativity, setCreativity] = useState(50);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<{
    title: string;
    metaDescription: string;
    outline: string[];
    content: string;
  } | null>(null);
  
  const [topics, setTopics] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [isLoadingTitles, setIsLoadingTitles] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  
  useEffect(() => {
    const checkDataReadiness = () => {
      const hasKeywordGaps = keywordGapsCache.data && keywordGapsCache.data.length > 0;
      const hasRecommendations = recommendationsCache.data && 
                                (recommendationsCache.data.onPage.length > 0 || 
                                 recommendationsCache.data.technical.length > 0 || 
                                 recommendationsCache.data.content.length > 0);
      
      setIsDataReady(hasKeywordGaps && hasRecommendations);
      
      if (hasKeywordGaps && hasRecommendations) {
        generateInitialTopics();
      }
    };
    
    checkDataReadiness();
  }, [domain, allKeywords]);
  
  const generateInitialTopics = () => {
    setIsLoadingTopics(true);
    
    try {
      const gaps = keywordGapsCache.data || [];
      
      const allRecommendations = [
        ...(recommendationsCache.data?.onPage || []),
        ...(recommendationsCache.data?.technical || []),
        ...(recommendationsCache.data?.content || [])
      ];
      
      const generatedTopics = generateTopicSuggestions(domain, gaps, allRecommendations);
      setTopics(generatedTopics);
      
      setSelectedTopic("");
      setTitleSuggestions([]);
      setTitle("");
    } catch (error) {
      console.error("Error generating topics:", error);
      toast.error("Failed to generate topic suggestions");
    } finally {
      setIsLoadingTopics(false);
    }
  };
  
  const handleTopicChange = (topic: string) => {
    setSelectedTopic(topic);
    setIsLoadingTitles(true);
    
    try {
      const gaps = keywordGapsCache.data || [];
      
      const allRecommendations = [
        ...(recommendationsCache.data?.onPage || []),
        ...(recommendationsCache.data?.technical || []),
        ...(recommendationsCache.data?.content || [])
      ];
      
      const titles = generateTitleSuggestions(topic, gaps, allRecommendations);
      setTitleSuggestions(titles);
      
      if (titles.length > 0) {
        setTitle(titles[0]);
      }
    } catch (error) {
      console.error("Error generating titles:", error);
      toast.error("Failed to generate title suggestions");
    } finally {
      setIsLoadingTitles(false);
    }
  };
  
  const handleTitleSelect = (selectedTitle: string) => {
    setTitle(selectedTitle);
  };
  
  const handleRegenerateTopics = () => {
    setIsLoadingTopics(true);
    
    try {
      const gaps = keywordGapsCache.data || [];
      
      const allRecommendations = [
        ...(recommendationsCache.data?.onPage || []),
        ...(recommendationsCache.data?.technical || []),
        ...(recommendationsCache.data?.content || [])
      ];
      
      const randomSeed = Math.random().toString();
      console.log("Regenerating topics with seed:", randomSeed);
      
      const existingTopics = new Set(topics);
      let newTopics = [];
      
      for (let i = 0; i < 3; i++) {
        const candidateTopics = generateTopicSuggestions(domain, gaps, allRecommendations);
        newTopics = candidateTopics.filter(topic => !existingTopics.has(topic));
        
        if (newTopics.length >= 5) break;
      }
      
      if (newTopics.length < 5) {
        newTopics = generateTopicSuggestions(domain, gaps, allRecommendations);
      }
      
      setTopics(newTopics);
      toast.success("Generated new topic suggestions");
      
      setSelectedTopic("");
      setTitleSuggestions([]);
      setTitle("");
    } catch (error) {
      console.error("Error regenerating topics:", error);
      toast.error("Failed to regenerate topic suggestions");
    } finally {
      setIsLoadingTopics(false);
    }
  };
  
  const handleRegenerateTitles = () => {
    if (!selectedTopic) {
      toast.error("Please select a topic first");
      return;
    }
    
    setIsLoadingTitles(true);
    
    try {
      const gaps = keywordGapsCache.data || [];
      
      const allRecommendations = [
        ...(recommendationsCache.data?.onPage || []),
        ...(recommendationsCache.data?.technical || []),
        ...(recommendationsCache.data?.content || [])
      ];
      
      const randomSeed = Math.random().toString();
      console.log("Regenerating titles with seed:", randomSeed);
      
      const existingTitles = new Set(titleSuggestions);
      let newTitles = [];
      
      for (let i = 0; i < 3; i++) {
        const candidateTitles = generateTitleSuggestions(selectedTopic, gaps, allRecommendations);
        newTitles = candidateTitles.filter(title => !existingTitles.has(title));
        
        if (newTitles.length >= 3) break;
      }
      
      if (newTitles.length < 3) {
        newTitles = generateTitleSuggestions(selectedTopic, gaps, allRecommendations);
      }
      
      setTitleSuggestions(newTitles);
      
      if (newTitles.length > 0) {
        setTitle(newTitles[0]);
      }
      
      toast.success("Generated new title suggestions");
    } catch (error) {
      console.error("Error regenerating titles:", error);
      toast.error("Failed to regenerate title suggestions");
    } finally {
      setIsLoadingTitles(false);
    }
  };
  
  const handleTagClick = (keyword: string) => {
    if (selectedKeywords.includes(keyword)) {
      setSelectedKeywords(selectedKeywords.filter(k => k !== keyword));
    } else {
      setSelectedKeywords([...selectedKeywords, keyword]);
    }
  };
  
  const handleGenerateContent = async () => {
    if (!title) {
      toast.error("Please enter a title for your content");
      return;
    }
    
    if (selectedKeywords.length === 0) {
      toast.error("Please select at least one keyword");
      return;
    }
    
    setIsGenerating(true);
    setGeneratedContent(null);
    
    try {
      const content = await generateContent(
        domain,
        title,
        selectedKeywords,
        contentType,
        creativity
      );
      
      setGeneratedContent(content);
      setEditedContent(content.content);
      setIsEditing(false);
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error(`Failed to generate content: ${(error as Error).message}`);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleRegenerateContent = async () => {
    handleGenerateContent();
  };
  
  const handleEditContent = () => {
    setIsEditing(true);
  };
  
  const handleSaveEdits = () => {
    if (generatedContent) {
      setGeneratedContent({
        ...generatedContent,
        content: editedContent
      });
      setIsEditing(false);
      toast.success("Content updated successfully");
    }
  };
  
  const handleCopy = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent.content);
      toast.success("Content copied to clipboard");
    }
  };
  
  const handleDownload = () => {
    if (generatedContent) {
      const blob = new Blob([generatedContent.content], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${generatedContent.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Content downloaded as Markdown file");
    }
  };

  if (!isDataReady) {
    return (
      <Card className="glass-panel transition-all duration-300 hover:shadow-xl">
        <CardHeader>
          <CardTitle>Content Generation</CardTitle>
          <CardDescription>Analysis data required for intelligent content generation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Loader2 className="w-12 h-12 text-primary/50 animate-spin mb-4" />
            <h3 className="text-lg font-semibold">Waiting for analysis data</h3>
            <p className="mt-2 text-muted-foreground max-w-md">
              Please complete the keyword analysis first. This data is required to generate optimized content that aligns with your SEO strategy.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-panel transition-all duration-300 hover:shadow-xl">
      <CardHeader>
        <CardTitle>AI Content Generator</CardTitle>
        <CardDescription>Create expert pricing and revenue management content for Revology Analytics</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList className="grid grid-cols-2 w-full max-w-sm mx-auto">
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="preview" disabled={!generatedContent}>Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="generate" className="space-y-6 pt-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Topic</Label>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex items-center gap-1 h-7 px-2 text-xs"
                    onClick={handleRegenerateTopics}
                    disabled={isLoadingTopics}
                  >
                    {isLoadingTopics ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3 w-3" />
                    )}
                    Regenerate
                  </Button>
                </div>
                
                <Select 
                  value={selectedTopic} 
                  onValueChange={handleTopicChange}
                  disabled={isLoadingTopics}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {topics.map((topic, index) => (
                      <SelectItem key={index} value={topic}>
                        {topic}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Title</Label>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex items-center gap-1 h-7 px-2 text-xs"
                    onClick={handleRegenerateTitles}
                    disabled={isLoadingTitles || !selectedTopic}
                  >
                    {isLoadingTitles ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3 w-3" />
                    )}
                    Regenerate
                  </Button>
                </div>
                
                {selectedTopic && (
                  <>
                    {titleSuggestions.length > 0 ? (
                      <Select 
                        value={title} 
                        onValueChange={handleTitleSelect}
                        disabled={isLoadingTitles}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a title" />
                        </SelectTrigger>
                        <SelectContent>
                          {titleSuggestions.map((suggestion, index) => (
                            <SelectItem key={index} value={suggestion}>
                              {suggestion}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input 
                        placeholder="Custom title" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    )}
                  </>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Content Type</Label>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blog">Blog Post</SelectItem>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="whitepaper">White Paper</SelectItem>
                    <SelectItem value="casestudy">Case Study</SelectItem>
                    <SelectItem value="guide">Guide</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Creativity</Label>
                  <span className="text-xs text-muted-foreground">{creativity}%</span>
                </div>
                <Slider
                  value={[creativity]}
                  min={0}
                  max={100}
                  step={10}
                  onValueChange={(value) => setCreativity(value[0])}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground pt-1">
                  <span>Factual</span>
                  <span>Creative</span>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <Label>Target Keywords</Label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-md">
                  {allKeywords.slice(0, 30).map((keyword, index) => (
                    <Badge
                      key={index}
                      variant={selectedKeywords.includes(keyword) ? "default" : "outline"}
                      className="cursor-pointer transition-all hover:shadow"
                      onClick={() => handleTagClick(keyword)}
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <Button 
                className="w-full mt-6 bg-revology hover:bg-revology-dark" 
                onClick={handleGenerateContent}
                disabled={isGenerating || !title || selectedKeywords.length === 0}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Content"
                )}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="space-y-6">
            {generatedContent && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold">{generatedContent.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {generatedContent.metaDescription}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex items-center gap-1"
                      onClick={handleCopy}
                    >
                      <Copy className="h-4 w-4" />
                      Copy
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex items-center gap-1"
                      onClick={handleDownload}
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                {isEditing ? (
                  <div className="space-y-4">
                    <Textarea 
                      className="min-h-[400px] font-mono text-sm"
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSaveEdits}
                      >
                        Save Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <ScrollArea className="h-[500px] pr-4">
                      <div className="space-y-4 article-content" dangerouslySetInnerHTML={{
                        __html: generatedContent.content
                          .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-6 mb-4">$1</h1>')
                          .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mt-5 mb-3">$1</h2>')
                          .replace(/^### (.*$)/gim, '<h3 class="text-xl font-medium mt-4 mb-2">$1</h3>')
                          .replace(/^#### (.*$)/gim, '<h4 class="text-lg font-medium mt-3 mb-2">$1</h4>')
                          .replace(/^\* (.*$)/gim, '<li class="ml-6 list-disc">$1</li>')
                          .replace(/^- (.*$)/gim, '<li class="ml-6 list-disc">$1</li>')
                          .replace(/^(\d+\. )(.*$)/gim, '<li class="ml-6 list-decimal">$2</li>')
                          .replace(/<\/li>\n<li/g, '</li><li')
                          .replace(/^\n\n/gim, '</p><p class="my-3">')
                          .replace(/\n\n/gim, '</p><p class="my-3">')
                          .replace(/\n/gim, '<br>')
                          .replace(/<\/p><p/g, '</p>\n<p')
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      }} />
                    </ScrollArea>
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-1" 
                        onClick={handleEditContent}
                      >
                        <FileEdit className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button 
                        className="flex items-center gap-1" 
                        onClick={handleRegenerateContent}
                      >
                        <RefreshCw className="h-4 w-4" />
                        Regenerate
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ContentGenerator;
