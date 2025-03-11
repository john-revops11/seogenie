
import { SeoRecommendation } from "@/services/keywordService";
import { analyzeDomainNiche } from "./domainAnalysis";
import { 
  buildKeywordMetrics,
  getHighValueKeywords,
  getLongTailKeywords,
  getQuestionKeywords
} from "./topicGeneration/keywordAnalysis";
import {
  generateHighValueTopics,
  generateQuestionBasedTopics,
  generateKeywordGroupTopics,
  generateTrendTopics,
  generateIndustryTopics,
  TopicIdea
} from "./topicGeneration/topicStrategies";
import {
  prioritizeTopics,
  finalizeTopics
} from "./topicGeneration/topicSelection";

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
  console.log("Generating topic suggestions for:", domain);
  console.log("Selected keywords:", selectedKeywords);
  
  if ((!keywordGaps || keywordGaps.length === 0) && !seoRecommendations && selectedKeywords.length === 0) {
    return [];
  }
  
  // Gather all available SEO data
  const keywordsToUse = selectedKeywords.length > 0 
    ? selectedKeywords 
    : keywordGaps?.map(gap => gap.keyword) || [];
  
  // Map keywords to their metrics if available
  const keywordMetrics = buildKeywordMetrics(keywordsToUse, keywordGaps);
  
  // Get high-value keywords (high volume, high opportunity)
  const highValueKeywords = getHighValueKeywords(keywordMetrics);
  
  // Get long-tail keywords (3+ words)
  const longTailKeywords = getLongTailKeywords(keywordsToUse);
  
  // Get question-based keywords
  const questionKeywords = getQuestionKeywords(keywordsToUse);
  
  // Industry/niche detection based on keywords
  const nicheTerms = analyzeDomainNiche(domain, keywordsToUse);
  console.log("Niche terms for topic generation:", nicheTerms);
  
  // Content recommendations from SEO analysis
  const contentRecs = seoRecommendations?.content || [];
  
  // Store topic ideas with metadata
  const topicIdeas: TopicIdea[] = [];
  
  // Strategy 1: Create topics for high-value keywords
  topicIdeas.push(...generateHighValueTopics(highValueKeywords));
  
  // Strategy 2: Create authoritative guides based on question keywords
  topicIdeas.push(...generateQuestionBasedTopics(questionKeywords));
  
  // Strategy 3: Create strategic guides combining multiple related keywords
  topicIdeas.push(...generateKeywordGroupTopics(keywordsToUse));
  
  // Strategy 4: Use current year for trend analysis with authoritative tone
  topicIdeas.push(...generateTrendTopics(nicheTerms.slice(0, 3)));
  
  // Strategy 5: Create industry-specific strategy topics based on niche terms
  topicIdeas.push(...generateIndustryTopics(nicheTerms.slice(0, 5)));
  
  // Prioritize the best topics
  const prioritizedTopics = prioritizeTopics(topicIdeas);
  
  // Ensure uniqueness and add randomness
  return finalizeTopics(prioritizedTopics);
};
