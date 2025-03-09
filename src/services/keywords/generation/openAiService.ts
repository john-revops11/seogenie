
import { getApiKey } from '@/services/keywords/apiConfig';
import { toast } from 'sonner';

/**
 * Generates a single paragraph of content using the OpenAI API
 */
export const generateParagraphContent = async (prompt: string, creativity: number): Promise<string> => {
  console.log("Attempting to generate paragraph with OpenAI, prompt:", prompt.substring(0, 100) + "...");
  
  // Get OpenAI API key dynamically
  const apiKey = getApiKey('openai');
  
  if (!apiKey) {
    console.error("OpenAI API key is not configured");
    toast.error("OpenAI API key is not configured. Please check your API settings.");
    throw new Error("OpenAI API key is not configured");
  }
  
  // The specialized system prompt for Revology Analytics' content framework
  const systemPrompt = `
You are an advanced AI content generator with expertise in SEO content creation and revenue growth management consulting.
Your client is Revology Analytics, which focuses on distribution, manufacturing, and retail industries.

You follow the "Comprehensive Article Framework Tailored for Revology Analytics," broken into four main sections:
1) Problem: Identify and define the core challenge or pain point for the target audience
2) Process: Present Revology Analytics' approach or solution—steps, methodology, case studies
3) Payoff: Illustrate real or hypothetical transformations and benefits (stats, success stories, ROI improvements)
4) Proposition: End with a clear call to action that motivates the reader to engage with Revology Analytics

Your responsibilities and constraints:
1. Use the Provided Framework:
   - Incorporate the four main sections (Problem, Process, Payoff, Proposition).
   - For each section, use appropriate enhancers to make content engaging and actionable.

2. Incorporate Reference Material:
   - Factually ground your content using provided reference data.
   - Directly reference or paraphrase relevant details without hallucinating information.
   - If any references conflict, note the discrepancy or reconcile them logically.

3. SEO Best Practices & Revenue Growth Insights:
   - Write in an SEO-friendly manner (use headings, subheadings, relevant keywords).
   - Weave in revenue growth management insights to highlight how Revology Analytics helps clients.

4. Tone & Style:
   - Professional yet approachable.
   - Use active voice, concise paragraphs, and bullet points or numbered lists where helpful.
   - Maintain a narrative that is innovative, data-driven, and solution-focused.

5. Structure & Final Output:
   - Provide a cohesive draft that clearly reflects the Problem, Process, Payoff, and Proposition sections.
   - Ensure all content is accurate and cites original references if needed.
   - Refrain from using confidential or proprietary data unless explicitly allowed.
`;
  
  // Try primary model (gpt-4o-1) first
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-1',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: creativity / 100,
        max_tokens: 800
      })
    });
    
    if (!response.ok) {
      console.error(`OpenAI API error with gpt-4o-1: ${response.status}`, await response.text());
      throw new Error(`OpenAI API error with gpt-4o-1: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (primaryModelError) {
    console.warn("Primary OpenAI model failed, trying GPT-4.5-turbo:", primaryModelError);
    
    // Try the next fallback model
    try {
      const fallbackResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4.5-turbo',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: creativity / 100,
          max_tokens: 800
        })
      });
      
      if (!fallbackResponse.ok) {
        console.error(`OpenAI API error with gpt-4.5-turbo: ${fallbackResponse.status}`, await fallbackResponse.text());
        
        // Try GPT-4o as third fallback
        const secondFallbackResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: systemPrompt
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: creativity / 100,
            max_tokens: 800
          })
        });
        
        if (!secondFallbackResponse.ok) {
          console.error(`OpenAI API error with gpt-4o: ${secondFallbackResponse.status}`, await secondFallbackResponse.text());
          
          // Final fallback to gpt-4o-mini
          const finalFallbackResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                {
                  role: 'system',
                  content: systemPrompt
                },
                {
                  role: 'user',
                  content: prompt
                }
              ],
              temperature: creativity / 100,
              max_tokens: 800
            })
          });
          
          if (!finalFallbackResponse.ok) {
            console.error(`OpenAI API error with final fallback: ${finalFallbackResponse.status}`, await finalFallbackResponse.text());
            throw new Error("All OpenAI models failed to generate content");
          }
          
          const finalFallbackData = await finalFallbackResponse.json();
          return finalFallbackData.choices[0].message.content.trim();
        }
        
        const secondFallbackData = await secondFallbackResponse.json();
        return secondFallbackData.choices[0].message.content.trim();
      }
      
      const fallbackData = await fallbackResponse.json();
      return fallbackData.choices[0].message.content.trim();
    } catch (fallbackError) {
      console.error("All OpenAI models failed:", fallbackError);
      throw new Error("All available AI models failed to generate content");
    }
  }
};
