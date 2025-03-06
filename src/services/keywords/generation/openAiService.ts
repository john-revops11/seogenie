
import { toast } from 'sonner';
import { getApiKey } from '../apiConfig';

/**
 * Generates a single paragraph of content using the OpenAI API
 */
export const generateParagraphContent = async (prompt: string, creativity: number): Promise<string> => {
  console.log("Attempting to generate paragraph with prompt:", prompt.substring(0, 100) + "...");
  
  // Get OpenAI API key dynamically
  const apiKey = getApiKey('openai');
  
  if (!apiKey) {
    console.error("OpenAI API key is not configured");
    toast.error("OpenAI API key is not configured. Please check your API settings.");
    throw new Error("OpenAI API key is not configured");
  }
  
  // Try primary model (GPT-4o-mini) first
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
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
        max_tokens: 800
      })
    });
    
    if (!response.ok) {
      console.error(`OpenAI API error with gpt-4o-mini: ${response.status}`, await response.text());
      throw new Error(`OpenAI API error with gpt-4o-mini: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Generation response received:", data);
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("Invalid response format from OpenAI:", data);
      throw new Error("Invalid response format from OpenAI");
    }
    
    return data.choices[0].message.content.trim();
  } catch (primaryModelError) {
    console.warn("Primary model (gpt-4o-mini) failed, using fallback model:", primaryModelError);
    
    // Fallback to GPT-3.5-turbo
    try {
      const fallbackResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
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
          max_tokens: 800
        })
      });
      
      if (!fallbackResponse.ok) {
        console.error(`OpenAI API error with fallback model: ${fallbackResponse.status}`, await fallbackResponse.text());
        throw new Error(`All OpenAI models failed to generate content`);
      }
      
      const fallbackData = await fallbackResponse.json();
      
      if (!fallbackData.choices || !fallbackData.choices[0] || !fallbackData.choices[0].message) {
        console.error("Invalid response format from OpenAI fallback:", fallbackData);
        throw new Error("Invalid response format from OpenAI fallback");
      }
      
      return fallbackData.choices[0].message.content.trim();
    } catch (fallbackError) {
      console.error("All OpenAI models failed:", fallbackError);
      throw new Error("All available AI models failed to generate content");
    }
  }
};
