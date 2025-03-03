
import { GEMINI_API_KEY } from '../apiConfig';
import { GeneratedContent } from './contentTypes';

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

/**
 * Call Gemini API with the given prompts
 */
export const callGeminiApi = async (
  systemPrompt: string,
  userPrompt: string,
  temperature: number = 0.7
): Promise<any> => {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: `${systemPrompt}\n\n${userPrompt}` }
            ]
          }
        ],
        generationConfig: {
          temperature: temperature,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API error:", errorData);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("Gemini API returned empty response");
    }

    const content = data.candidates[0].content.parts[0].text;

    // Try to parse JSON from response
    try {
      // Extract JSON from text if needed (in case there's surrounding text)
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```([\s\S]*?)```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      
      const parsedContent = JSON.parse(jsonString);
      
      return {
        title: parsedContent.title || "",
        metaDescription: parsedContent.metaDescription || "",
        outline: parsedContent.outline || [],
        content: parsedContent.content || "",
        ragEnhanced: parsedContent.ragEnhanced || false
      };
    } catch (parseError) {
      console.error("Error parsing Gemini response as JSON:", parseError);
      
      // Fallback to returning the raw text
      return {
        title: "Generated Content",
        metaDescription: "Generated content using Gemini API",
        outline: ["Introduction", "Main Content", "Conclusion"],
        content: content,
        ragEnhanced: false
      };
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error(`Failed to call Gemini API: ${(error as Error).message}`);
  }
};

/**
 * Verify if the Gemini API is configured and accessible
 */
export const isGeminiConfigured = (): boolean => {
  return !!GEMINI_API_KEY;
};

/**
 * Test Gemini API connection with a simple request
 */
export const testGeminiConnection = async (): Promise<boolean> => {
  try {
    if (!isGeminiConfigured()) {
      console.error("Gemini API is not configured");
      return false;
    }
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro?key=${GEMINI_API_KEY}`);
    
    if (!response.ok) {
      console.error(`Gemini API test failed: ${response.status}`);
      localStorage.setItem('geminiErrors', `API error: ${response.status}`);
      return false;
    }
    
    localStorage.removeItem('geminiErrors');
    return true;
  } catch (error) {
    console.error("Error testing Gemini API:", error);
    localStorage.setItem('geminiErrors', (error as Error).message);
    return false;
  }
};
