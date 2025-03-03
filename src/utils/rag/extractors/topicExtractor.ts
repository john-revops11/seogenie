
/**
 * Utilities for extracting topics from vector documents
 */

/**
 * Extracts topics from a list of documents
 */
export const extractTopicsFromDocuments = (documents: Array<{
  id: string;
  score: number;
  metadata: Record<string, any>;
}>): string[] => {
  const topicSet = new Set<string>();
  
  documents.forEach(doc => {
    if (doc.metadata.topics && Array.isArray(doc.metadata.topics)) {
      doc.metadata.topics.forEach((topic: string) => topicSet.add(topic));
    }
    
    // Also consider title as a topic
    if (doc.metadata.title) {
      topicSet.add(doc.metadata.title);
    }
  });
  
  return Array.from(topicSet);
};
