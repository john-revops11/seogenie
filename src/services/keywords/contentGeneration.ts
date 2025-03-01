
import { OPENAI_API_KEY } from './apiConfig';

export const generateContent = async (
  domain: string,
  title: string,
  keywords: string[],
  contentType: string,
  creativityLevel: number
): Promise<{
  title: string;
  metaDescription: string;
  outline: string[];
  content: string;
}> => {
  try {
    console.log(`Generating ${contentType} content for "${title}" with keywords: ${keywords.join(', ')}`);
    
    const creativity = creativityLevel / 100; // Convert to 0-1 scale
    const temperature = 0.5 + (creativity * 0.5); // Range from 0.5 to 1.0
    
    // Create a content brief based on the type of content
    let contentBrief = "";
    
    switch (contentType) {
      case "blog":
        contentBrief = `Create a comprehensive blog post optimized for SEO that educates readers about ${title}. 
        Use a conversational but authoritative tone. Include practical examples, data points, and actionable advice.
        Structure with clear headings (H1, H2, H3), bullet points for clarity, and conclude with actionable next steps.`;
        break;
      case "landing":
        contentBrief = `Create landing page copy for ${title} that converts visitors. 
        Focus on clear value proposition, benefits-oriented content, and persuasive calls-to-action.
        Use a main heading (H1), subheadings (H2) for sections, concise paragraphs, bullet points for key benefits, and testimonial placeholders.`;
        break;
      case "product":
        contentBrief = `Create product page content for ${title} that drives conversions.
        Highlight features and benefits, include technical specifications, and address common objections.
        Use a main heading (H1) for the product name, subheadings (H2) for sections, and clear structure with persuasive language and multiple calls-to-action.`;
        break;
      default:
        contentBrief = `Create informative and engaging content about ${title}.
        Balance educational value with readability, and organize with clear structure using proper HTML headings (H1, H2, H3).`;
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert SEO content creator for websites about ${domain}.
            You create high-quality, engaging content that naturally incorporates target keywords.
            Your content is well-structured with proper HTML formatting, provides value to readers, and helps websites rank in search engines.
            Use proper heading hierarchy (H1, H2, H3) with semantic HTML, organize content with paragraphs, lists, and appropriate spacing.`
          },
          {
            role: 'user',
            content: `${contentBrief}
            
            The content should target the following keywords: ${keywords.join(', ')}
            
            Domain: ${domain}
            
            Please create:
            1. A compelling title (if different from "${title}")
            2. An SEO-optimized meta description (150-160 characters)
            3. A detailed content outline with sections
            4. The full content (at least 800 words for blog, appropriate length for other formats)
            
            Make sure the content:
            - Uses proper HTML formatting with correct heading hierarchy (<h1>, <h2>, <h3>, etc.)
            - Has consistent alignment and spacing for readability
            - Naturally incorporates the target keywords (don't force them)
            - Provides actual value and isn't just keyword stuffing
            - Has a clear structure with proper HTML headings and subheadings
            - Includes a strong introduction and conclusion
            - Is engaging and tailored to the target audience
            - Uses appropriate paragraph breaks, lists (<ul>, <ol>), and other HTML elements for clarity
            
            Format your response as a JSON object with these keys:
            {
              "title": "The title",
              "metaDescription": "The meta description",
              "outline": ["Section 1", "Section 2", ...],
              "content": "The full content with HTML formatting including proper heading tags, paragraphs, lists, etc."
            }`
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
      title: result.title || title,
      metaDescription: result.metaDescription,
      outline: result.outline,
      content: result.content
    };
  } catch (error) {
    console.error("Error generating content:", error);
    throw new Error(`Failed to generate content: ${(error as Error).message}`);
  }
};
