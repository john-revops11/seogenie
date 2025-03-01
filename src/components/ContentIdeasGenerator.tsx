
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Copy, FileText, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { generateContentIdeas } from "@/services/keywordService";

interface ContentIdeasGeneratorProps {
  domain: string;
  competitorDomains: string[];
  keywords: any[];
  isLoading: boolean;
}

interface ContentIdea {
  topic: string;
  articles: Array<{
    title: string;
    metaDescription: string;
    keywordsToInclude: string[];
  }>;
}

const ContentIdeasGenerator = ({ domain, competitorDomains, keywords, isLoading }: ContentIdeasGeneratorProps) => {
  const [contentIdeas, setContentIdeas] = useState<ContentIdea[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("topic-0");
  const [currentTopicPage, setCurrentTopicPage] = useState(1);
  
  const topicsPerPage = 10;
  const maxDisplayedTopics = Math.min(contentIdeas.length, topicsPerPage);
  const totalTopicPages = Math.ceil(contentIdeas.length / topicsPerPage);
  const paginatedTopics = contentIdeas.slice(
    (currentTopicPage - 1) * topicsPerPage, 
    currentTopicPage * topicsPerPage
  );
  
  useEffect(() => {
    // When topics change due to pagination, update active tab
    if (paginatedTopics.length > 0) {
      setActiveTab(`topic-0`);
    }
  }, [currentTopicPage, paginatedTopics]);
  
  const handleGenerateIdeas = async () => {
    if (isLoading || !keywords || keywords.length === 0) {
      toast.error("Please analyze keywords first before generating content ideas");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const ideas = await generateContentIdeas(domain, keywords, competitorDomains);
      setContentIdeas(ideas.topics);
      setCurrentTopicPage(1);
      setActiveTab("topic-0");
      toast.success("Content ideas generated successfully!");
    } catch (error) {
      console.error("Failed to generate content ideas:", error);
      toast.error("Could not generate content ideas. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };
  
  const goToNextPage = () => {
    if (currentTopicPage < totalTopicPages) {
      setCurrentTopicPage(prev => prev + 1);
    }
  };
  
  const goToPreviousPage = () => {
    if (currentTopicPage > 1) {
      setCurrentTopicPage(prev => prev - 1);
    }
  };

  return (
    <Card className="glass-panel transition-all hover:shadow-xl">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Content Ideas</CardTitle>
          <CardDescription>
            Generate article ideas based on keyword analysis
          </CardDescription>
        </div>
        <Button
          onClick={handleGenerateIdeas}
          disabled={isGenerating || isLoading || !keywords || keywords.length === 0}
          size="sm"
          className="bg-revology hover:bg-revology-dark"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Ideas
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {isGenerating ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Creating content ideas based on your keywords...</p>
            </div>
          </div>
        ) : contentIdeas.length > 0 ? (
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex items-center justify-between">
                <TabsList className="mb-4 flex-1 overflow-x-auto scrollbar-hide">
                  {paginatedTopics.map((idea, index) => (
                    <TabsTrigger 
                      key={`topic-${index}`} 
                      value={`topic-${index}`}
                      className="whitespace-nowrap"
                    >
                      {idea.topic}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {totalTopicPages > 1 && (
                  <div className="flex items-center space-x-2 ml-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={goToPreviousPage}
                      disabled={currentTopicPage === 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-xs">
                      {currentTopicPage} / {totalTopicPages}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={goToNextPage}
                      disabled={currentTopicPage === totalTopicPages}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              
              <ScrollArea className="h-[400px] mt-2">
                {paginatedTopics.map((idea, topicIndex) => (
                  <TabsContent key={`topic-content-${topicIndex}`} value={`topic-${topicIndex}`} className="mt-0">
                    <div className="space-y-6">
                      {idea.articles.map((article, articleIndex) => (
                        <div 
                          key={`article-${topicIndex}-${articleIndex}`}
                          className="p-4 border rounded-lg bg-card transition-colors hover:bg-accent/10"
                        >
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium text-base">{article.title}</h3>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => copyToClipboard(`Title: ${article.title}\nMeta Description: ${article.metaDescription}\nKeywords: ${article.keywordsToInclude.join(', ')}`)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="mt-2 text-sm text-muted-foreground">
                            <p className="mb-2">{article.metaDescription}</p>
                          </div>
                          
                          <div className="mt-3 flex flex-wrap gap-2">
                            {article.keywordsToInclude.map((keyword, keywordIndex) => (
                              <Badge 
                                key={`keyword-${topicIndex}-${articleIndex}-${keywordIndex}`}
                                variant="secondary"
                                className="text-xs"
                              >
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="mt-4 flex justify-end">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-xs"
                              onClick={() => {
                                // Create a starting point for the content
                                const contentTemplate = `# ${article.title}\n\n## Introduction\n\n## Main Points\n\n## Conclusion`;
                                copyToClipboard(contentTemplate);
                                toast.success("Content template copied to clipboard");
                              }}
                            >
                              <FileText className="mr-2 h-3 w-3" />
                              Get Template
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </ScrollArea>
            </Tabs>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px] p-6">
            <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No content ideas generated yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              Click "Generate Ideas" to analyze your keywords and create targeted content recommendations
            </p>
            <Button
              onClick={handleGenerateIdeas}
              disabled={isGenerating || isLoading || !keywords || keywords.length === 0}
              className="bg-revology hover:bg-revology-dark"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Content Ideas
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContentIdeasGenerator;
