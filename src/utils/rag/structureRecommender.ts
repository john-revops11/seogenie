
/**
 * Utilities for generating content structure recommendations
 */

/**
 * Generates content structure recommendations based on retrieved documents and content type
 */
export const getStructuralRecommendations = (
  contentType: string,
  documents: Array<{
    id: string;
    score: number;
    metadata: Record<string, any>;
  }>
): string[] => {
  const recommendations: string[] = [];
  
  // Default recommendations based on content type
  switch (contentType) {
    case 'blog':
      recommendations.push(
        'Use a clear and concise introduction',
        'Include 3-5 main sections with H2 headings',
        'Add relevant examples in each section',
        'Conclude with actionable takeaways'
      );
      break;
    case 'white-paper':
      recommendations.push(
        'Start with an executive summary',
        'Include problem statement, methodology, and findings sections',
        'Use data visualizations to support key points',
        'End with recommendations and next steps'
      );
      break;
    case 'case-study':
      recommendations.push(
        'Begin with client background and challenge',
        'Describe the solution implementation',
        'Present results with specific metrics',
        'Include testimonials if available'
      );
      break;
    default:
      recommendations.push(
        'Use a logical structure with clear headings',
        'Include an introduction and conclusion',
        'Support claims with evidence and examples'
      );
  }
  
  // Add any structural recommendations from similar documents
  documents.forEach(doc => {
    if (doc.metadata.structuralRecommendations && 
        Array.isArray(doc.metadata.structuralRecommendations)) {
      recommendations.push(...doc.metadata.structuralRecommendations);
    }
  });
  
  // Return unique recommendations
  return Array.from(new Set(recommendations));
};

/**
 * Adds special case-study specific recommendations
 */
export const getCaseStudyRecommendations = (): string[] => {
  return [
    'Use a clear two-column layout for the client background section',
    'Structure the situation section in a grid layout with four key challenges',
    'Number the action steps from 1 to 4 for clarity',
    'Present results in distinct sections with clear headings for each outcome area'
  ];
};
