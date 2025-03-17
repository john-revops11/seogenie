
import { ContentOutline } from "@/services/keywords/types";
import { v4 as uuidv4 } from 'uuid';

/**
 * Creates a content outline based on the title and custom subheadings if provided
 */
export function createContentOutline(
  title: string,
  customSubheadings?: string[]
): ContentOutline {
  if (customSubheadings && customSubheadings.length > 0) {
    return {
      headings: customSubheadings,
      faqs: [],
    };
  }
  
  // Default outline when no custom subheadings provided
  return {
    headings: [
      "Introduction",
      `What is ${title}`,
      "Key Benefits",
      "How to Implement",
      "Best Practices",
      "Conclusion"
    ],
    faqs: [],
  };
}
