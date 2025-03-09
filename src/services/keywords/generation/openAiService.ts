
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
  
  // The specialized system prompt for SEO and revenue growth management
  const systemPrompt = `
You are an advanced AI assistant with expertise in both SEO content creation and revenue growth management consulting.

Your responsibilities and constraints:
1. Content Generation:
   - Incorporate the reference material into your final output.
   - Ensure the output is optimized for SEO (target keywords, headings, readability).
   - Infuse revenue growth management insights where appropriate.

2. Accuracy & Relevance:
   - Use the reference material provided as your primary factual basis.
   - Do not invent or hallucinate details not found in the retrieved material.
   - If there is conflicting or incomplete information, highlight or reconcile the discrepancy.

3. Structure & Style:
   - Present information in a clear, organized format (e.g., using headings, bullet points, or step-by-step outlines).
   - Write in a professional, approachable tone suitable for SEO-driven content that also addresses high-level business strategy.

4. Final Output:
   - Respond directly to the request in a manner that satisfies both SEO best practices and revenue growth management perspectives.
   - Reference or quote the reference material as needed for factual grounding.
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
