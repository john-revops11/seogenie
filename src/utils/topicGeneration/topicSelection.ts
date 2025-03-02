
import { TopicIdea } from './topicStrategies';

/**
 * Prioritizes and selects the best topics based on criteria
 */
export const prioritizeTopics = (topicIdeas: TopicIdea[], limit: number = 15): string[] => {
  // Sort topics by priority and number of keywords
  const sortedTopics = [...topicIdeas].sort((a, b) => {
    // Sort by priority first
    if (a.priority !== b.priority) {
      return a.priority === 'high' ? -1 : a.priority === 'medium' ? 0 : 1;
    }
    
    // Then by number of primary keywords
    return b.primaryKeywords.length - a.primaryKeywords.length;
  });
  
  // Get top N ideas and extract topic strings
  const prioritizedTopics = sortedTopics
    .slice(0, limit)
    .map(idea => idea.topic);
  
  return prioritizedTopics;
};

/**
 * Ensures uniqueness and adds randomness to topics
 */
export const finalizeTopics = (prioritizedTopics: string[], limit: number = 8): string[] => {
  // Ensure uniqueness
  const uniqueTopics = [...new Set(prioritizedTopics)];
  
  // Add randomness for variation
  const shuffledTopics = [...uniqueTopics].sort(() => Math.random() - 0.5);
  
  // Return top N topics
  return shuffledTopics.slice(0, limit);
};
