
/**
 * Professional topic patterns for content generation
 */
export const getProfessionalTopicPatterns = (): string[] => [
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

/**
 * Formats a topic pattern by replacing the {keyword} placeholder with the specified keyword
 */
export const formatTopicWithKeyword = (pattern: string, keyword: string): string => {
  // Format with proper capitalization and replace {keyword} placeholder
  const formattedKeyword = keyword.charAt(0).toUpperCase() + keyword.slice(1);
  return pattern.replace('{keyword}', formattedKeyword);
};
