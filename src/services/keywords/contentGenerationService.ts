
import { toast } from 'sonner';
import { ContentBlock, ContentOutline, ContentTemplate, GeneratedContent } from './types';
import { generateContentWithRAG } from '../vector/ragService';
import { isPineconeConfigured } from '../vector/pineconeService';
import { OPENAI_API_KEY } from './apiConfig';

/**
 * Generates content using OpenAI, optionally enhanced with RAG
 */
export const generateFullContent = async (
  title: string,
  outline: ContentOutline,
  keywords: string[],
  contentType: string,
  creativity: number = 50,
  preferences: string[] = [],
  useRag: boolean = false
): Promise<GeneratedContent | null> => {
  try {
    // First try RAG if enabled and configured
    if (useRag && isPineconeConfigured()) {
      try {
        const ragContent = await generateContentWithRAG(
          title,
          outline,
          keywords,
          contentType,
          creativity
        );
        
        if (ragContent) {
          // Fill in the actual content blocks using OpenAI
          const filledContent = await fillContentBlocks(
            ragContent,
            outline,
            keywords,
            contentType,
            creativity,
            preferences
          );
          
          return filledContent;
        } else {
          toast.warning("RAG generation failed, falling back to standard generation");
        }
      } catch (ragError) {
        console.error("Error in RAG content generation:", ragError);
        toast.warning("RAG generation failed, falling back to standard generation");
      }
    }
    
    // Standard generation without RAG
    return await generateStandardContent(
      title,
      outline, 
      keywords,
      contentType,
      creativity,
      preferences
    );
  } catch (error) {
    console.error("Error generating content:", error);
    toast.error(`Content generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    return null;
  }
};

/**
 * Generates content using just OpenAI (no RAG)
 */
const generateStandardContent = async (
  title: string,
  outline: ContentOutline,
  keywords: string[],
  contentType: string,
  creativity: number = 50,
  preferences: string[] = []
): Promise<GeneratedContent> => {
  const metaDescription = `${title} - Comprehensive guide covering ${keywords.slice(0, 3).join(', ')}`;
  
  // Initialize empty content blocks
  const initialBlocks: ContentBlock[] = [
    {
      id: `block-title-${Date.now()}`,
      type: 'heading1',
      content: `<h1>${title}</h1>`
    },
    {
      id: `block-intro-${Date.now()}`,
      type: 'paragraph',
      content: `<p>This is an introduction paragraph that will be generated with AI.</p>`
    }
  ];
  
  // Add heading blocks based on the outline
  outline.headings.forEach((heading, index) => {
    initialBlocks.push({
      id: `block-h2-${index}-${Date.now()}`,
      type: 'heading2',
      content: `<h2>${heading}</h2>`
    });
    
    // Add a placeholder paragraph after each heading
    initialBlocks.push({
      id: `block-p-${index}-${Date.now()}`,
      type: 'paragraph',
      content: `<p>Content for the "${heading}" section will be generated with AI.</p>`
    });
  });
  
  // Add FAQ section if requested in preferences
  if (preferences.includes('Add FAQ section')) {
    initialBlocks.push({
      id: `block-faq-heading-${Date.now()}`,
      type: 'heading2',
      content: `<h2>Frequently Asked Questions</h2>`
    });
    
    outline.faqs.forEach((faq, index) => {
      initialBlocks.push({
        id: `block-faq-q-${index}-${Date.now()}`,
        type: 'heading3',
        content: `<h3>${faq.question}</h3>`
      });
      
      initialBlocks.push({
        id: `block-faq-a-${index}-${Date.now()}`,
        type: 'paragraph',
        content: `<p>${faq.answer}</p>`
      });
    });
  }
  
  // Add conclusion
  initialBlocks.push({
    id: `block-conclusion-heading-${Date.now()}`,
    type: 'heading2',
    content: `<h2>Conclusion</h2>`
  });
  
  initialBlocks.push({
    id: `block-conclusion-${Date.now()}`,
    type: 'paragraph',
    content: `<p>Conclusion will be generated with AI.</p>`
  });
  
  const content: GeneratedContent = {
    title: title,
    metaDescription: metaDescription,
    outline: outline.headings,
    blocks: initialBlocks,
    keywords: keywords,
    contentType: contentType,
    generationMethod: 'standard'
  };
  
  // Fill in the content blocks with AI-generated content
  return await fillContentBlocks(
    content,
    outline, 
    keywords,
    contentType,
    creativity,
    preferences
  );
};

/**
 * Fills in content blocks with AI-generated content
 */
const fillContentBlocks = async (
  content: GeneratedContent,
  outline: ContentOutline,
  keywords: string[],
  contentType: string,
  creativity: number = 50,
  preferences: string[] = []
): Promise<GeneratedContent> => {
  if (!OPENAI_API_KEY) {
    toast.error("OpenAI API key is not configured");
    return content;
  }
  
  try {
    // Now we'll actually generate the content with OpenAI
    const updatedBlocks = [...content.blocks];
    let promptHeader = `Generate high-quality content for a ${contentType} about "${content.title}" targeting these keywords: ${keywords.join(', ')}.\n`;
    promptHeader += `Creativity level: ${creativity}%.\n`;
    
    if (preferences.length > 0) {
      promptHeader += `Content preferences: ${preferences.join(', ')}.\n`;
    }
    
    // Generate content for each paragraph block
    for (let i = 0; i < updatedBlocks.length; i++) {
      const block = updatedBlocks[i];
      
      if (block.type === 'paragraph') {
        let contextHeading = '';
        
        // Find the preceding heading to provide context
        for (let j = i - 1; j >= 0; j--) {
          if (updatedBlocks[j].type.startsWith('heading')) {
            contextHeading = updatedBlocks[j].content.replace(/<\/?[^>]+(>|$)/g, ""); // Remove HTML tags
            break;
          }
        }
        
        let prompt = promptHeader;
        if (contextHeading) {
          prompt += `\nGenerate a detailed paragraph for the section "${contextHeading}".\n`;
        }
        
        // Try primary model (GPT-4o-mini) first
        try {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                {
                  role: 'system',
                  content: 'You are a professional content writer specializing in SEO-optimized content. Write engaging, informative paragraphs that naturally incorporate keywords.'
                },
                {
                  role: 'user',
                  content: prompt
                }
              ],
              temperature: creativity / 100,
              max_tokens: 500
            })
          });
          
          if (!response.ok) {
            throw new Error(`OpenAI API error with gpt-4o-mini: ${response.status}`);
          }
          
          const data = await response.json();
          const generatedContent = data.choices[0].message.content.trim();
          updatedBlocks[i] = {
            ...block,
            content: `<p>${generatedContent}</p>`
          };
        } catch (primaryModelError) {
          console.warn("Primary model (gpt-4o-mini) failed, trying GPT-4:", primaryModelError);
          
          // Try GPT-4 as first fallback
          try {
            const fallbackResponse = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                  {
                    role: 'system',
                    content: 'You are a professional content writer specializing in SEO-optimized content. Write engaging, informative paragraphs that naturally incorporate keywords.'
                  },
                  {
                    role: 'user',
                    content: prompt
                  }
                ],
                temperature: creativity / 100,
                max_tokens: 500
              })
            });
            
            if (!fallbackResponse.ok) {
              throw new Error(`OpenAI API error with gpt-4: ${fallbackResponse.status}`);
            }
            
            const fallbackData = await fallbackResponse.json();
            const generatedContent = fallbackData.choices[0].message.content.trim();
            updatedBlocks[i] = {
              ...block,
              content: `<p>${generatedContent}</p>`
            };
          } catch (gpt4Error) {
            console.warn("GPT-4 fallback failed, trying GPT-3.5-turbo as final fallback:", gpt4Error);
            
            // Try GPT-3.5-turbo as final fallback
            try {
              const finalFallbackResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${OPENAI_API_KEY}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  model: 'gpt-3.5-turbo',
                  messages: [
                    {
                      role: 'system',
                      content: 'You are a professional content writer specializing in SEO-optimized content. Write engaging, informative paragraphs that naturally incorporate keywords.'
                    },
                    {
                      role: 'user',
                      content: prompt
                    }
                  ],
                  temperature: creativity / 100,
                  max_tokens: 500
                })
              });
              
              if (!finalFallbackResponse.ok) {
                throw new Error(`All models failed. Final error: ${finalFallbackResponse.status}`);
              }
              
              const finalFallbackData = await finalFallbackResponse.json();
              const generatedContent = finalFallbackData.choices[0].message.content.trim();
              updatedBlocks[i] = {
                ...block,
                content: `<p>${generatedContent}</p>`
              };
            } catch (finalError) {
              console.error("All OpenAI models failed:", finalError);
              throw new Error("All available AI models failed to generate content");
            }
          }
        }
      }
    }
    
    // Update the content with the filled blocks
    return {
      ...content,
      blocks: updatedBlocks
    };
  } catch (error) {
    console.error("Error filling content blocks:", error);
    toast.error(`Content generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    return content;
  }
};

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
