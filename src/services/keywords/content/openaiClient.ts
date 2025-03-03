
import { OPENAI_API_KEY } from '../apiConfig';
import { GeneratedContent } from './contentTypes';

/**
 * Makes a call to the OpenAI API to generate content
 */
export const callOpenAiApi = async (
  systemPrompt: string,
  userPrompt: string,
  temperature: number,
  model?: string
): Promise<GeneratedContent> => {
  // Get selected model from localStorage or default to gpt-4o
  const selectedModel = model || localStorage.getItem('selectedAiModel') || 'gpt-4o';
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: selectedModel,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      temperature,
      response_format: { type: 'json_object' }
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`OpenAI API error (${response.status}):`, errorText);
    throw new Error(`OpenAI API error: ${response.status}`);
  }
  
  const data = await response.json();
  const result = JSON.parse(data.choices[0].message.content);
  
  return {
    title: result.title || "",
    metaDescription: result.metaDescription,
    outline: result.outline,
    content: result.content,
    ragEnhanced: result.ragEnhanced || false
  };
};

/**
 * Create system prompt for content generation
 */
export const createSystemPrompt = (domain: string): string => {
  return `You are an expert content creator for ${domain}, specializing in business content creation.
  You create high-quality, engaging content that naturally incorporates target keywords and follows specific structural guidelines based on content type.
  Your content is well-structured with proper HTML formatting, provides value to business professionals, and helps websites rank in search engines.
  
  IMPORTANT HTML FORMATTING RULES:
  1. Use semantic HTML with proper hierarchy: <h1> for main title (only one per document), <h2> for major sections, <h3> for subsections
  2. Wrap each paragraph in <p> tags
  3. Use <ul> and <li> for unordered lists, <ol> and <li> for ordered lists
  4. Use <strong> or <b> to emphasize important points
  5. Use <em> or <i> for italicized text
  6. Break content into logical sections with appropriate headings
  7. Ensure each heading has relevant content below it
  8. Do not use deprecated HTML tags
  9. Each block of content should be wrapped in appropriate HTML tags
  10. For case studies, create a visually structured layout using appropriate HTML elements
  
  Ensure your tone and approach are appropriate for a business audience - professional, data-driven, and actionable.`;
};

/**
 * Create user prompt for content generation
 */
export const createUserPrompt = (
  contentBrief: string,
  keywords: string[],
  domain: string,
  title: string,
  contentType: string,
  wasRagEnhanced: boolean
): string => {
  return `${contentBrief}
  
  The content should target the following keywords: ${keywords.join(', ')}
  
  Domain: ${domain}
  
  Please create:
  1. A compelling title (if different from "${title}")
  2. An SEO-optimized meta description (150-160 characters)
  3. A detailed content outline with sections
  4. The full content with proper HTML formatting specific to the selected content type (${contentType})
  
  Make sure the content:
  - Uses proper HTML formatting with correct heading hierarchy (<h1>, <h2>, <h3>, etc.)
  - Has consistent alignment and spacing for readability
  - Naturally incorporates the target keywords (don't force them)
  - Provides actual value and isn't just keyword stuffing
  - Has a clear structure with proper HTML headings and subheadings
  - Includes a strong introduction and conclusion
  - Is engaging and tailored to business professionals
  - Uses appropriate paragraph breaks, lists (<ul>, <ol>), and other HTML elements for clarity
  
  Format your response as a JSON object with these keys:
  {
    "title": "The title",
    "metaDescription": "The meta description",
    "outline": ["Section 1", "Section 2", ...],
    "content": "The full content with HTML formatting including proper heading tags, paragraphs, lists, etc.",
    "ragEnhanced": ${wasRagEnhanced}
  }`;
};
