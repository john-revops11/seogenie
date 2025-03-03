
/**
 * Utilities for detecting RAG-enhanced content
 */

/**
 * Detects if content was generated using RAG enhancement
 */
export const isRagEnhancedContent = (content: string): boolean => {
  // Check for specific structural patterns often found in RAG-enhanced content
  const hasStructuredHeadings = (content.match(/<h[1-3]/g) || []).length > 3;
  const hasCitations = content.includes("according to") || content.includes("research shows");
  const hasDataPoints = content.includes("%") || content.match(/\d+(\.\d+)?%/) !== null;
  
  return hasStructuredHeadings && (hasCitations || hasDataPoints);
};

// Make sure exports are consistent
export const contentDetectorUtils = {
  isRagEnhancedContent
};
