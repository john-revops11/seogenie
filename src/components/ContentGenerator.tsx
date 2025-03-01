
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Copy, Code, FileText, PenLine, RefreshCw, Sparkles } from "lucide-react";
import { generateContent } from "@/services/keywordService";

interface ContentGeneratorProps {
  domain: string;
  allKeywords?: string[]; // Optional prop for keyword suggestions
}

const ContentGenerator = ({ domain, allKeywords = [] }: ContentGeneratorProps) => {
  const [title, setTitle] = useState("");
  const [contentType, setContentType] = useState("blog");
  const [keywords, setKeywords] = useState<string[]>(["seo tools", "keyword research"]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<{
    title: string;
    metaDescription: string;
    outline: string[];
    content: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState("editor");
  const [creativity, setCreativity] = useState([50]);
  
  // Update keywords if allKeywords prop changes
  useEffect(() => {
    if (allKeywords.length > 0) {
      // Use the top 5 keywords from allKeywords if available
      const topKeywords = allKeywords.slice(0, 5).map(k => k.toLowerCase());
      if (topKeywords.length > 0) {
        setKeywords(topKeywords);
      }
    }
  }, [allKeywords]);
  
  const contentTypeOptions = [
    { value: "blog", label: "Blog Post" },
    { value: "landing", label: "Landing Page" },
    { value: "product", label: "Product Description" },
    { value: "email", label: "Email Newsletter" },
  ];
  
  const handleKeywordsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const keywordArray = e.target.value.split(",").map(k => k.trim()).filter(k => k);
    setKeywords(keywordArray);
  };
  
  const handleGenerate = async () => {
    if (!title) {
      toast.error("Please enter a title for your content");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const content = await generateContent(
        domain,
        title,
        keywords,
        contentType,
        creativity[0]
      );
      
      setGeneratedContent(content);
      setActiveTab("preview");
      toast.success("Content successfully generated!");
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error("Failed to generate content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleCopyContent = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent.content);
      toast.success("Content copied to clipboard");
    }
  };
  
  const addKeyword = (keyword: string) => {
    if (!keywords.includes(keyword)) {
      setKeywords([...keywords, keyword]);
    }
  };
  
  const removeKeyword = (index: number) => {
    const newKeywords = [...keywords];
    newKeywords.splice(index, 1);
    setKeywords(newKeywords);
  };
  
  // Generate suggested keywords based on allKeywords or use defaults
  const suggestedKeywords = allKeywords.length > 0 
    ? [...new Set(allKeywords.slice(0, 15))]
        .filter(kw => !keywords.includes(kw))
        .slice(0, 6)
    : [
        "seo analysis", "backlink checker", "website ranking", 
        "content optimization", "meta description", "search engine optimization"
      ];

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="glass-panel transition-all duration-300 hover:shadow-xl">
        <CardHeader>
          <CardTitle>AI Content Generator</CardTitle>
          <CardDescription>Create SEO-optimized content based on your keyword analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-2 w-full max-w-md">
              <TabsTrigger value="editor" className="flex items-center gap-2">
                <PenLine className="w-4 h-4" /> Editor
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2" disabled={!generatedContent}>
                <FileText className="w-4 h-4" /> Preview
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="editor" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Content Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter a title for your content"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="transition-all focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="content-type">Content Type</Label>
                  <Select value={contentType} onValueChange={setContentType}>
                    <SelectTrigger className="transition-all">
                      <SelectValue placeholder="Select content type" />
                    </SelectTrigger>
                    <SelectContent>
                      {contentTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Target Keywords</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {keywords.map((keyword, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {keyword}
                        <button 
                          className="ml-1 text-xs opacity-70 hover:opacity-100"
                          onClick={() => removeKeyword(index)}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Textarea
                    placeholder="Enter keywords separated by commas"
                    onChange={handleKeywordsChange}
                    value={keywords.join(", ")}
                    className="transition-all focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Suggested Keywords</Label>
                  <div className="flex flex-wrap gap-2">
                    {suggestedKeywords.map((keyword) => (
                      <Badge 
                        key={keyword} 
                        variant="outline" 
                        className="cursor-pointer hover:bg-secondary transition-all"
                        onClick={() => addKeyword(keyword)}
                      >
                        + {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Creativity Level</Label>
                    <span className="text-sm text-muted-foreground">{creativity[0]}%</span>
                  </div>
                  <Slider
                    defaultValue={creativity}
                    max={100}
                    step={1}
                    onValueChange={setCreativity}
                    className="transition-all"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Conservative</span>
                    <span>Creative</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label>Advanced Options</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="meta" defaultChecked />
                      <label htmlFor="meta" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Generate meta description
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="outline" defaultChecked />
                      <label htmlFor="outline" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Include content outline
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="markdown" defaultChecked />
                      <label htmlFor="markdown" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Format with Markdown
                      </label>
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full mt-4 transition-all"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Content
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="space-y-6">
              {generatedContent && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{generatedContent.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">Content generated for {domain}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleCopyContent}>
                        <Copy className="w-4 h-4 mr-1" /> Copy
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setActiveTab("editor")}>
                        <PenLine className="w-4 h-4 mr-1" /> Edit
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 rounded-md border bg-muted/30">
                      <h4 className="text-sm font-medium mb-2">Meta Description</h4>
                      <p className="text-sm text-muted-foreground">{generatedContent.metaDescription}</p>
                    </div>
                    
                    <div className="p-4 rounded-md border bg-muted/30">
                      <h4 className="text-sm font-medium mb-2">Content Outline</h4>
                      <ul className="space-y-1">
                        {generatedContent.outline.map((item, index) => (
                          <li key={index} className="text-sm text-muted-foreground">• {item}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute right-3 top-3">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopyContent}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="p-4 rounded-md border bg-muted/30 prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground overflow-auto max-h-[500px]">
                          {generatedContent.content}
                        </pre>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                      <Button variant="outline" className="transition-all" onClick={() => handleGenerate()}>
                        <RefreshCw className="w-4 h-4 mr-2" /> Regenerate
                      </Button>
                      <Button className="transition-all">
                        <FileText className="w-4 h-4 mr-2" /> Save Content
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentGenerator;
