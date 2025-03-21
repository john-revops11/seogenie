import { ContentOutlineResult } from "../types/contentGeneratorTypes";

/**
 * Creates a content outline based on title and optional custom subheadings
 */
export function createContentOutline(
  title: string,
  customSubheadings?: string[]
): ContentOutlineResult {
  // If custom subheadings are provided, use them
  if (customSubheadings && customSubheadings.length > 0) {
    return {
      headings: customSubheadings
    };
  }
  
  // Otherwise, generate default headings based on the title
  return {
    headings: [
      "Introduction",
      `What is ${title}?`,
      `Benefits of ${title}`,
      `How to implement ${title}`,
      "Best practices",
      "Conclusion"
    ]
  };
}

/**
 * Creates a custom outline based on specified parameters
 */
export function createCustomOutline(
  title: string,
  contentType: string,
  keywords: string[]
): ContentOutlineResult {
  // Create different outlines based on content type
  switch (contentType.toLowerCase()) {
    case 'blog':
      return {
        headings: [
          "Introduction",
          `What is ${title}?`,
          `Benefits of ${title}`,
          `How to implement ${title}`,
          "Best practices",
          "Conclusion"
        ]
      };
    case 'guide':
      return {
        headings: [
          "Introduction",
          `Understanding ${title}`,
          "Step-by-step guide",
          "Common challenges",
          "Tips for success",
          "Conclusion"
        ]
      };
    case 'case study':
      return {
        headings: [
          "Background",
          "Challenge",
          "Solution",
          "Implementation",
          "Results",
          "Key learnings"
        ]
      };
    default:
      return {
        headings: [
          "Introduction",
          `About ${title}`,
          "Main points",
          "Details",
          "Conclusion"
        ]
      };
  }
}
