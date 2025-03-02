
import { OPENAI_API_KEY } from './apiConfig';

export const generateContent = async (
  domain: string,
  title: string,
  keywords: string[],
  contentType: string,
  creativityLevel: number,
  contentPreferences: string[] = []
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
        contentBrief = `Create a comprehensive blog post optimized for SEO that educates business professionals about ${title}. 
        Use a professional and informative tone. Include data points, statistics, and real-world examples.
        Structure with clear headings (H1, H2, H3), bullet points for clarity, short paragraphs, and conclude with actionable next steps.
        Format: 
        - Engaging introduction that hooks the reader and clearly states why this topic matters
        - Key sections with subheadings that explain concepts and provide examples
        - Strategic use of bold text to emphasize important points
        - Conclusion summarizing key takeaways with a clear call to action`;
        break;
      case "case-study":
        contentBrief = `Create a business case study about ${title} that demonstrates real-world impact. 
        Use a professional tone targeting executives and decision-makers.
        Structure:
        - Banner title: Short but impactful title referencing the key theme or solution
        - Short description: 1-2 lines summarizing the project or outcome
        - Situation: Detailed background, challenges, and context
        - Obstacles: The biggest hurdles and their impacts on the business
        - Action: Detailed methodology and engagement process
        - Results: Tangible outcomes with specific metrics, KPIs, and improvements
        End with a clear sense of business value and next steps.`;
        break;
      case "white-paper":
        contentBrief = `Create an executive-level white paper about ${title} for business decision-makers.
        Structure:
        - Header/Subtitle introducing the topic
        - Compelling title
        - Table of contents (formatted as a list)
        - Executive Summary: Brief overview of the white paper's purpose and key findings
        - Introduction: Context about industry trends and challenges
        - Core sections with subheadings covering key aspects of the topic
        - Implementation or strategy roadmap
        - Conclusion with key insights and next steps
        - About section (optional)
        Use a comprehensive, data-driven approach with formal tone suitable for senior professionals.
        Include statistics, industry references, and well-structured paragraphs and bullet points.`;
        break;
      case "guide":
        contentBrief = `Create a comprehensive guide about ${title} that serves as an authoritative resource.
        Format with detailed step-by-step instructions, expert insights, and practical applications.
        Include introduction explaining the importance of the topic, detailed sections covering all aspects,
        and a conclusion with implementation recommendations. Use a professional, educational tone with
        clear headings, bullet points, and numbered lists where appropriate.`;
        break;
      case "article":
        contentBrief = `Create an in-depth article about ${title} that provides analysis and insights.
        Structure with an engaging introduction, well-researched body sections exploring different angles of the topic,
        expert perspectives or quotes where relevant, and a conclusion that synthesizes the key points.
        Use a professional, journalistic tone with clear headings and concise paragraphs.`;
        break;
      default:
        contentBrief = `Create informative and engaging content about ${title} for a business audience.
        Balance educational value with readability, and organize with clear structure using proper HTML headings (H1, H2, H3).`;
    }
    
    // Add content preferences to the brief
    if (contentPreferences && contentPreferences.length > 0) {
      contentBrief += `\n\nPlease incorporate the following content preferences: ${contentPreferences.join(', ')}.`;
      
      // Add specific instructions for each preference
      if (contentPreferences.includes('Focus on H1/H2 tags')) {
        contentBrief += `\nEnsure proper heading hierarchy with a clear H1 title and logical H2 sections.`;
      }
      if (contentPreferences.includes('Include meta descriptions')) {
        contentBrief += `\nCreate a compelling meta description that includes primary keywords.`;
      }
      if (contentPreferences.includes('Use bullet points')) {
        contentBrief += `\nUtilize bullet points to break down complex information and improve readability.`;
      }
      if (contentPreferences.includes('Add internal links')) {
        contentBrief += `\nSuggest potential internal linking opportunities within the content.`;
      }
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
            content: `You are an expert content creator for ${domain}, specializing in business content creation.
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
            
            Ensure your tone and approach are appropriate for a business audience - professional, data-driven, and actionable.`
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
