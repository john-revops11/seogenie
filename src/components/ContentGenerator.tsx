import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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

// Enhanced domain analysis function with more SEO focus
const analyzeDomainNiche = (domain: string, keywords: string[] = []): string[] => {
  const domainName = domain.replace(/https?:\/\//i, '').replace(/www\./i, '').split('.')[0];
  // Extract meaningful words from domain name
  const domainWords = domainName.split(/[^a-zA-Z0-9]/).filter(word => word.length > 3);
  
  // Extract common themes from keywords
  const allWords = keywords.flatMap(keyword => 
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
    .slice(0, 10)
    .map(([term]) => term);
  
  // Combine domain words with niche terms
  const relevantTerms = [...new Set([...domainWords, ...nicheTerms])];
  
  console.log("Domain niche analysis:", {
    domain,
    domainWords,
    topNicheTerms: nicheTerms,
    combinedRelevantTerms: relevantTerms
  });
  
  return relevantTerms;
};

// Updated more natural SEO-focused topic suggestion function with refined writing style
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
  
  // Gather all available SEO data
  const keywordsToUse = selectedKeywords.length > 0 
    ? selectedKeywords 
    : keywordGaps?.map(gap => gap.keyword) || [];
  
  // Map keywords to their metrics if available
  const keywordMetrics = keywordsToUse.map(keyword => {
    const gap = keywordGaps.find(g => g.keyword === keyword);
    return {
      keyword,
      volume: gap?.volume || 0,
      opportunity: gap?.opportunity || 'medium',
      difficulty: gap?.difficulty || 'medium'
    };
  });
  
  // Get high-value keywords (high volume, high opportunity)
  const highValueKeywords = keywordMetrics
    .filter(k => k.opportunity === 'high' || k.volume > 500)
    .map(k => k.keyword);
  
  // Get long-tail keywords (3+ words)
  const longTailKeywords = keywordsToUse
    .filter(keyword => keyword.split(' ').length >= 3);
  
  // Get question-based keywords
  const questionKeywords = keywordsToUse
    .filter(keyword => /^(how|what|why|when|where|which|who|is|can|does|do|will|should)/.test(keyword.toLowerCase()));
  
  // Industry/niche detection based on keywords
  const nicheTerms = analyzeDomainNiche(domain, keywordsToUse);
  console.log("Niche terms for topic generation:", nicheTerms);
  
  // Content recommendations from SEO analysis
  const contentRecs = seoRecommendations?.content || [];
  
  // Store topic ideas with metadata
  const topicIdeas: {
    topic: string;
    primaryKeywords: string[];
    searchIntent: string;
    contentType: string;
    priority: 'high' | 'medium' | 'low';
  }[] = [];
  
  // Topic patterns with professional, authoritative tone
  const professionalTopicPatterns = [
    // Topics with confident, analytical tone
    "Driving Growth Through {keyword}",
    "{keyword}: A Strategic Advantage",
    "Building Advanced {keyword} Capabilities",
    "Maximizing ROI with {keyword}",
    "Strategic {keyword} Implementation",
    "The {keyword} Framework for Success",
    "{keyword} Transformation in Action",
    "Elevating {keyword} Performance",
    "Future-Proofing Your {keyword} Strategy",
    "Unlocking Value with {keyword}"
  ];
  
  // Apply professional patterns to high-value keywords
  highValueKeywords.forEach(keyword => {
    // Select a random pattern
    const randomPatternIndex = Math.floor(Math.random() * professionalTopicPatterns.length);
    const pattern = professionalTopicPatterns[randomPatternIndex];
    
    // Format with proper capitalization and replace {keyword} placeholder
    const formattedKeyword = keyword.charAt(0).toUpperCase() + keyword.slice(1);
    const topic = pattern.replace('{keyword}', formattedKeyword);
    
    // Add to topic ideas
    topicIdeas.push({
      topic: topic,
      primaryKeywords: [keyword],
      searchIntent: 'commercial',
      contentType: 'business strategy',
      priority: 'high'
    });
    
    // Create a more specific topic variant with actionable focus
    topicIdeas.push({
      topic: `${formattedKeyword} Implementation: From Strategy to Action`,
      primaryKeywords: [keyword],
      searchIntent: 'commercial',
      contentType: 'implementation guide',
      priority: 'high'
    });
  });
  
  // Strategy 1: Create authoritative guides based on question keywords
  questionKeywords.forEach(keyword => {
    const baseKeyword = keyword.replace(/^(how|what|why|when|where|which|who|is|can|does|do|will|should)\s+/, '');
    
    // Format with proper capitalization
    const formattedKeyword = keyword.charAt(0).toUpperCase() + keyword.slice(1);
    const formattedBase = baseKeyword.charAt(0).toUpperCase() + baseKeyword.slice(1);
    
    // Generate topics with authoritative tone
    if (keyword.startsWith('how')) {
      topicIdeas.push({
        topic: `${formattedKeyword}: Practical Approaches`,
        primaryKeywords: [keyword, baseKeyword],
        searchIntent: 'informational',
        contentType: 'how-to guide',
        priority: 'high'
      });
    } else if (keyword.startsWith('what') || keyword.startsWith('why')) {
      topicIdeas.push({
        topic: `${formattedKeyword}: Critical Insights`,
        primaryKeywords: [keyword, baseKeyword],
        searchIntent: 'informational',
        contentType: 'educational',
        priority: 'high'
      });
    }
  });
  
  // Strategy 2: Create strategic guides combining multiple related keywords
  // Group related keywords
  const keywordGroups: {[key: string]: string[]} = {};
  
  keywordsToUse.forEach(keyword => {
    const words = keyword.toLowerCase().split(' ');
    
    // Try to find a main concept word (usually nouns)
    const mainConcept = words.find(w => w.length > 4) || words[0];
    
    if (!keywordGroups[mainConcept]) {
      keywordGroups[mainConcept] = [];
    }
    keywordGroups[mainConcept].push(keyword);
  });
  
  // Generate comprehensive guides for each keyword group with authoritative tone
  Object.entries(keywordGroups)
    .filter(([_, group]) => group.length >= 2) // Only use groups with multiple keywords
    .forEach(([concept, keywords]) => {
      const formattedConcept = concept.charAt(0).toUpperCase() + concept.slice(1);
      
      // Create authoritative topic
      topicIdeas.push({
        topic: `${formattedConcept} Strategy: Implementation & Optimization`,
        primaryKeywords: [concept, ...keywords.slice(0, 3)],
        searchIntent: 'commercial',
        contentType: 'strategy guide',
        priority: 'high'
      });
      
      // Create performance-focused topic
      topicIdeas.push({
        topic: `Measuring ${formattedConcept} Performance: Metrics That Matter`,
        primaryKeywords: [concept, ...keywords.slice(0, 2)],
        searchIntent: 'commercial',
        contentType: 'analytics guide',
        priority: 'high'
      });
    });
  
  // Strategy 3: Use current year for trend analysis with authoritative tone
  const currentYear = new Date().getFullYear();
  nicheTerms.slice(0, 3).forEach(term => {
    const formattedTerm = term.charAt(0).toUpperCase() + term.slice(1);
    
    topicIdeas.push({
      topic: `${currentYear} ${formattedTerm} Trends: Strategic Analysis`,
      primaryKeywords: [term, `${term} trends`, `${currentYear} ${term}`],
      searchIntent: 'informational',
      contentType: 'trend analysis',
      priority: 'high'
    });
  });
  
  // Strategy 4: Create industry-specific strategy topics based on niche terms
  nicheTerms.slice(0, 5).forEach(term => {
    const formattedTerm = term.charAt(0).toUpperCase() + term.slice(1);
    
    topicIdeas.push({
      topic: `${formattedTerm} Excellence: Leading Practices`,
      primaryKeywords: [term],
      searchIntent: 'commercial',
      contentType: 'industry guide',
      priority: 'medium'
    });
  });
  
  // Prioritize and select the best topics
  const prioritizedTopics = topicIdeas
    .sort((a, b) => {
      // Sort by priority first
      if (a.priority !== b.priority) {
        return a.priority === 'high' ? -1 : a.priority === 'medium' ? 0 : 1;
      }
      
      // Then by number of primary keywords
      return b.primaryKeywords.length - a.primaryKeywords.length;
    })
    .slice(0, 15) // Get top 15 ideas
    .map(idea => idea.topic);
  
  // Ensure uniqueness
  const uniqueTopics = [...new Set(prioritizedTopics)];
  
  // Add randomness for variation
  const shuffledTopics = [...uniqueTopics].sort(() => Math.random() - 0.5);
  
  return shuffledTopics.slice(0, 8); // Return top 8 topics
};

// Enhanced title suggestion function with authoritative tone
const generateTitleSuggestions = (
  topic: string,
  keywordGaps: any[] = [],
  seoRecommendations: {
    onPage: SeoRecommendation[];
    technical: SeoRecommendation[];
    content: SeoRecommendation[];
  } | null = null,
  selectedKeywords: string[] = [],
  domain: string = ""
): string[] => {
  if ((!keywordGaps || keywordGaps.length === 0) && !seoRecommendations) {
    // Provide authoritative default titles even without SEO data
    return [
      `${topic}: Strategies for Sustainable Growth`,
      `Unlocking The Potential of ${topic}`,
      `The Strategic Value of ${topic}`,
      `${topic}: A Competitive Advantage`,
      `Building Excellence in ${topic}`
    ];
  }
  
  // Gather all SEO data
  const keywordsToUse = selectedKeywords.length > 0 
    ? selectedKeywords 
    : keywordGaps?.map(gap => gap.keyword) || [];
  
  // Store potential titles with metadata
  const titleIdeas = new Set<string>();
  
  // Find topic-related keywords
  const topicWords = topic.toLowerCase().split(' ').filter(w => w.length > 3);
  const relatedKeywords = keywordsToUse.filter(keyword => {
    const keywordLower = keyword.toLowerCase();
    return topicWords.some(word => keywordLower.includes(word));
  });
  
  // Get keyword metrics if available
  const keywordMetrics = relatedKeywords.map(keyword => {
    const gap = keywordGaps.find(g => g.keyword === keyword);
    return {
      keyword,
      volume: gap?.volume || 0,
      opportunity: gap?.opportunity || 'medium'
    };
  });
  
  // Sort by opportunity and volume
  const bestKeywords = keywordMetrics
    .sort((a, b) => {
      if (a.opportunity === 'high' && b.opportunity !== 'high') return -1;
      if (a.opportunity !== 'high' && b.opportunity === 'high') return 1;
      return b.volume - a.volume;
    })
    .slice(0, 5)
    .map(item => item.keyword);
  
  console.log("Best keywords for title generation:", bestKeywords);
  
  // Current year for trending titles
  const currentYear = new Date().getFullYear();
  
  // Add titles with confident, authoritative tone
  titleIdeas.add(`Driving Growth Through ${topic}`);
  titleIdeas.add(`${topic}: Your Strategic Advantage`);
  titleIdeas.add(`Building Advanced ${topic} Capabilities`);
  
  // Additional professionally-toned title formats
  titleIdeas.add(`${topic} Optimization: A Systematic Approach`);
  titleIdeas.add(`The Impact of ${topic}: Measurement Framework`);
  titleIdeas.add(`Strategic ${topic} Implementation: A Practical Guide`);
  titleIdeas.add(`${topic} Analytics: Data-Driven Decision Making`);
  titleIdeas.add(`Transforming Your Approach to ${topic}`);
  
  // Format 1: Growth-focused titles with professional tone
  titleIdeas.add(`How ${topic} Drives Sustainable Growth`);
  titleIdeas.add(`${topic} as a Growth Engine: Case Analysis`);
  
  // Format 2: Strategic guidance titles with authoritative voice
  titleIdeas.add(`The Strategic Guide to ${topic}`);
  titleIdeas.add(`Building a Competitive Edge With ${topic}`);
  
  // Format 3: Industry leadership titles
  titleIdeas.add(`Leading With ${topic}: Industry Best Practices`);
  titleIdeas.add(`${topic} Transformation: The Path Forward`);
  
  // Format 4: Performance-focused titles
  titleIdeas.add(`Measuring ${topic} Success: Key Performance Indicators`);
  titleIdeas.add(`The Value of ${topic}: Impact Analysis`);
  
  // Format 5: Current year industry trends
  titleIdeas.add(`${currentYear} ${topic} Trends: Strategic Implications`);
  
  // Add titles that incorporate high-value keywords
  bestKeywords.forEach(keyword => {
    const formattedKeyword = keyword.charAt(0).toUpperCase() + keyword.slice(1);
    
    // Create professionally-toned variations
    titleIdeas.add(`${topic}: ${formattedKeyword} Best Practices`);
    titleIdeas.add(`Integrating ${topic} and ${formattedKeyword} for Optimal Results`);
  });
  
  // Add SEO-recommendation inspired titles
  const contentRecs = seoRecommendations?.content || [];
  contentRecs.forEach(rec => {
    if (rec.priority === 'high') {
      // Extract useful phrases from recommendation
      let titlePhrase = rec.recommendation.split(':').pop()?.trim() || '';
      titlePhrase = titlePhrase.replace(/^["']|["']$/g, ''); // Remove quotes if present
      
      if (titlePhrase.length > 10) {
        // Create a title combining topic and recommendation
        const formattedPhrase = titlePhrase.charAt(0).toUpperCase() + titlePhrase.slice(1);
        titleIdeas.add(`${topic}: ${formattedPhrase}`);
      }
    }
  });
  
  // Get a unique array of title ideas
  let uniqueTitles = Array.from(titleIdeas);
  
  // Add randomness for variation in suggested titles
  const randomSeed = Math.random();
  const shuffledTitles = [...uniqueTitles].sort(() => randomSeed - 0.5);
  
  // Return a diverse mix of titles (at least 5)
  return shuffledTitles.slice(0, Math.max(5, Math.min(shuffledTitles.length, 10)));
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
  const [isEditing, setIsEditing] = useState(isGenerating);
  const [editedContent, setEditedContent] = useState("");
  const [showCustomTopicInput, setShowCustomTopicInput] = useState(false);
  const [isEditingTopic, setIsEditingTopic] = useState<string | null>(null);
  const [editedTopicText, setEditedTopicText] = useState("");
  
  useEffect(() => {
    const checkDataReadiness = () => {
      const hasKeywordGaps = keywordGapsCache.data && keywordGapsCache.data.length > 0;
      const hasRecommendations = recommendationsCache.data && 
                                (recommendationsCache.data.onPage.length > 0 || 
                                 recommendationsCache.data.technical.length > 0 || 
                                 recommendationsCache.data.content.length > 0);
      
      setIsDataReady(hasKeywordGaps && hasRecommendations);
    };
    
    checkDataReadiness();
  }, [domain, allKeywords]);
  
  useEffect(() => {
    if (keywordGapsCache.selectedKeywords && keywordGapsCache.selectedKeywords.length > 0) {
      setSelectedKeywords(keywordGapsCache.selectedKeywords);
    }
  }, []);
  
  // This function will now need to be called explicitly
  const generateInitialTopics = () => {
    setIsLoadingTopics(true);
    
    try {
      const gaps = keywordGapsCache.data || [];
      const recommendations = recommendationsCache.data;
      const selectedKeywords = keywordGapsCache.selectedKeywords || [];
      
      // Only generate topics if we have selected keywords
      if (selectedKeywords.length === 0) {
        toast.error("Please select keywords from the Keyword Gaps card first");
        setIsLoadingTopics(false);
        return;
      }
      
      console.log("Generating topics with domain:", domain);
      console.log("Selected keywords for topic generation:", selectedKeywords);
      
      // Generate domain-relevant topics using enhanced algorithm
      const generatedTopics = generateTopicSuggestions(domain, gaps, recommendations, selectedKeywords);
      setTopics(generatedTopics);
      
      // Generate SEO-optimized titles for each topic
      const titlesMap: {[topic: string]: string[]} = {};
      generatedTopics.forEach(topic => {
        titlesMap[topic] = generateTitleSuggestions(topic, gaps, recommendations, selectedKeywords, domain);
      });
      
      setTitleSuggestions(titlesMap);
      setSelectedTopic("");
      setTitle("");
      
      toast.success("Generated SEO-optimized topic suggestions based on keyword gaps");
    } catch (error) {
      console.error("Error generating topics:", error);
      toast.error("Failed to generate topic suggestions");
    } finally {
      setIsLoadingTopics(false);
    }
  };
  
  const handleAddCustomTopic = () => {
    if (!customTopic.trim()) {
      toast.error("Please enter a custom topic");
      return;
    }
    
    // Add the custom topic to the list
    const newTopic = customTopic.trim();
    setTopics(prev => [newTopic, ...prev.slice(0, 7)]);
    
    // Generate SEO-optimized titles for the custom topic
    const gaps = keywordGapsCache.data || [];
    const recommendations = recommendationsCache.data;
    const selectedKeywords = keywordGapsCache.selectedKeywords || [];
    
    const titles = generateTitleSuggestions(newTopic, gaps, recommendations, selectedKeywords, domain);
    
    setTitleSuggestions(prev => ({
      ...prev,
      [newTopic]: titles
    }));
    
    // Reset the input
    setCustomTopic("");
    setShowCustomTopicInput(false);
    
    toast.success("Custom topic created");
  };
  
  const handleSelectTopic = (topic: string) => {
    setSelectedTopic(topic);
    
    // Set the first title suggestion by default
    if (titleSuggestions[topic] && titleSuggestions[topic].length > 0) {
      setTitle(titleSuggestions[topic][0]);
    } else {
      setTitle(`${topic}: Complete Guide`);
    }
  };
  
  const handleSelectTitle = (title: string) => {
    setTitle(title);
  };
  
  const handleStartEditingTopic = (topic: string) => {
    setIsEditingTopic(topic);
    setEditedTopicText(topic);
  };
  
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
  
  const handleRegenerateTopics = () => {
    setIsLoadingTopics(true);
    
    try {
      const gaps = keywordGapsCache.data || [];
      const recommendations = recommendationsCache.data;
      const selectedKeywords = keywordGapsCache.selectedKeywords || [];
      
      // Create a different randomSeed each time for more variety
      const randomSeed = Math.random() + new Date().getTime();
      console.log("Regenerating topics with random seed:", randomSeed);
      
      // Generate a fresh set of topics
      const newTopics = generateTopicSuggestions(domain, gaps, recommendations, selectedKeywords);
      
      // Ensure we get different topics than what we currently have
      const currentTopicsSet = new Set(topics);
      const filteredNewTopics = newTopics.filter(topic => !currentTopicsSet.has(topic));
      
      if (filteredNewTopics.length < 3) {
        // If we don't have enough different topics, force more variety
        console.log("Not enough unique topics, generating alternatives with different parameters");
        
        // Change the priority of keywords to get different themes
        const reorderedKeywords = [...selectedKeywords].reverse();
        
        // Try with a different approach by adjusting the seed and keywords
        const alternativeTopics = generateTopicSuggestions(domain, gaps, recommendations, reorderedKeywords);
        
        // Generate titles for each new topic
        const titlesMap: {[topic: string]: string[]} = {};
        alternativeTopics.forEach(topic => {
          titlesMap[topic] = generateTitleSuggestions(topic, gaps, recommendations, selectedKeywords, domain);
        });
        
        setTopics(alternativeTopics);
        setTitleSuggestions(titlesMap);
      } else {
        // Use the filtered new topics
        setTopics(filteredNewTopics);
        
        // Generate titles for each new topic
        const titlesMap: {[topic: string]: string[]} = {};
        filteredNewTopics.forEach(topic => {
          titlesMap[topic] = generateTitleSuggestions(topic, gaps, recommendations, selectedKeywords, domain);
        });
        
        setTitleSuggestions(titlesMap);
      }
      
      setSelectedTopic("");
      setTitle("");
      
      toast.success("Generated new SEO-optimized topic suggestions");
    } catch (error) {
      console.error("Error regenerating topics:", error);
      toast.error("Failed to regenerate topic suggestions");
    } finally {
      setIsLoadingTopics(false);
    }
  };
  
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
      (a as HTMLAnchorElement).click();
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
                
                {/* Button to generate topics */}
                {keywordGapsCache.selectedKeywords && keywordGapsCache.selectedKeywords.length > 0 && topics.length === 0 && (
                  <Button 
                    onClick={generateInitialTopics}
                    className="w-full bg-revology hover:bg-revology-dark"
                    disabled={isLoadingTopics}
                  >
                    {isLoadingTopics ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating SEO Topics...
                      </>
                    ) : (
                      <>
                        Generate SEO Topics Based on Keyword Gaps
                      </>
                    )}
                  </Button>
                )}
              </div>
              
              <Separator />
              
              {/* Only show topics section if we have topics or if user has selected keywords */}
              {(topics.length > 0 || keywordGapsCache.selectedKeywords?.length > 0) && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-revology-dark">SEO Content Topics</h3>
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
                      {topics.length > 0 && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex items-center gap-1 h-8 px-2 text-xs border-revology/30 text-revology hover:bg-revology-light/50"
                          onClick={handleRegenerateTopics}
                          disabled={isLoadingTopics}
                        >
                          <RefreshCw className={`h-3 w-3 ${isLoadingTopics ? 'animate-spin' : ''}`} />
                          Refresh
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Show custom topic input when needed */}
                  {showCustomTopicInput && (
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Enter a custom topic..."
                        value={customTopic}
                        onChange={(e) => setCustomTopic(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={handleAddCustomTopic} size="sm" className="bg-revology hover:bg-revology-dark">
                        Add
                      </Button>
                    </div>
                  )}
                  
                  {/* Display topics */}
                  {topics.length > 0 ? (
                    <ScrollArea className="rounded-md border p-2 h-[240px]">
                      <div className="grid grid-cols-1 gap-2">
                        {topics.map((topic, index) => (
                          <div key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-accent hover:
