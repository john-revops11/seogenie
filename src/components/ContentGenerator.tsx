import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Loader2, RefreshCw, FileEdit, Copy, Download, Plus, CheckCircle, Edit, Check, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { generateContent, SeoRecommendation } from "@/services/keywordService";
import { keywordGapsCache } from "@/components/KeywordGapCard";
import { recommendationsCache } from "@/components/SeoRecommendationsCard";

interface ContentGeneratorProps {
  domain: string;
  allKeywords: string[];
}

// Topic suggestion helper function - Enhanced for niche relevance
const generateTopicSuggestions = (
  domain: string,
  keywordGaps: any[] = [],
  seoRecommendations: {
    onPage: SeoRecommendation[];
    technical: SeoRecommendation[];
    content: SeoRecommendation[];
  } | null = null,
  selectedKeywords: string[] = []
): string[] => {
  if ((!keywordGaps || keywordGaps.length === 0) && !seoRecommendations) {
    return [];
  }
  
  // Extract the domain niche based on the domain name and keywords
  const domainName = domain.replace(/https?:\/\//i, '').replace(/www\./i, '').split('.')[0];
  const domainWords = domainName.split(/[^a-zA-Z0-9]/).filter(word => word.length > 3);
  
  // Prioritize selected keywords when available
  const keywordsToUse = selectedKeywords.length > 0 
    ? selectedKeywords 
    : keywordGaps?.map(gap => gap.keyword) || [];
  
  const contentRecs = seoRecommendations?.content || [];
  
  // Use a Set to avoid duplicate topics
  const topics = new Set<string>();
  
  // Extract common themes/terms from keywords to identify the domain niche
  const allWords = keywordsToUse.flatMap(keyword => 
    keyword.toLowerCase().split(/\s+/)
  );
  
  // Count word frequencies to identify niche-related terms
  const wordFrequency: Record<string, number> = {};
  allWords.forEach(word => {
    if (word.length > 3) { // Only consider meaningful words
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    }
  });
  
  // Sort words by frequency to find common niche terms
  const nicheTerms = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([term]) => term);
  
  // Combine domain words with niche terms
  const relevantTerms = [...new Set([...domainWords, ...nicheTerms])];
  console.log("Detected niche terms:", relevantTerms);
  
  // Extract topics from keyword gaps with improved niche relevance
  if (keywordsToUse.length > 0) {
    // Group keywords by common terms to identify themes
    const keywordGroups: Record<string, string[]> = {};
    
    keywordsToUse.forEach(keyword => {
      // Check if keyword contains any relevant niche terms
      const containsNicheTerm = relevantTerms.some(term => 
        keyword.toLowerCase().includes(term.toLowerCase())
      );
      
      // Extract potential main terms from each keyword
      const words = keyword.split(' ');
      if (words.length >= 2) {
        // Try different combinations of words for potential topics
        const mainTermOptions = [
          words.slice(0, 2).join(' '), // First two words
          words.length >= 3 ? words.slice(0, 3).join(' ') : null, // First three words
          words[0] // Just the first word for broader topics
        ].filter(Boolean) as string[];
        
        // Prioritize terms that contain niche-relevant words
        const termsToPrioritize = containsNicheTerm 
          ? mainTermOptions 
          : mainTermOptions.filter(term => 
              relevantTerms.some(nicheTerm => 
                term.toLowerCase().includes(nicheTerm.toLowerCase())
              )
            );
        
        // If we have niche-relevant terms, use those, otherwise use all terms
        const termsToUse = termsToPrioritize.length > 0 ? termsToPrioritize : mainTermOptions;
        
        termsToUse.forEach(mainTerm => {
          if (!keywordGroups[mainTerm]) {
            keywordGroups[mainTerm] = [];
          }
          keywordGroups[mainTerm].push(keyword);
        });
      } else if (words.length === 1) {
        // Single word keyword
        const mainTerm = words[0];
        if (!keywordGroups[mainTerm]) {
          keywordGroups[mainTerm] = [];
        }
        keywordGroups[mainTerm].push(keyword);
      }
    });
    
    // Filter groups that have at least 2 related keywords or contain niche terms
    Object.entries(keywordGroups)
      .filter(([term, keywords]) => {
        // Keep if it has multiple keywords OR contains a niche term
        return keywords.length >= 2 || 
               relevantTerms.some(nicheTerm => 
                 term.toLowerCase().includes(nicheTerm.toLowerCase())
               );
      })
      .slice(0, 8) // Limit to avoid too many topics
      .forEach(([mainTerm, keywords]) => {
        // Create topic variations based on the keyword group
        const topicName = mainTerm.charAt(0).toUpperCase() + mainTerm.slice(1);
        
        // Generate multiple topic formats based on the main term and niche
        const topicVariations = [
          `${topicName} Strategies for Growth`,
          `${topicName} Optimization Guide`,
          `${topicName} Framework`,
          `Advanced ${topicName} Tactics`,
          `${topicName} Best Practices`,
          `Complete ${topicName} Guide`
        ];
        
        // Add a few variations to the topics set
        topicVariations.slice(0, 2).forEach(topic => topics.add(topic));
      });
  }
  
  // Extract topics from SEO content recommendations with niche focus
  if (contentRecs.length > 0) {
    contentRecs.forEach(rec => {
      const recommendation = rec.recommendation.toLowerCase();
      
      // Look for content recommendations that match the niche
      const matchesNiche = relevantTerms.some(term => 
        recommendation.includes(term.toLowerCase())
      );
      
      // Prioritize high-priority or niche-relevant recommendations
      if (rec.priority === 'high' || matchesNiche) {
        // Format the recommendation as a topic
        let topicName = '';
        
        if (recommendation.includes('create content about')) {
          // Extract the topic from "Create content about X" format
          const match = recommendation.match(/create content about ["'](.+?)["']/i);
          if (match && match[1]) {
            topicName = match[1].charAt(0).toUpperCase() + match[1].slice(1);
          }
        } else {
          // Extract first part of the recommendation
          const topicWords = recommendation.split(' ').slice(0, 4);
          topicName = topicWords
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        }
        
        if (topicName && topicName.length > 5) {
          // Check if the topic is related to the niche
          if (matchesNiche || 
              relevantTerms.some(term => topicName.toLowerCase().includes(term.toLowerCase()))) {
            topics.add(topicName);
          }
        }
      }
    });
  }
  
  // If we don't have enough topics yet, generate some based on the niche terms
  if (topics.size < 5 && relevantTerms.length > 0) {
    const nicheBasedTopics = [
      `${relevantTerms[0].charAt(0).toUpperCase() + relevantTerms[0].slice(1)} Optimization Guide`,
      `Best Practices for ${relevantTerms[0].charAt(0).toUpperCase() + relevantTerms[0].slice(1)}`,
      `${relevantTerms[0].charAt(0).toUpperCase() + relevantTerms[0].slice(1)} Strategy Framework`,
      `How to Improve Your ${relevantTerms[0].charAt(0).toUpperCase() + relevantTerms[0].slice(1)} Performance`,
      `${relevantTerms[0].charAt(0).toUpperCase() + relevantTerms[0].slice(1)} Trends and Insights`
    ];
    
    nicheBasedTopics.forEach(topic => topics.add(topic));
  }
  
  // Getting a clean array of topics
  const uniqueTopics = Array.from(topics);
  
  // Generate some randomness to ensure new topics on regeneration
  const randomSeed = Math.random();
  const shuffledTopics = [...uniqueTopics].sort(() => randomSeed - 0.5);
  
  return shuffledTopics.slice(0, 8);
};

// Title suggestion helper function - Enhanced for SEO relevance
const generateTitleSuggestions = (
  topic: string,
  keywordGaps: any[] = [],
  seoRecommendations: {
    onPage: SeoRecommendation[];
    technical: SeoRecommendation[];
    content: SeoRecommendation[];
  } | null = null,
  selectedKeywords: string[] = []
): string[] => {
  if ((!keywordGaps || keywordGaps.length === 0) && !seoRecommendations) {
    return [
      `Guide to ${topic}`,
      `${topic}: Best Practices`,
      `Understanding ${topic}`
    ];
  }
  
  // Prioritize selected keywords
  const keywordsToUse = selectedKeywords.length > 0 
    ? selectedKeywords 
    : keywordGaps?.map(gap => gap.keyword) || [];
  
  // Use a Set to avoid duplicate titles
  const titles = new Set<string>();
  
  // Find keywords related to the selected topic
  const relatedKeywords = keywordsToUse.filter(keyword => {
    const keywordLower = keyword.toLowerCase();
    const topicWords = topic.toLowerCase().split(' ');
    return topicWords.some(word => keywordLower.includes(word) && word.length > 3);
  });
  
  // Find the most relevant keywords based on search volume or opportunity
  const prioritizedKeywords = relatedKeywords
    .map(keyword => {
      const relatedGap = keywordGaps.find(gap => gap.keyword === keyword);
      return {
        keyword,
        volume: relatedGap?.volume || 0,
        opportunity: relatedGap?.opportunity === 'high' ? 3 : 
                    relatedGap?.opportunity === 'medium' ? 2 : 1
      };
    })
    .sort((a, b) => {
      // First sort by opportunity (high to low)
      if (a.opportunity !== b.opportunity) {
        return b.opportunity - a.opportunity;
      }
      // Then by volume (high to low)
      return b.volume - a.volume;
    })
    .slice(0, 5)
    .map(item => item.keyword);
  
  // Generate titles from the most relevant keywords
  prioritizedKeywords.forEach(keyword => {
    // Create variations of titles incorporating the keyword
    const keywordFormat = keyword.charAt(0).toUpperCase() + keyword.slice(1);
    titles.add(`${topic}: Complete Guide to ${keywordFormat}`);
    titles.add(`How ${topic} Improves Your ${keywordFormat} Strategy`);
    titles.add(`${keywordFormat}: The Ultimate ${topic} Approach`);
  });
  
  // Use SEO content recommendations for title inspiration
  const contentRecs = seoRecommendations?.content || [];
  contentRecs.forEach(rec => {
    const recommendation = rec.recommendation;
    // Match recommendations to topic
    const topicWords = topic.toLowerCase().split(' ').filter(w => w.length > 3);
    const containsTopicWord = topicWords.some(word => 
      recommendation.toLowerCase().includes(word)
    );
    
    if (containsTopicWord) {
      // Extract useful phrases from recommendation
      let titlePhrase = recommendation.split(':').pop()?.trim() || 'Best Practices and Strategies';
      titlePhrase = titlePhrase.replace(/^["']|["']$/g, ''); // Remove quotes if present
      
      // Create a title using the topic and the phrase
      titles.add(`${topic}: ${titlePhrase.charAt(0).toUpperCase() + titlePhrase.slice(1)}`);
    }
  });
  
  // If we don't have enough titles yet, add some SEO-optimized formats
  if (titles.size < 3) {
    const seoFormats = [
      `Ultimate Guide to ${topic} [${new Date().getFullYear()}]`,
      `${topic}: Expert Strategies That Drive Results`,
      `${topic} 101: Everything You Need to Know`,
      `The Complete ${topic} Framework for Success`,
      `${topic} Mastery: Proven Techniques and Tips`
    ];
    
    seoFormats.forEach(title => titles.add(title));
  }
  
  // Generate some randomness to ensure new titles on regeneration
  const randomSeed = Math.random();
  const shuffledTitles = Array.from(titles).sort(() => randomSeed - 0.5);
  
  return shuffledTitles.slice(0, 3);
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
  const [customTopic, setCustomTopic] = useState("");
  const [titleSuggestions, setTitleSuggestions] = useState<{[topic: string]: string[]}>({});
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [showCustomTopicInput, setShowCustomTopicInput] = useState(false);
  const [isEditingTopic, setIsEditingTopic] = useState<string | null>(null);
  const [editedTopicText, setEditedTopicText] = useState("");
  
  // Check if data is ready for content generation
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
  
  // Set selected keywords from keyword gaps cache
  useEffect(() => {
    if (keywordGapsCache.selectedKeywords && keywordGapsCache.selectedKeywords.length > 0) {
      setSelectedKeywords(keywordGapsCache.selectedKeywords);
    }
  }, []);
  
  // Generate initial topic suggestions
  const generateInitialTopics = () => {
    setIsLoadingTopics(true);
    
    try {
      const gaps = keywordGapsCache.data || [];
      const recommendations = recommendationsCache.data;
      const selectedKeywords = keywordGapsCache.selectedKeywords || [];
      
      console.log("Generating topics with domain:", domain);
      console.log("Selected keywords for topic generation:", selectedKeywords);
      
      const generatedTopics = generateTopicSuggestions(domain, gaps, recommendations, selectedKeywords);
      setTopics(generatedTopics);
      
      // Generate titles for each topic
      const titlesMap: {[topic: string]: string[]} = {};
      generatedTopics.forEach(topic => {
        titlesMap[topic] = generateTitleSuggestions(topic, gaps, recommendations, selectedKeywords);
      });
      
      setTitleSuggestions(titlesMap);
      setSelectedTopic("");
      setTitle("");
    } catch (error) {
      console.error("Error generating topics:", error);
      toast.error("Failed to generate topic suggestions");
    } finally {
      setIsLoadingTopics(false);
    }
  };
  
  // Handle adding a custom topic
  const handleAddCustomTopic = () => {
    if (!customTopic.trim()) {
      toast.error("Please enter a custom topic");
      return;
    }
    
    // Add the custom topic to the list
    const newTopic = customTopic.trim();
    setTopics(prev => [newTopic, ...prev.slice(0, 7)]);
    
    // Generate titles for the custom topic
    const gaps = keywordGapsCache.data || [];
    const recommendations = recommendationsCache.data;
    const selectedKeywords = keywordGapsCache.selectedKeywords || [];
    
    const titles = generateTitleSuggestions(newTopic, gaps, recommendations, selectedKeywords);
    
    setTitleSuggestions(prev => ({
      ...prev,
      [newTopic]: titles
    }));
    
    // Reset the input
    setCustomTopic("");
    setShowCustomTopicInput(false);
    
    toast.success("Custom topic created");
  };
  
  // Handle topic selection
  const handleSelectTopic = (topic: string) => {
    setSelectedTopic(topic);
    
    // Set the first title suggestion by default
    if (titleSuggestions[topic] && titleSuggestions[topic].length > 0) {
      setTitle(titleSuggestions[topic][0]);
    } else {
      setTitle(`${topic}: Complete Guide`);
    }
  };
  
  // Handle title selection
  const handleSelectTitle = (title: string) => {
    setTitle(title);
  };
  
  // Start editing a topic
  const handleStartEditingTopic = (topic: string) => {
    setIsEditingTopic(topic);
    setEditedTopicText(topic);
  };
  
  // Save edited topic
  const handleSaveEditedTopic = () => {
    if (!editedTopicText.trim() || !isEditingTopic) return;
    
    const newTopic = editedTopicText.trim();
    
    // Update topics list
    setTopics(prev => prev.map(t => t === isEditingTopic ? newTopic : t));
    
    // Move title suggestions to the new topic name
    if (titleSuggestions[isEditingTopic]) {
      setTitleSuggestions(prev => {
        const newTitleSuggestions = { ...prev };
        newTitleSuggestions[newTopic] = newTitleSuggestions[isEditingTopic];
        delete newTitleSuggestions[isEditingTopic];
        return newTitleSuggestions;
      });
    }
    
    // Update selected topic if it was being edited
    if (selectedTopic === isEditingTopic) {
      setSelectedTopic(newTopic);
    }
    
    setIsEditingTopic(null);
    toast.success("Topic updated");
  };
  
  // Delete a topic
  const handleDeleteTopic = (topicToDelete: string) => {
    // Update topics list
    setTopics(prev => prev.filter(topic => topic !== topicToDelete));
    
    // Remove title suggestions for the deleted topic
    setTitleSuggestions(prev => {
      const newTitleSuggestions = { ...prev };
      delete newTitleSuggestions[topicToDelete];
      return newTitleSuggestions;
    });
    
    // Reset selected topic if it was deleted
    if (selectedTopic === topicToDelete) {
      setSelectedTopic("");
      setTitle("");
    }
    
    toast.success("Topic removed");
  };
  
  // Regenerate topic suggestions with improved handling
  const handleRegenerateTopics = () => {
    setIsLoadingTopics(true);
    
    try {
      const gaps = keywordGapsCache.data || [];
      const recommendations = recommendationsCache.data;
      const selectedKeywords = keywordGapsCache.selectedKeywords || [];
      
      // Create a different randomSeed each time
      const randomSeed = Math.random() + new Date().getTime();
      console.log("Regenerating topics with seed:", randomSeed);
      
      const newTopics = generateTopicSuggestions(domain, gaps, recommendations, selectedKeywords);
      
      // Ensure we get different topics than what we currently have
      const currentTopicsSet = new Set(topics);
      const filteredNewTopics = newTopics.filter(topic => !currentTopicsSet.has(topic));
      
      if (filteredNewTopics.length < 3) {
        // If we don't have enough different topics, try again with different variations
        console.log("Not enough unique topics, generating alternatives");
        
        // Force some variation by changing the priority of keywords
        const reorderedKeywords = [...selectedKeywords].reverse();
        const alternativeTopics = generateTopicSuggestions(domain, gaps, recommendations, reorderedKeywords);
        
        // Generate titles for each new topic
        const titlesMap: {[topic: string]: string[]} = {};
        alternativeTopics.forEach(topic => {
          titlesMap[topic] = generateTitleSuggestions(topic, gaps, recommendations, selectedKeywords);
        });
        
        setTopics(alternativeTopics);
        setTitleSuggestions(titlesMap);
      } else {
        setTopics(newTopics);
        
        // Generate titles for each new topic
        const titlesMap: {[topic: string]: string[]} = {};
        newTopics.forEach(topic => {
          titlesMap[topic] = generateTitleSuggestions(topic, gaps, recommendations, selectedKeywords);
        });
        
        setTitleSuggestions(titlesMap);
      }
      
      setSelectedTopic("");
      setTitle("");
      
      toast.success("Generated new topic suggestions");
    } catch (error) {
      console.error("Error regenerating topics:", error);
      toast.error("Failed to regenerate topic suggestions");
    } finally {
      setIsLoadingTopics(false);
    }
  };
  
  // Generate content
  const handleGenerateContent = async () => {
    if (!title) {
      toast.error("Please enter a title for your content");
      return;
    }
    
    if (selectedKeywords.length === 0 && keywordGapsCache.selectedKeywords.length === 0) {
      toast.error("Please select at least one keyword from the Keyword Gaps card");
      return;
    }
    
    const keywordsToUse = selectedKeywords.length > 0 ? selectedKeywords : keywordGapsCache.selectedKeywords;
    
    setIsGenerating(true);
    setGeneratedContent(null);
    
    try {
      const content = await generateContent(
        domain,
        title,
        keywordsToUse,
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
  
  // Regenerate content
  const handleRegenerateContent = async () => {
    handleGenerateContent();
  };
  
  // Handle content editing
  const handleEditContent = () => {
    setIsEditing(true);
  };
  
  // Save edited content
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
  
  // Copy content to clipboard
  const handleCopy = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent.content);
      toast.success("Content copied to clipboard");
    }
  };
  
  // Download content as markdown file
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

  // If data isn't ready, show loading state
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
        <CardDescription>Create optimized content using selected keywords from your gaps analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList className="grid grid-cols-2 w-full max-w-sm mx-auto">
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="preview" disabled={!generatedContent}>Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="generate" className="space-y-6 pt-2">
            <div className="space-y-4">
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-medium">Selected Keywords</Label>
                  <Badge variant="outline">
                    {keywordGapsCache.selectedKeywords.length || 0}/10
                  </Badge>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {keywordGapsCache.selectedKeywords && keywordGapsCache.selectedKeywords.length > 0 ? (
                    keywordGapsCache.selectedKeywords.map((keyword, idx) => (
                      <Badge key={idx} className="bg-revology text-white">
                        {keyword}
                      </Badge>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground p-2">
                      No keywords selected. Please select keywords from the Keyword Gaps card.
                    </div>
                  )}
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-revology-dark">Content Topics</h3>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex items-center gap-1 h-8 px-2 text-xs border-revology/30 text-revology hover:bg-revology-light/50"
                      onClick={() => setShowCustomTopicInput(true)}
                    >
                      <Plus className="h-3 w-3" />
                      Add Topic
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex items-center gap-1 h-8 px-2 text-xs"
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
                </div>
                
                {showCustomTopicInput && (
                  <div className="flex gap-2 mb-4">
                    <Input
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                      placeholder="Enter custom topic"
                      className="flex-1"
                    />
                    <Button 
                      size="sm"
                      onClick={handleAddCustomTopic}
                      disabled={!customTopic.trim()}
                      className="bg-revology hover:bg-revology-dark"
                    >
                      Add
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => setShowCustomTopicInput(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
                
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  {isLoadingTopics ? (
                    <div className="col-span-2 flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : topics.length > 0 ? (
                    topics.map((topic, topicIndex) => (
                      <Card 
                        key={topicIndex} 
                        className={`overflow-hidden transition-all ${selectedTopic === topic ? 'border-revology/50 shadow-md' : ''}`}
                      >
                        <CardHeader className="py-3 px-4 bg-gradient-to-r from-revology-light/20 to-transparent">
                          {isEditingTopic === topic ? (
                            <div className="flex items-center gap-2">
                              <Input 
                                value={editedTopicText}
                                onChange={(e) => setEditedTopicText(e.target.value)}
                                className="flex-1"
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-green-600"
                                onClick={handleSaveEditedTopic}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base font-bold text-revology-dark">
                                {topic}
                              </CardTitle>
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleStartEditingTopic(topic)}
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleDeleteTopic(topic)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </CardHeader>
                        <CardContent className="pb-4 px-4">
                          <div className="space-y-2 mt-2">
                            {titleSuggestions[topic] ? (
                              titleSuggestions[topic].map((topicTitle, titleIndex) => (
                                <div 
                                  key={titleIndex}
                                  className={`p-2 rounded-md cursor-pointer text-sm ${
                                    selectedTopic === topic && title === topicTitle 
                                      ? 'bg-revology-light/30 text-revology border border-revology/30' 
                                      : 'bg-muted/50 hover:bg-muted'
                                  }`}
                                  onClick={() => {
                                    handleSelectTopic(topic);
                                    handleSelectTitle(topicTitle);
                                  }}
                                >
                                  {topicTitle}
                                </div>
                              ))
                            ) : (
                              <div className="text-sm text-muted-foreground">No title suggestions available</div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-8 text-muted-foreground">
                      No topics available. Try selecting keywords from the Keyword Gaps card or add a custom topic.
                    </div>
                  )}
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Selected Title</Label>
                  <Input 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Select a topic and title, or enter a custom title"
                    className={selectedTopic ? "border-revology/30 focus-visible:ring-revology/20" : ""}
                  />
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
              </div>
              
              <Button 
                className="w-full mt-6 bg-revology hover:bg-revology-dark" 
                onClick={handleGenerateContent}
                disabled={isGenerating || !title || (keywordGapsCache.selectedKeywords.length === 0)}
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
                        className="flex items-center gap-1 bg-revology hover:bg-revology-dark" 
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
