
import { SeoRecommendation } from "@/services/keywordService";
import { analyzeDomainNiche } from "./domainAnalysis";

/**
 * Generates SEO-optimized content topics based on domain and keyword data
 */
export const generateTopicSuggestions = (
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
