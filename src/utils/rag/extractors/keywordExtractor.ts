
/**
 * Utilities for extracting keywords from vector documents
 */

/**
 * Extracts keywords from a list of documents
 */
export const extractKeywordsFromDocuments = (documents: Array<{
  id: string;
  score: number;
  metadata: Record<string, any>;
}>): string[] => {
  const keywordSet = new Set<string>();
  
  documents.forEach(doc => {
    // Extract keywords from metadata if available
    if (doc.metadata.keywords && Array.isArray(doc.metadata.keywords)) {
      doc.metadata.keywords.forEach((keyword: string) => keywordSet.add(keyword));
    }
    
    // Extract from tags if available
    if (doc.metadata.tags && Array.isArray(doc.metadata.tags)) {
      doc.metadata.tags.forEach((tag: string) => keywordSet.add(tag));
    }
  });
  
  return Array.from(keywordSet);
};
