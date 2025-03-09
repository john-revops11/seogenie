
import { toast } from 'sonner';
import { getApiKey } from '@/services/apiIntegrationService';

/**
 * Generates a single paragraph of content using the Gemini API
 */
export const generateParagraphWithGemini = async (prompt: string, creativity: number): Promise<string> => {
  console.log("Attempting to generate paragraph with Gemini, prompt:", prompt.substring(0, 100) + "...");
  
  // Get Gemini API key dynamically
  const apiKey = getApiKey('gemini');
  
  if (!apiKey) {
    console.error("Gemini API key is not configured");
    toast.error("Gemini API key is not configured. Please check your API settings.");
    throw new Error("Gemini API key is not configured");
  }
  
  // Try primary model (gemini-1.5-pro) first
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `As a professional content writer specializing in SEO-optimized content, write engaging, informative paragraphs that naturally incorporate keywords.\n\n${prompt}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: creativity / 100,
          maxOutputTokens: 800
        }
      })
    });
    
    if (!response.ok) {
      console.error(`Gemini API error with gemini-1.5-pro: ${response.status}`, await response.text());
      throw new Error(`Gemini API error with gemini-1.5-pro: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Gemini generation response received:", data);
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content ||
        !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      console.error("Invalid response format from Gemini:", data);
      throw new Error("Invalid response format from Gemini");
    }
    
    return data.candidates[0].content.parts[0].text.trim();
  } catch (primaryModelError) {
    console.warn("Primary Gemini model failed, using fallback model:", primaryModelError);
    
    // Fallback to gemini-1.5-flash
    try {
      const fallbackResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `As a professional content writer specializing in SEO-optimized content, write engaging, informative paragraphs that naturally incorporate keywords.\n\n${prompt}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: creativity / 100,
            maxOutputTokens: 800
          }
        })
      });
      
      if (!fallbackResponse.ok) {
        console.error(`Gemini API error with fallback model: ${fallbackResponse.status}`, await fallbackResponse.text());
        
        // Second fallback to gemini-pro
        const secondFallbackResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `As a professional content writer specializing in SEO-optimized content, write engaging, informative paragraphs that naturally incorporate keywords.\n\n${prompt}`
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: creativity / 100,
              maxOutputTokens: 800
            }
          })
        });
        
        if (!secondFallbackResponse.ok) {
          console.error(`Gemini API error with second fallback model: ${secondFallbackResponse.status}`, await secondFallbackResponse.text());
          throw new Error(`All Gemini models failed to generate content`);
        }
        
        const secondFallbackData = await secondFallbackResponse.json();
        
        if (!secondFallbackData.candidates || !secondFallbackData.candidates[0] || !secondFallbackData.candidates[0].content ||
            !secondFallbackData.candidates[0].content.parts || !secondFallbackData.candidates[0].content.parts[0]) {
          console.error("Invalid response format from Gemini second fallback:", secondFallbackData);
          throw new Error("Invalid response format from Gemini second fallback");
        }
        
        return secondFallbackData.candidates[0].content.parts[0].text.trim();
      }
      
      const fallbackData = await fallbackResponse.json();
      
      if (!fallbackData.candidates || !fallbackData.candidates[0] || !fallbackData.candidates[0].content ||
          !fallbackData.candidates[0].content.parts || !fallbackData.candidates[0].content.parts[0]) {
        console.error("Invalid response format from Gemini fallback:", fallbackData);
        throw new Error("Invalid response format from Gemini fallback");
      }
      
      return fallbackData.candidates[0].content.parts[0].text.trim();
    } catch (fallbackError) {
      console.error("All Gemini models failed:", fallbackError);
      throw new Error("All available AI models failed to generate content");
    }
  }
};
