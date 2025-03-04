import { SeoRecommendation } from "@/services/keywordService";

/**
 * Generates SEO-optimized title suggestions for a given topic
 */
export const generateTitleSuggestions = (
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
      let titlePhrase = rec.title.split(':').pop()?.trim() || '';
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
