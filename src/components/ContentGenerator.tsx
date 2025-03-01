
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, X, FileText, Sparkles, Send, Plus, Check, BarChart3 } from "lucide-react";
import { generateContent } from "@/services/keywordService";

interface ContentGeneratorProps {
  domain: string;
  allKeywords?: any[]; // Optional array of keywords from analysis
}

const ContentGenerator = ({ domain, allKeywords = [] }: ContentGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [title, setTitle] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [contentType, setContentType] = useState("blog-post");
  const [length, setLength] = useState("medium");
  const [tone, setTone] = useState("professional");
  const [generatedContent, setGeneratedContent] = useState("");
  const [activeTab, setActiveTab] = useState("editor");
  const [creativity, setCreativity] = useState([50]);
  
  // Update keywords if allKeywords prop changes and is not empty
  useEffect(() => {
    // Make sure allKeywords exists and has items before trying to use it
    if (allKeywords && allKeywords.length > 0) {
      // Use the top 5 keywords from allKeywords if available
      const topKeywords = allKeywords.slice(0, 5).map(k => k.keyword.toLowerCase());
      if (topKeywords.length > 0) {
        setKeywords(topKeywords);
      }
    }
  }, [allKeywords]);
  
  const addKeyword = () => {
    if (newKeyword.trim() === "") return;
    
    if (!keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword("");
    } else {
      toast.error("This keyword is already added");
    }
  };
  
  const removeKeyword = (keywordToRemove: string) => {
    setKeywords(keywords.filter(k => k !== keywordToRemove));
  };
  
  const handleGenerate = async () => {
    if (keywords.length === 0) {
      toast.error("Please add at least one keyword");
      return;
    }
    
    if (!title) {
      toast.error("Please enter a title");
      return;
    }
    
    setIsGenerating(true);
    setGeneratedContent("");
    
    try {
      const content = await generateContent({
        domain,
        title,
        keywords,
        contentType,
        length,
        tone,
        creativity: creativity[0] / 100,
      });
      
      setGeneratedContent(content);
      setActiveTab("preview");
      toast.success("Content generated successfully!");
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error("Failed to generate content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Generate suggested keywords based on allKeywords or use defaults
  // Safely handle the case when allKeywords might be undefined
  const suggestedKeywords = (allKeywords && allKeywords.length > 0)
    ? [...new Set(allKeywords.slice(0, 15).map(kw => kw.keyword))]
        .filter(kw => !keywords.includes(kw))
        .slice(0, 6)
    : ["marketing", "seo", "content strategy", "analytics", "conversion", "optimization"];
  
  const handleAddSuggested = (keyword: string) => {
    if (!keywords.includes(keyword)) {
      setKeywords([...keywords, keyword]);
    }
  };
  
  const getLengthDescription = () => {
    switch (length) {
      case "short": return "~300 words";
      case "medium": return "~600 words";
      case "long": return "~1200 words";
      default: return "~600 words";
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-slide-up">
      <Card className="md:col-span-1 glass-panel transition-all hover:shadow-xl">
        <CardHeader>
          <CardTitle>Content Settings</CardTitle>
          <CardDescription>Configure your content generation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Content Title</Label>
            <Input 
              id="title" 
              placeholder="Enter a title for your content" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              disabled={isGenerating}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Content Type</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                type="button"
                variant={contentType === "blog-post" ? "default" : "outline"}
                className={contentType === "blog-post" ? "bg-revology text-white" : ""}
                onClick={() => setContentType("blog-post")}
                disabled={isGenerating}
              >
                <FileText className="mr-2 h-4 w-4" />
                Blog Post
              </Button>
              <Button 
                type="button"
                variant={contentType === "landing-page" ? "default" : "outline"}
                className={contentType === "landing-page" ? "bg-revology text-white" : ""}
                onClick={() => setContentType("landing-page")}
                disabled={isGenerating}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Landing Page
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Content Length</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button 
                type="button"
                variant={length === "short" ? "default" : "outline"}
                className={length === "short" ? "bg-revology text-white" : ""}
                onClick={() => setLength("short")}
                disabled={isGenerating}
              >
                Short
              </Button>
              <Button 
                type="button"
                variant={length === "medium" ? "default" : "outline"}
                className={length === "medium" ? "bg-revology text-white" : ""}
                onClick={() => setLength("medium")}
                disabled={isGenerating}
              >
                Medium
              </Button>
              <Button 
                type="button"
                variant={length === "long" ? "default" : "outline"}
                className={length === "long" ? "bg-revology text-white" : ""}
                onClick={() => setLength("long")}
                disabled={isGenerating}
              >
                Long
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-right">{getLengthDescription()}</p>
          </div>
          
          <div className="space-y-2">
            <Label>Tone</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button 
                type="button"
                variant={tone === "casual" ? "default" : "outline"}
                className={tone === "casual" ? "bg-revology text-white" : ""}
                onClick={() => setTone("casual")}
                disabled={isGenerating}
              >
                Casual
              </Button>
              <Button 
                type="button"
                variant={tone === "professional" ? "default" : "outline"}
                className={tone === "professional" ? "bg-revology text-white" : ""}
                onClick={() => setTone("professional")}
                disabled={isGenerating}
              >
                Professional
              </Button>
              <Button 
                type="button"
                variant={tone === "persuasive" ? "default" : "outline"}
                className={tone === "persuasive" ? "bg-revology text-white" : ""}
                onClick={() => setTone("persuasive")}
                disabled={isGenerating}
              >
                Persuasive
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Creativity</Label>
              <span className="text-sm text-muted-foreground">{creativity}%</span>
            </div>
            <Slider
              value={creativity}
              onValueChange={setCreativity}
              max={100}
              step={1}
              disabled={isGenerating}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Conservative</span>
              <span>Creative</span>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <Label>Keywords</Label>
            <div className="flex space-x-2">
              <Input
                placeholder="Add a keyword"
                value={newKeyword}
                onChange={e => setNewKeyword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addKeyword()}
                disabled={isGenerating}
              />
              <Button
                variant="outline"
                onClick={addKeyword}
                disabled={isGenerating || !newKeyword.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {keywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {keyword}
                    <button
                      className="ml-1 h-4 w-4 rounded-full hover:bg-muted text-muted-foreground p-0 flex items-center justify-center"
                      onClick={() => removeKeyword(keyword)}
                      disabled={isGenerating}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          {(suggestedKeywords.length > 0) && (
            <div className="space-y-2">
              <Label className="text-sm">Suggested Keywords</Label>
              <div className="flex flex-wrap gap-2">
                {suggestedKeywords.map((keyword, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="cursor-pointer transition-all hover:bg-revology-light hover:text-revology"
                    onClick={() => handleAddSuggested(keyword)}
                  >
                    + {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || keywords.length === 0 || !title}
            className="w-full bg-revology hover:bg-revology-dark"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Content...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Content
              </>
            )}
          </Button>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-1 lg:col-span-2 glass-panel transition-all hover:shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Content Preview</CardTitle>
              <CardDescription>
                {generatedContent ? "Generated content based on your settings" : "Your content will appear here after generation"}
              </CardDescription>
            </div>
            
            {generatedContent && (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[240px]">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="editor">Editor</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <TabsContent value="editor" className="mt-0">
            {generatedContent ? (
              <Textarea
                value={generatedContent}
                onChange={e => setGeneratedContent(e.target.value)}
                className="min-h-[500px] font-mono text-sm"
              />
            ) : (
              <div className="flex flex-col items-center justify-center space-y-3 h-[500px] bg-muted/20 rounded-lg border border-dashed">
                <Sparkles className="h-12 w-12 text-muted-foreground" />
                <div className="text-center space-y-1">
                  <h3 className="font-medium">No content generated yet</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Configure your settings and click "Generate Content" to create SEO-optimized content
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="preview" className="mt-0">
            {generatedContent ? (
              <ScrollArea className="h-[500px] w-full rounded-md border">
                <div className="p-4 prose prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: generatedContent.replace(/\n/g, '<br />') }} />
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-3 h-[500px] bg-muted/20 rounded-lg border border-dashed">
                <Sparkles className="h-12 w-12 text-muted-foreground" />
                <div className="text-center space-y-1">
                  <h3 className="font-medium">No content generated yet</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Configure your settings and click "Generate Content" to create SEO-optimized content
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
          
          {generatedContent && (
            <div className="flex justify-end mt-4 space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(generatedContent);
                  toast.success("Content copied to clipboard");
                }}
              >
                <Check className="mr-2 h-4 w-4" />
                Copy Content
              </Button>
              <Button className="bg-revology hover:bg-revology-dark">
                <Send className="mr-2 h-4 w-4" />
                Save Content
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentGenerator;
