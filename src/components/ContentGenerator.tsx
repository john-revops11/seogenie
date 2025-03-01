
import { useState } from "react";
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

const ContentGenerator = ({ domain }: { domain: string }) => {
  const [title, setTitle] = useState("");
  const [contentType, setContentType] = useState("blog");
  const [keywords, setKeywords] = useState(["seo tools", "keyword research"]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<{
    title: string;
    metaDescription: string;
    outline: string[];
    content: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState("editor");
  const [creativity, setCreativity] = useState([50]);
  
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
  
  const handleGenerate = () => {
    if (!title) {
      toast.error("Please enter a title for your content");
      return;
    }
    
    setIsGenerating(true);
    
    // Mock API call delay
    setTimeout(() => {
      const mockContentGeneration = {
        title: title,
        metaDescription: `Discover the best ${keywords.join(", ")} and strategies to improve your SEO performance. Learn how to analyze and optimize your website for better rankings.`,
        outline: [
          "Introduction to SEO Tools and Keyword Research",
          "Why Keyword Research is Critical for SEO Success",
          "Top 5 SEO Tools for Effective Keyword Analysis",
          "How to Identify Valuable Keywords for Your Industry",
          "Implementing Keyword Strategy for Better Rankings",
          "Measuring and Tracking Keyword Performance",
          "Conclusion and Next Steps"
        ],
        content: `# ${title}

## Introduction to SEO Tools and Keyword Research

In today's competitive digital landscape, having the right **SEO tools** at your disposal can make the difference between online visibility and obscurity. Effective **keyword research** forms the foundation of any successful SEO strategy, allowing businesses to understand what their potential customers are searching for.

## Why Keyword Research is Critical for SEO Success

**Keyword research** isn't just about finding popular search terms; it's about uncovering the specific language your audience uses when looking for solutions. By understanding these patterns, you can create content that directly addresses their needs and questions.

- Identifies customer pain points and questions
- Reveals new market opportunities
- Helps prioritize content creation efforts
- Provides competitive intelligence

## Top 5 SEO Tools for Effective Keyword Analysis

The market offers numerous **SEO tools** designed to simplify and enhance your keyword discovery process:

1. **SEMrush** - Comprehensive keyword data with competitive analysis
2. **Ahrefs** - In-depth backlink analysis and keyword difficulty metrics
3. **Moz Keyword Explorer** - Keyword suggestions with opportunity scores
4. **Google Keyword Planner** - Direct insights from Google's data
5. **Ubersuggest** - User-friendly interface with content ideas

Each of these tools offers unique features that can help you identify valuable keywords and understand their potential.

## How to Identify Valuable Keywords for Your Industry

Not all keywords are created equal. The most valuable keywords for your business will balance search volume, competition, and relevance:

* **Search Volume**: How many people are searching for this term monthly
* **Keyword Difficulty**: How hard it will be to rank for this term
* **Commercial Intent**: How likely searchers are to convert
* **Relevance**: How closely the keyword matches your offerings

## Implementing Keyword Strategy for Better Rankings

Once you've identified your target keywords, implementation becomes key:

- Incorporate primary keywords in titles, headings, and opening paragraphs
- Use secondary keywords naturally throughout your content
- Optimize meta descriptions and URL structures
- Create topic clusters around related keywords
- Develop a content calendar based on keyword opportunities

## Measuring and Tracking Keyword Performance

The work doesn't end with implementation. Regular monitoring helps you understand what's working and what needs adjustment:

1. Track ranking positions for target keywords
2. Monitor organic traffic to optimized pages
3. Analyze user behavior and engagement metrics
4. Adjust strategy based on performance data

## Conclusion and Next Steps

**SEO tools** and effective **keyword research** are not one-time tasks but ongoing processes that evolve with your business and the digital landscape. By consistently refining your approach and staying informed about changes in search algorithms, you can maintain and improve your website's visibility.

Ready to take your SEO strategy to the next level? Start by conducting a comprehensive keyword audit and identifying new opportunities for growth.`
      };
      
      setGeneratedContent(mockContentGeneration);
      setIsGenerating(false);
      setActiveTab("preview");
      toast.success("Content successfully generated!");
    }, 3000);
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
  
  const suggestedKeywords = [
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
