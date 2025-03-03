
/**
 * Utilities for extracting examples from vector documents
 */

/**
 * Extracts examples from retrieved documents
 */
export const extractExamplesFromDocuments = (documents: Array<{
  id: string;
  score: number;
  metadata: Record<string, any>;
}>): string[] => {
  const examples: string[] = [];
  
  documents.forEach(doc => {
    if (doc.metadata.examples && Array.isArray(doc.metadata.examples)) {
      examples.push(...doc.metadata.examples);
    }
    
    // Extract a snippet from the text as an example
    if (doc.metadata.text && typeof doc.metadata.text === 'string') {
      const snippets = doc.metadata.text.split('. ').filter((s: string) => s.length > 30);
      if (snippets.length > 0) {
        examples.push(snippets[0] + '.');
      }
    }
  });
  
  return examples.slice(0, 5); // Limit to 5 examples
};
