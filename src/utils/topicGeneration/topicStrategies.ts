
import { formatTopicWithKeyword, getProfessionalTopicPatterns } from './topicPatterns';

/**
 * Represents a topic idea with metadata
 */
export interface TopicIdea {
  topic: string;
  primaryKeywords: string[];
  searchIntent: string;
  contentType: string;
  priority: 'high' | 'medium' | 'low';
}

/**
 * Generates topic ideas for high-value keywords
 */
export const generateHighValueTopics = (highValueKeywords: string[]): TopicIdea[] => {
  const topicIdeas: TopicIdea[] = [];
  const professionalTopicPatterns = getProfessionalTopicPatterns();
  
  highValueKeywords.forEach(keyword => {
    // Select a random pattern
    const randomPatternIndex = Math.floor(Math.random() * professionalTopicPatterns.length);
    const pattern = professionalTopicPatterns[randomPatternIndex];
    
    const formattedKeyword = keyword.charAt(0).toUpperCase() + keyword.slice(1);
    const topic = formatTopicWithKeyword(pattern, keyword);
    
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
  
  return topicIdeas;
};

/**
 * Generates topic ideas based on question keywords
 */
export const generateQuestionBasedTopics = (questionKeywords: string[]): TopicIdea[] => {
  const topicIdeas: TopicIdea[] = [];
  
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
  
  return topicIdeas;
};

/**
 * Generates topic ideas based on keyword groups
 */
export const generateKeywordGroupTopics = (keywordsToUse: string[]): TopicIdea[] => {
  const topicIdeas: TopicIdea[] = [];
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
  
  return topicIdeas;
};

/**
 * Generates trend analysis topics based on niche terms
 */
export const generateTrendTopics = (nicheTerms: string[]): TopicIdea[] => {
  const topicIdeas: TopicIdea[] = [];
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
  
  return topicIdeas;
};

/**
 * Generates industry-specific topics based on niche terms
 */
export const generateIndustryTopics = (nicheTerms: string[]): TopicIdea[] => {
  const topicIdeas: TopicIdea[] = [];
  
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
  
  return topicIdeas;
};
