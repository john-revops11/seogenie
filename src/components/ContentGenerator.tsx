
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

// Improved SEO-focused topic suggestion function
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
  
  // Domain information for branding
  const domainName = domain.replace(/https?:\/\//i, '').replace(/www\./i, '').split('.')[0];
  const formattedDomainName = domainName.charAt(0).toUpperCase() + domainName.slice(1);
  
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
  
  // Strategy 1: Create how-to guides based on question keywords
  questionKeywords.forEach(keyword => {
    const baseKeyword = keyword.replace(/^(how|what|why|when|where|which|who|is|can|does|do|will|should)\s+/, '');
    
    // Format with proper capitalization
    const formattedKeyword = keyword.charAt(0).toUpperCase() + keyword.slice(1);
    
    // Generate topic with multiple formats
    topicIdeas.push({
      topic: `${formattedKeyword}: A Complete Guide for ${formattedDomainName} Professionals`,
      primaryKeywords: [keyword, baseKeyword],
      searchIntent: 'informational',
      contentType: 'how-to guide',
      priority: 'high'
    });
    
    // Add secondary formats
    if (keyword.startsWith('how')) {
      topicIdeas.push({
        topic: `${formattedKeyword} in ${new Date().getFullYear()}: Step-by-Step Tutorial`,
        primaryKeywords: [keyword, baseKeyword, `${baseKeyword} tutorial`],
        searchIntent: 'informational',
        contentType: 'tutorial',
        priority: 'high'
      });
    }
  });
  
  // Strategy 2: Create list-based articles from high-value keywords
  highValueKeywords.forEach(keyword => {
    const formattedKeyword = keyword.charAt(0).toUpperCase() + keyword.slice(1);
    
    // Generate list-based topic
    topicIdeas.push({
      topic: `Top 10 ${formattedKeyword} Strategies for ${formattedDomainName} Success`,
      primaryKeywords: [keyword],
      searchIntent: 'informational',
      contentType: 'listicle',
      priority: 'high'
    });
    
    // Add comparison format
    topicIdeas.push({
      topic: `${formattedKeyword} vs Traditional Approaches: What ${formattedDomainName} Experts Need to Know`,
      primaryKeywords: [keyword, `${keyword} comparison`],
      searchIntent: 'commercial investigation',
      contentType: 'comparison',
      priority: 'medium'
    });
  });
  
  // Strategy 3: Create comprehensive guides combining multiple related keywords
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
  
  // Generate comprehensive guides for each keyword group
  Object.entries(keywordGroups)
    .filter(([_, group]) => group.length >= 2) // Only use groups with multiple keywords
    .forEach(([concept, keywords]) => {
      const formattedConcept = concept.charAt(0).toUpperCase() + concept.slice(1);
      
      // Create ultimate guide topic
      topicIdeas.push({
        topic: `The Ultimate ${formattedConcept} Guide: Everything ${formattedDomainName} Professionals Should Know`,
        primaryKeywords: [concept, ...keywords.slice(0, 3)],
        searchIntent: 'informational',
        contentType: 'comprehensive guide',
        priority: 'high'
      });
      
      // Create industry-specific topic
      topicIdeas.push({
        topic: `${formattedConcept} in ${formattedDomainName}: Best Practices, Tips, and Strategies`,
        primaryKeywords: [concept, ...keywords.slice(0, 2)],
        searchIntent: 'informational',
        contentType: 'industry guide',
        priority: 'medium'
      });
    });
  
  // Strategy 4: Leverage SEO content recommendations
  if (contentRecs.length > 0) {
    contentRecs.forEach(rec => {
      if (rec.priority === 'high') {
        const recommendation = rec.recommendation.toLowerCase();
        
        // Extract potential topics from recommendations
        const patterns = [
          /create content about ["'](.+?)["']/i,
          /write about ["'](.+?)["']/i,
          /focus on ["'](.+?)["']/i,
          /create (.+?) content/i,
          /focus on (.+?)(?:\.|$)/i
        ];
        
        for (const pattern of patterns) {
          const match = recommendation.match(pattern);
          if (match && match[1]) {
            const extractedTopic = match[1].trim();
            const formattedTopic = extractedTopic.charAt(0).toUpperCase() + extractedTopic.slice(1);
            
            // Create a topic based on the recommendation
            topicIdeas.push({
              topic: `${formattedTopic}: A Comprehensive Guide for ${formattedDomainName}`,
              primaryKeywords: [extractedTopic],
              searchIntent: 'informational',
              contentType: 'expert guide',
              priority: 'high'
            });
            
            break;
          }
        }
      }
    });
  }
  
  // Strategy 5: Use current year for trending topics
  const currentYear = new Date().getFullYear();
  nicheTerms.slice(0, 3).forEach(term => {
    const formattedTerm = term.charAt(0).toUpperCase() + term.slice(1);
    
    topicIdeas.push({
      topic: `${currentYear} ${formattedTerm} Trends Every ${formattedDomainName} Professional Should Follow`,
      primaryKeywords: [term, `${term} trends`, `${currentYear} ${term}`],
      searchIntent: 'informational',
      contentType: 'trend analysis',
      priority: 'high'
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

// Enhanced title suggestion function optimized for SEO
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
    return [
      `Complete Guide to ${topic}`,
      `${topic}: Best Practices for ${new Date().getFullYear()}`,
      `Mastering ${topic}: Expert Strategies`
    ];
  }
  
  // Gather all SEO data
  const keywordsToUse = selectedKeywords.length > 0 
    ? selectedKeywords 
    : keywordGaps?.map(gap => gap.keyword) || [];
  
  // Domain name for branding
  const domainName = domain.replace(/https?:\/\//i, '').replace(/www\./i, '').split('.')[0];
  const formattedDomainName = domainName.charAt(0).toUpperCase() + domainName.slice(1);
  
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
  
  // Generate title formats optimized for click-through rate
  
  // Format 1: Number-based listicles (high CTR)
  titleIdeas.add(`Top 10 ${topic} Strategies for ${formattedDomainName} in ${currentYear}`);
  titleIdeas.add(`7 Proven ${topic} Techniques That Drive Real Results`);
  
  // Format 2: How-to guides (high CTR for informational intent)
  titleIdeas.add(`How to Master ${topic}: A Step-by-Step Guide for ${formattedDomainName} Professionals`);
  titleIdeas.add(`The Complete Guide to ${topic}: Everything You Need to Know`);
  
  // Format 3: Ultimate/Definitive guides (authoritative)
  titleIdeas.add(`The Ultimate ${topic} Guide for ${formattedDomainName} Success`);
  titleIdeas.add(`The Definitive ${topic} Framework: A ${currentYear} Perspective`);
  
  // Format 4: Question-based titles (engage curiosity)
  titleIdeas.add(`What Makes ${topic} Essential for ${formattedDomainName}? Expert Insights`);
  titleIdeas.add(`Why ${topic} Matters: Key Strategies for ${formattedDomainName} Growth`);
  
  // Format 5: Case study/Results-oriented
  titleIdeas.add(`${topic} Case Study: How ${formattedDomainName} Achieved Breakthrough Results`);
  titleIdeas.add(`${topic} ROI: Measuring the Impact on ${formattedDomainName} Performance`);
  
  // Add titles that incorporate high-value keywords from gaps analysis
  bestKeywords.forEach(keyword => {
    const formattedKeyword = keyword.charAt(0).toUpperCase() + keyword.slice(1);
    
    // Create variations incorporating both topic and high-value keyword
    titleIdeas.add(`${topic}: The Strategic Approach to ${formattedKeyword}`);
    titleIdeas.add(`How ${formattedDomainName} Experts Use ${topic} to Optimize ${formattedKeyword}`);
    
    // Add data-driven titles (high CTR)
    titleIdeas.add(`${topic} Data Analysis: Unlocking the Power of ${formattedKeyword}`);
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
  const [isEditing, setIsEditing] = useState(false);
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
                        onChange={e => setCustomTopic(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        size="sm"
                        onClick={handleAddCustomTopic}
                        className="bg-revology hover:bg-revology-dark"
                      >
                        <Check className="h-4 w-4" />
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
                  
                  {/* Topic list */}
                  {topics.length > 0 ? (
                    <ScrollArea className="h-[200px] rounded-md border p-4">
                      <div className="space-y-2">
                        {topics.map((topic, index) => (
                          <div 
                            key={index}
                            className={`p-2 rounded hover:bg-accent/50 transition-colors cursor-pointer relative group ${selectedTopic === topic ? 'bg-accent' : ''}`}
                            onClick={() => isEditingTopic !== topic && handleSelectTopic(topic)}
                          >
                            {isEditingTopic === topic ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  value={editedTopicText}
                                  onChange={e => setEditedTopicText(e.target.value)}
                                  className="flex-1 text-sm"
                                  autoFocus
                                />
                                <Button 
                                  size="xs" 
                                  onClick={handleSaveEditedTopic}
                                  className="h-7 py-0 px-2 text-xs bg-revology hover:bg-revology-dark"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <>
                                <span className="text-sm font-medium">{topic}</span>
                                <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button 
                                    size="xs" 
                                    variant="ghost" 
                                    className="h-6 w-6 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStartEditingTopic(topic);
                                    }}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button 
                                    size="xs" 
                                    variant="ghost" 
                                    className="h-6 w-6 p-0 text-destructive"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteTopic(topic);
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : keywordGapsCache.selectedKeywords?.length > 0 && (
                    <div className="flex justify-center items-center p-6 rounded-md border">
                      <div className="text-center">
                        <RefreshCw className="h-10 w-10 text-muted-foreground/50 mx-auto mb-4" />
                        <h4 className="text-sm font-medium">Generate Topics</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Use the button above to generate SEO-optimized topics based on your selected keywords.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Title selection when a topic is selected */}
                  {selectedTopic && (
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-revology-dark">Suggested Titles</h3>
                        <Badge variant="outline" className="text-xs">
                          Based on "{selectedTopic}"
                        </Badge>
                      </div>
                      
                      <ScrollArea className="h-[150px] rounded-md border p-4">
                        <div className="space-y-2">
                          {titleSuggestions[selectedTopic]?.map((suggestion, index) => (
                            <div 
                              key={index}
                              className={`p-2 rounded hover:bg-accent/50 transition-colors cursor-pointer ${title === suggestion ? 'bg-accent' : ''}`}
                              onClick={() => handleSelectTitle(suggestion)}
                            >
                              <span className="text-sm">{suggestion}</span>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      
                      <div className="space-y-2">
                        <Label htmlFor="custom-title">Custom Title</Label>
                        <Input 
                          id="custom-title" 
                          value={title} 
                          onChange={e => setTitle(e.target.value)}
                          placeholder="Enter a custom title..."
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Content generation configuration */}
                  {selectedTopic && (
                    <div className="mt-6 space-y-4">
                      <Separator />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="content-type">Content Type</Label>
                          <Select value={contentType} onValueChange={setContentType}>
                            <SelectTrigger id="content-type">
                              <SelectValue placeholder="Select content type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="blog">Blog Post</SelectItem>
                              <SelectItem value="article">Article</SelectItem>
                              <SelectItem value="guide">Comprehensive Guide</SelectItem>
                              <SelectItem value="tutorial">Tutorial</SelectItem>
                              <SelectItem value="case-study">Case Study</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="creativity">AI Creativity</Label>
                            <span className="text-xs text-muted-foreground">{creativity}%</span>
                          </div>
                          <Slider
                            id="creativity"
                            min={10}
                            max={90}
                            step={10}
                            value={[creativity]}
                            onValueChange={(value) => setCreativity(value[0])}
                            className="cursor-pointer"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Factual</span>
                            <span>Creative</span>
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={handleGenerateContent}
                        className="w-full mt-6 bg-revology hover:bg-revology-dark"
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating Content...
                          </>
                        ) : (
                          <>
                            Generate SEO-Optimized Content
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="space-y-6">
            {generatedContent ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">{generatedContent.title}</h2>
                  <p className="text-muted-foreground italic">{generatedContent.metaDescription}</p>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Content Outline</h3>
                  <div className="rounded-md border p-4 bg-accent/10">
                    <ul className="list-disc list-inside space-y-1">
                      {generatedContent.outline.map((item, index) => (
                        <li key={index} className="text-sm">{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Content</h3>
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <Button size="sm" onClick={handleSaveEdits} className="bg-green-600 hover:bg-green-700">
                            <Check className="mr-1 h-4 w-4" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={handleEditContent}>
                            <Edit className="mr-1 h-4 w-4" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCopy}>
                            <Copy className="mr-1 h-4 w-4" />
                            Copy
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleDownload}>
                            <Download className="mr-1 h-4 w-4" />
                            Download
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {isEditing ? (
                    <Textarea
                      value={editedContent}
                      onChange={e => setEditedContent(e.target.value)}
                      className="min-h-[400px] font-mono text-sm"
                    />
                  ) : (
                    <div className="rounded-md border p-6 max-h-[500px] overflow-y-auto">
                      <div className="prose prose-sm max-w-none">
                        {generatedContent.content.split("\n").map((paragraph, index) => {
                          if (paragraph.startsWith("# ")) {
                            return <h1 key={index} className="text-xl font-bold mt-6 mb-4">{paragraph.replace("# ", "")}</h1>;
                          } else if (paragraph.startsWith("## ")) {
                            return <h2 key={index} className="text-lg font-bold mt-6 mb-3">{paragraph.replace("## ", "")}</h2>;
                          } else if (paragraph.startsWith("### ")) {
                            return <h3 key={index} className="text-md font-bold mt-5 mb-2">{paragraph.replace("### ", "")}</h3>;
                          } else if (paragraph.startsWith("- ")) {
                            return <li key={index} className="ml-6">{paragraph.replace("- ", "")}</li>;
                          } else if (paragraph.trim() === "") {
                            return <br key={index} />;
                          } else {
                            return <p key={index} className="mb-3">{paragraph}</p>;
                          }
                        })}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-center mt-6">
                  <Button 
                    onClick={handleRegenerateContent}
                    className="bg-revology hover:bg-revology-dark"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Regenerating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Regenerate Content
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileEdit className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold">No content generated yet</h3>
                <p className="mt-2 text-muted-foreground max-w-md">
                  Generate content from the "Generate" tab to preview it here.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ContentGenerator;
