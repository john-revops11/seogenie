
import { toast } from 'sonner';
import { getApiKey } from '../apiConfig';

/**
 * Generates a single paragraph of content using Google's Gemini API
 */
export const generateParagraphWithGemini = async (prompt: string, creativity: number): Promise<string> => {
  console.log("Attempting to generate paragraph with Gemini. Prompt:", prompt.substring(0, 100) + "...");
  
  // Get Gemini API key dynamically
  const apiKey = getApiKey('gemini');
  
  if (!apiKey) {
    console.error("Gemini API key is not configured");
    toast.error("Gemini API key is not configured. Please check your API settings.");
    throw new Error("Gemini API key is not configured");
  }
  
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: creativity / 100,
          maxOutputTokens: 800,
          topP: 0.95,
          topK: 40
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });
    
    if (!response.ok) {
      console.error(`Gemini API error: ${response.status}`, await response.text());
      throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Gemini generation response received:", data);
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
      console.error("Invalid response format from Gemini:", data);
      throw new Error("Invalid response format from Gemini");
    }
    
    // Extract text from the parts array
    const generatedText = data.candidates[0].content.parts
      .map((part: any) => part.text || '')
      .join('');
    
    return generatedText.trim();
  } catch (error) {
    console.error("Error with Gemini API:", error);
    toast.error(`Gemini API error: ${error.message}`);
    throw new Error(`Gemini API error: ${error.message}`);
  }
};
