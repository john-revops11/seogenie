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

// Enhanced domain analysis function
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

// Enhanced topic suggestion function with stronger domain relevance
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
  
  // Perform deep domain niche analysis
  const keywordsToUse = selectedKeywords.length > 0 
    ? selectedKeywords 
    : keywordGaps?.map(gap => gap.keyword) || [];
  
  const nicheTerms = analyzeDomainNiche(domain, keywordsToUse);
  console.log("Niche terms for topic generation:", nicheTerms);
  
  const contentRecs = seoRecommendations?.content || [];
  
  // Use a Set to avoid duplicate topics
  const topics = new Set<string>();
  
  // First approach: Group keywords by semantic themes
  const keywordThemes: Record<string, string[]> = {};
  
  keywordsToUse.forEach(keyword => {
    // Check if keyword contains any niche terms
    const relevantNicheTerms = nicheTerms.filter(term => 
      keyword.toLowerCase().includes(term.toLowerCase())
    );
    
    if (relevantNicheTerms.length > 0) {
      // Use the most specific niche term (usually the longest one)
      const primaryTerm = relevantNicheTerms.sort((a, b) => b.length - a.length)[0];
      
      if (!keywordThemes[primaryTerm]) {
        keywordThemes[primaryTerm] = [];
      }
      keywordThemes[primaryTerm].push(keyword);
    } else {
      // For keywords without direct niche terms, group by first significant word
      const words = keyword.split(' ');
      const significantWord = words.find(w => w.length > 4) || words[0];
      
      if (!keywordThemes[significantWord]) {
        keywordThemes[significantWord] = [];
      }
      keywordThemes[significantWord].push(keyword);
    }
  });
  
  // Identify top themes based on keyword count and relevance
  const themeEntries = Object.entries(keywordThemes)
    .map(([theme, keywords]) => ({
      theme,
      keywords,
      nicheRelevance: nicheTerms.includes(theme) ? 3 : 
                      nicheTerms.some(term => theme.includes(term)) ? 2 : 1,
      keywordCount: keywords.length,
      // Calculate the average search volume if volume data is available
      avgVolume: keywords.reduce((sum, kw) => {
        const gap = keywordGaps.find(g => g.keyword === kw);
        return gap ? sum + gap.volume : sum;
      }, 0) / keywords.length
    }))
    .sort((a, b) => {
      // Sort first by niche relevance
      if (a.nicheRelevance !== b.nicheRelevance) {
        return b.nicheRelevance - a.nicheRelevance;
      }
      // Then by keyword count
      if (a.keywordCount !== b.keywordCount) {
        return b.keywordCount - a.keywordCount;
      }
      // Then by average volume
      return b.avgVolume - a.avgVolume;
    })
    .slice(0, 10); // Get top 10 themes
  
  console.log("Top keyword themes:", themeEntries.map(t => `${t.theme} (${t.keywords.length} keywords)`));
  
  // Generate topics based on top themes
  themeEntries.forEach(({theme, keywords}) => {
    // Format the theme name for usage in topics
    const themeFormatted = theme.charAt(0).toUpperCase() + theme.slice(1).toLowerCase();
    
    // Identify common modifiers in the keywords for this theme
    const modifiers = new Set<string>();
    keywords.forEach(kw => {
      const kwWords = kw.toLowerCase().split(' ');
      // Look for modifiers like "best", "top", "guide", etc.
      const commonModifiers = ['best', 'top', 'guide', 'how', 'why', 'what', 'when', 'where', 'complete', 'ultimate'];
      commonModifiers.forEach(mod => {
        if (kwWords.includes(mod)) {
          modifiers.add(mod);
        }
      });
    });
    
    // Create diverse topic variations using the theme and its related keywords
    const topicVariations = [
      `${themeFormatted} Optimization Guide for ${domain.replace(/https?:\/\//i, '').replace(/www\./i, '').split('.')[0].toUpperCase()}`,
      `Complete ${themeFormatted} Strategy for ${new Date().getFullYear()}`,
      `How to Improve Your ${themeFormatted} Performance`,
      `The Ultimate ${themeFormatted} Guide for ${domain.replace(/https?:\/\//i, '').replace(/www\./i, '').split('.')[0].charAt(0).toUpperCase() + domain.replace(/https?:\/\//i, '').replace(/www\./i, '').split('.')[0].slice(1)} Websites`,
      `${themeFormatted} Best Practices that Drive Results`,
    ];
    
    // If we have modifiers, use them to create additional topic variations
    if (modifiers.size > 0) {
      const modArray = Array.from(modifiers);
      if (modArray.includes('how')) {
        topics.add(`How to Master ${themeFormatted} for Better Visibility`);
      }
      
      if (modArray.includes('best') || modArray.includes('top')) {
        topics.add(`Top ${themeFormatted} Strategies for ${domain.replace(/https?:\/\//i, '').replace(/www\./i, '').split('.')[0].charAt(0).toUpperCase() + domain.replace(/https?:\/\//i, '').replace(/www\./i, '').split('.')[0].slice(1)} Sites`);
      }
      
      if (modArray.includes('guide') || modArray.includes('complete') || modArray.includes('ultimate')) {
        topics.add(`The Definitive ${themeFormatted} Blueprint`);
      }
    }
    
    // Add a few variations to the topics set
    topicVariations.slice(0, 2).forEach(topic => topics.add(topic));
  });
  
  // Second approach: Analyze SEO content recommendations for topic ideas
  if (contentRecs.length > 0) {
    contentRecs.forEach(rec => {
      const recommendation = rec.recommendation.toLowerCase();
      
      // Look for content recommendations that match the niche
      const matchesNiche = nicheTerms.some(term => 
        recommendation.includes(term.toLowerCase())
      );
      
      // Prioritize high-priority or niche-relevant recommendations
      if (rec.priority === 'high' || matchesNiche) {
        // Extract potential topics from the recommendation
        if (recommendation.includes('create content about') || 
            recommendation.includes('write about') || 
            recommendation.includes('focus on')) {
          // Try to extract the topic from different recommendation patterns
          let extractedTopic = '';
          
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
              extractedTopic = match[1].trim();
              break;
            }
          }
          
          if (extractedTopic) {
            const formattedTopic = extractedTopic.charAt(0).toUpperCase() + extractedTopic.slice(1);
            topics.add(`${formattedTopic}: A Comprehensive Guide`);
            topics.add(`Mastering ${formattedTopic} for Better Rankings`);
          }
        }
      }
    });
  }
  
  // Third approach: Create synthetic topics based on domain name and niche terms
  const domainName = domain.replace(/https?:\/\//i, '').replace(/www\./i, '').split('.')[0];
  const formattedDomainName = domainName.charAt(0).toUpperCase() + domainName.slice(1);
  
  // Use 2-3 of the most relevant niche terms to create domain-specific topics
  const topNicheTerms = nicheTerms.slice(0, 3);
  topNicheTerms.forEach(term => {
    const formattedTerm = term.charAt(0).toUpperCase() + term.slice(1);
    topics.add(`${formattedTerm} Strategies for ${formattedDomainName} Success`);
    topics.add(`How ${formattedDomainName} Experts Approach ${formattedTerm}`);
  });
  
  // Getting a clean array of topics and ensuring diversity
  let uniqueTopics = Array.from(topics);
  
  // Generate some randomness to ensure new topics on regeneration
  const randomSeed = Math.random();
  const shuffledTopics = [...uniqueTopics].sort(() => randomSeed - 0.5);
  
  // Ensure we have at least 8 topics
  if (shuffledTopics.length < 8 && nicheTerms.length > 0) {
    const genericTopics = [
      `${nicheTerms[0].charAt(0).toUpperCase() + nicheTerms[0].slice(1)} Optimization Guide`,
      `Best Practices for ${nicheTerms[0].charAt(0).toUpperCase() + nicheTerms[0].slice(1)}`,
      `${nicheTerms[0].charAt(0).toUpperCase() + nicheTerms[0].slice(1)} Strategy Framework`,
      `How to Improve Your ${nicheTerms[0].charAt(0).toUpperCase() + nicheTerms[0].slice(1)} Performance`,
      `${nicheTerms[0].charAt(0).toUpperCase() + nicheTerms[0].slice(1)} Trends and Insights`
    ];
    
    genericTopics.forEach(topic => {
      if (!topics.has(topic)) {
        topics.add(topic);
      }
    });
    
    uniqueTopics = Array.from(topics);
  }
  
  return shuffledTopics.slice(0, 8);
};

// Enhanced title suggestion function with SEO optimization
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
  
  // Prioritize selected keywords
  const keywordsToUse = selectedKeywords.length > 0 
    ? selectedKeywords 
    : keywordGaps?.map(gap => gap.keyword) || [];
  
  // Get domain name for branding titles
  const domainName = domain.replace(/https?:\/\//i, '').replace(/www\./i, '').split('.')[0];
  const formattedDomainName = domainName.charAt(0).toUpperCase() + domainName.slice(1);
  
  // Use a Set to avoid duplicate titles
  const titles = new Set<string>();
  
  // Find keywords related to the selected topic
  const topicWords = topic.toLowerCase().split(' ').filter(w => w.length > 3);
  const relatedKeywords = keywordsToUse.filter(keyword => {
    const keywordLower = keyword.toLowerCase();
    return topicWords.some(word => keywordLower.includes(word));
  });
  
  // Find high-volume, high-opportunity keywords for SEO optimization
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
  
  console.log("Related keywords for title suggestions:", prioritizedKeywords);
  
  // Generate titles that incorporate high-value keywords
  prioritizedKeywords.forEach(keyword => {
    // Format keyword for title usage
    const keywordFormat = keyword.charAt(0).toUpperCase() + keyword.slice(1);
    
    // Generate titles that incorporate both the topic and keyword
    titles.add(`${topic}: The Ultimate Guide to ${keywordFormat}`);
    titles.add(`How to Master ${keywordFormat} with Proven ${topic} Strategies`);
    
    // Add domain-branded titles for better relevance
    if (domain) {
      titles.add(`${formattedDomainName}'s Guide to ${keywordFormat} and ${topic}`);
    }
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
    
    if (containsTopicWord || rec.priority === 'high') {
      // Extract useful phrases from recommendation
      let titlePhrase = recommendation.split(':').pop()?.trim() || '';
      titlePhrase = titlePhrase.replace(/^["']|["']$/g, ''); // Remove quotes if present
      
      if (titlePhrase.length > 10) {
        // Create a title using the topic and the phrase
        const formattedPhrase = titlePhrase.charAt(0).toUpperCase() + titlePhrase.slice(1);
        titles.add(`${topic}: ${formattedPhrase}`);
      }
    }
  });
  
  // Ensure we have SEO-optimized title formats
  const currentYear = new Date().getFullYear();
  const seoFormats = [
    `${topic} in ${currentYear}: Complete Guide & Best Practices`,
    `The Ultimate ${topic} Framework for ${formattedDomainName} Success`,
    `${topic} Mastery: Step-by-Step Strategy for Better Results`,
    `${topic}: What Every ${formattedDomainName} Expert Should Know`,
    `${topic} Guide: Proven Strategies That Drive Rankings`
  ];
  
  seoFormats.forEach(title => titles.add(title));
  
  // Generate some randomness to ensure new titles on regeneration
  const randomSeed = Math.random();
  const shuffledTitles = Array.from(titles).sort(() => randomSeed - 0.5);
  
  // Return a good mix of titles (at least 5)
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
      
      // Remove the automatic topic generation
      // if (hasKeywordGaps && hasRecommendations) {
      //   generateInitialTopics();
      // }
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
      
      // Generate domain-relevant topics
      const generatedTopics = generateTopicSuggestions(domain, gaps, recommendations, selectedKeywords);
      setTopics(generatedTopics);
      
      // Generate titles for each topic with enhanced SEO relevance
      const titlesMap: {[topic: string]: string[]} = {};
      generatedTopics.forEach(topic => {
        titlesMap[topic] = generateTitleSuggestions(topic, gaps, recommendations, selectedKeywords, domain);
      });
      
      setTitleSuggestions(titlesMap);
      setSelectedTopic("");
      setTitle("");
      
      toast.success("Generated topic suggestions based on selected keywords");
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
      
      toast.success("Generated new topic suggestions");
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

  // Fix the download handler to use HTMLAnchorElement properly
  const handleDownload = () => {
    if (generatedContent) {
      const blob = new Blob([generatedContent.content], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${generatedContent.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.md`;
      document.body.appendChild(a);
      // Fix: Use HTMLAnchorElement click() method
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
                        Generating Topics...
                      </>
                    ) : (
                      <>
                        Generate Topics Based on Selected Keywords
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
                      {topics.length > 0 && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex items-center gap-1 h-8 px-2 text
