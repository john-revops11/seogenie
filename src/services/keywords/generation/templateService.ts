
import { ContentTemplate } from '../types';

/**
 * Generates template based on content type
 */
export const getContentTemplates = (contentType: string): ContentTemplate[] => {
  const templates: Record<string, ContentTemplate[]> = {
    blog: [
      {
        id: 'blog-standard',
        name: 'Standard Blog Post',
        contentType: 'blog',
        structure: ['Introduction', 'Main Points (3-5)', 'Examples', 'Conclusion'],
        description: 'A classic blog post format with introduction, body, and conclusion.'
      },
      {
        id: 'blog-listicle',
        name: 'Listicle',
        contentType: 'blog',
        structure: ['Introduction', 'Numbered List Items', 'Conclusion'],
        description: 'A list-based article format that is easy to scan and read.'
      }
    ],
    'how-to': [
      {
        id: 'howto-step',
        name: 'Step-by-Step Guide',
        contentType: 'how-to',
        structure: ['Introduction', 'Materials/Prerequisites', 'Numbered Steps', 'Tips', 'Conclusion'],
        description: 'A detailed guide with clear, sequential steps.'
      },
      {
        id: 'howto-problem',
        name: 'Problem-Solution',
        contentType: 'how-to',
        structure: ['Problem Statement', 'Solution Overview', 'Implementation Steps', 'Troubleshooting', 'Conclusion'],
        description: 'Focuses on solving a specific problem with practical solutions.'
      }
    ],
    'case-study': [
      {
        id: 'case-standard',
        name: 'Standard Case Study',
        contentType: 'case-study',
        structure: ['Executive Summary', 'Challenge', 'Solution', 'Results', 'Testimonial'],
        description: 'The classic case study format highlighting challenges and results.'
      },
      {
        id: 'case-narrative',
        name: 'Narrative Case Study',
        contentType: 'case-study',
        structure: ['Background', 'Story Beginning', 'Conflict/Challenge', 'Resolution', 'Outcome', 'Lessons Learned'],
        description: 'Tells the story of the client journey in a narrative format.'
      }
    ],
    'white-paper': [
      {
        id: 'whitepaper-research',
        name: 'Research White Paper',
        contentType: 'white-paper',
        structure: ['Executive Summary', 'Introduction', 'Research Methodology', 'Findings', 'Analysis', 'Recommendations', 'Conclusion'],
        description: 'An in-depth research paper with data and analysis.'
      },
      {
        id: 'whitepaper-technical',
        name: 'Technical White Paper',
        contentType: 'white-paper',
        structure: ['Abstract', 'Problem Statement', 'Technology Overview', 'Solution Architecture', 'Implementation', 'Performance Analysis', 'Conclusion'],
        description: 'Focuses on technical aspects and solutions to complex problems.'
      }
    ]
  };
  
  return templates[contentType] || [];
};
