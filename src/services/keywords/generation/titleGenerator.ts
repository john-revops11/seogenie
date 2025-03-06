
import { ContentTemplate } from '../types';

/**
 * Generates title suggestions based on keywords and content type
 */
export const generateTitleSuggestions = (
  primaryKeyword: string,
  relatedKeywords: string[] = [],
  contentType: string = 'blog'
): string[] => {
  const currentYear = new Date().getFullYear();
  
  // Base templates for different content types
  const templates: Record<string, string[]> = {
    blog: [
      `The Ultimate Guide to {keyword}`,
      `How to Master {keyword} in ${currentYear}`,
      `{keyword}: Everything You Need to Know`,
      `10 Essential {keyword} Strategies for Success`,
      `Why {keyword} Matters for Your Business`
    ],
    'how-to': [
      `How to {keyword} in ${currentYear}: Step-by-Step Guide`,
      `The Complete {keyword} Tutorial for Beginners`,
      `Master {keyword} in 7 Simple Steps`,
      `{keyword} Made Easy: A Beginner's Guide`,
      `How to {keyword} Like a Pro: Expert Tips`
    ],
    'case-study': [
      `How {companyPlaceholder} Achieved Success with {keyword}`,
      `{keyword} Case Study: Increasing Results by {percentPlaceholder}`,
      `{companyPlaceholder}'s {keyword} Strategy: A Success Story`,
      `From Challenge to Success: A {keyword} Case Study`,
      `{keyword} Implementation: Real-World Results`
    ],
    'white-paper': [
      `The State of {keyword} in ${currentYear}`,
      `{keyword}: Industry Analysis and Future Trends`,
      `Solving {keyword} Challenges: A Strategic Approach`,
      `{keyword} White Paper: Data-Driven Insights`,
      `The Future of {keyword}: Research and Analysis`
    ]
  };
  
  // Use blog templates as default if content type not found
  const typeTemplates = templates[contentType] || templates.blog;
  
  // Generate titles by replacing {keyword} with the primary keyword
  const suggestions = typeTemplates.map(template => {
    let title = template.replace('{keyword}', primaryKeyword);
    
    // Replace placeholders with sample data
    title = title.replace('{companyPlaceholder}', 'Company XYZ');
    title = title.replace('{percentPlaceholder}', '250%');
    
    return title;
  });
  
  // Add a few titles that combine primary keyword with related keywords
  if (relatedKeywords.length > 0) {
    const relatedKeyword = relatedKeywords[0];
    suggestions.push(`${primaryKeyword} and ${relatedKeyword}: The Complete Guide`);
    
    if (relatedKeywords.length > 1) {
      suggestions.push(`How ${primaryKeyword} Impacts ${relatedKeywords[1]}: What You Need to Know`);
    }
  }
  
  return suggestions;
};

/**
 * Legacy function to maintain backward compatibility
 */
export const getTopicTitles = async (
  topic: string,
  keywords: string[] = [],
  contentType: string = 'blog'
): Promise<string[]> => {
  return generateTitleSuggestions(topic, keywords, contentType);
};
