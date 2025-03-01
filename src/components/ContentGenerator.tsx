
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
  const [keywords, setKeywords] = useState<string[]>(["pricing strategy", "revenue management"]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<{
    title: string;
    metaDescription: string;
    outline: string[];
    content: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState("editor");
  const [creativity, setCreativity] = useState([50]);
  
  // State variables for topics and title suggestions
  const [selectedTopic, setSelectedTopic] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [isLoadingTitles, setIsLoadingTitles] = useState(false);
  
  useEffect(() => {
    if (allKeywords.length > 0) {
      const topKeywords = allKeywords.slice(0, 5).map(k => k.toLowerCase());
      if (topKeywords.length > 0) {
        setKeywords(topKeywords);
      }
    }
  }, [allKeywords]);
  
  // Generate topics based on keywords when component mounts or keywords change
  useEffect(() => {
    if (keywords.length > 0) {
      generateTopics();
    }
  }, [keywords]);
  
  // Generate new title suggestions when topic changes
  useEffect(() => {
    if (selectedTopic) {
      generateTitleSuggestions(selectedTopic);
    }
  }, [selectedTopic]);
  
  const contentTypeOptions = [
    { value: "blog", label: "Blog Post" },
    { value: "case_study", label: "Case Study" },
    { value: "whitepaper", label: "Whitepaper" },
    { value: "newsletter", label: "Email Newsletter" },
  ];
  
  const handleKeywordsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const keywordArray = e.target.value.split(",").map(k => k.trim()).filter(k => k);
    setKeywords(keywordArray);
  };
  
  const generateTopics = () => {
    // Generate topics based on pricing and revenue management keywords
    const keywordBased = keywords.slice(0, 3).map(keyword => {
      return `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} Strategies`;
    });
    
    // Add predefined topics related to pricing and revenue management
    const pricingTopics = [
      "Value-Based Pricing",
      "Dynamic Pricing Models",
      "Revenue Growth Management",
      "Pricing Analytics",
      "Subscription Revenue Optimization",
      "Price Elasticity Analysis",
      "Competitive Price Intelligence",
      "Customer Segmentation for Pricing",
      "Promotional Effectiveness"
    ];
    
    // Combine topics and ensure we have at least 5
    let combinedTopics = [...new Set([...keywordBased, ...pricingTopics])];
    combinedTopics = combinedTopics.slice(0, Math.max(5, keywordBased.length + 2));
    
    setTopics(combinedTopics);
    
    // Set default selected topic if none is selected
    if (!selectedTopic && combinedTopics.length > 0) {
      setSelectedTopic(combinedTopics[0]);
    }
  };
  
  const generateTitleSuggestions = (topic: string) => {
    setIsLoadingTitles(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Generate title suggestions based on selected topic and pricing/revenue keywords
      const suggestions = [];
      const topKeywords = keywords.slice(0, 3);
      const currentYear = new Date().getFullYear();
      
      // Generate titles with different formats focused on pricing and revenue
      suggestions.push(`${topic}: A Strategic Framework for Maximizing Revenue Growth`);
      
      if (topKeywords.length > 0) {
        suggestions.push(`How to Optimize ${topic} with Advanced Analytics for Better Profitability`);
      }
      
      suggestions.push(`${Math.floor(Math.random() * 5) + 5} ${topic} Best Practices That Drive Bottom-Line Impact`);
      
      // Add more variations if we need them
      if (suggestions.length < 3) {
        suggestions.push(`${topic} in ${currentYear}: Emerging Trends and Strategic Insights`);
        suggestions.push(`Transforming Your ${topic} Approach: Data-Driven Methods for Success`);
      }
      
      setTitleSuggestions(suggestions.slice(0, 3));
      setIsLoadingTitles(false);
    }, 800); // Simulate loading delay
  };
  
  const handleTopicChange = (value: string) => {
    setSelectedTopic(value);
  };
  
  const handleTitleSelect = (value: string) => {
    setTitle(value);
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
  
  // Suggested keywords for pricing and revenue management
  const suggestedKeywords = allKeywords.length > 0 
    ? [...new Set(allKeywords.slice(0, 15))]
        .filter(kw => !keywords.includes(kw))
        .slice(0, 6)
    : [
        "value-based pricing", "revenue optimization", "pricing strategy", 
        "dynamic pricing", "customer segmentation", "competitive analysis",
        "price elasticity", "revenue growth management", "subscription pricing"
      ];

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="glass-panel transition-all duration-300 hover:shadow-xl">
        <CardHeader>
          <CardTitle>AI Content Generator</CardTitle>
          <CardDescription>Create expert pricing and revenue management content for Revology Analytics</CardDescription>
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
                {/* Topic Selection Dropdown */}
                <div className="space-y-2">
                  <Label htmlFor="topic">Content Topic</Label>
                  <Select value={selectedTopic} onValueChange={handleTopicChange}>
                    <SelectTrigger className="transition-all">
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {topics.map((topic) => (
                        <SelectItem key={topic} value={topic}>
                          {topic}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedTopic && (
                    <p className="text-xs text-muted-foreground">
                      Selected topic: <span className="font-medium text-foreground">{selectedTopic}</span>
                    </p>
                  )}
                </div>
                
                {/* Title Selection Dropdown */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="title-suggestions">Suggested Titles</Label>
                    {isLoadingTitles && (
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Loading...
                      </span>
                    )}
                  </div>
                  {titleSuggestions.length > 0 ? (
                    <Select onValueChange={handleTitleSelect}>
                      <SelectTrigger className="transition-all">
                        <SelectValue placeholder="Choose a title or create your own" />
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
                    <div className="text-sm text-muted-foreground">
                      {isLoadingTitles ? "Generating title suggestions..." : "Select a topic to get title suggestions"}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="title">Content Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter a title for your content"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="transition-all focus:ring-2 focus:ring-primary/20"
                  />
                  {title && (
                    <p className="text-xs text-muted-foreground">
                      You can edit this title or use one of the suggestions above.
                    </p>
                  )}
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
                    <span>Data-Driven</span>
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
                      Generating Expert Content...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Pricing & Analytics Content
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
                      <p className="text-sm text-muted-foreground mt-1">Pricing & Analytics content for {domain}</p>
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
