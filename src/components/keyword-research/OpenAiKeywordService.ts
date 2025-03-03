
import { toast } from "sonner";
import { ResearchKeyword } from "./types";
import { getSampleKeywords } from "./utils";
import { OPENAI_API_KEY, GEMINI_API_KEY } from "@/services/keywords/apiConfig";
import { generateTopicSuggestions } from "@/utils/topicGenerator";

export const fetchKeywordsFromOpenAI = async (searchTerm: string): Promise<ResearchKeyword[]> => {
  try {
    // Get selected model provider and specific model from localStorage or default to OpenAI
    const selectedModelProvider = localStorage.getItem('selectedAiProvider') || 'openai';
    const selectedModel = localStorage.getItem('selectedAiModel') || 'gpt-4o';
    
    if (selectedModelProvider === 'gemini') {
      return await fetchKeywordsFromGemini(searchTerm);
    }
    
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
            content: 'You are an expert SEO researcher who can identify valuable keyword opportunities and provide actionable recommendations.'
          },
          {
            role: 'user',
            content: `Generate keyword research data for the term "${searchTerm}". 
            
            For each keyword, provide:
            - Estimated monthly search volume (number between 10-10000)
            - SEO difficulty score (1-100 scale where higher is more difficult)
            - Estimated CPC in USD (0.1-20.0)
            - A specific implementation recommendation for how to use this keyword
            - 3-5 related secondary keywords that would complement this keyword
            
            Generate 5-8 keywords total.
            
            Format your response EXACTLY like this JSON example:
            {
              "keywords": [
                {
                  "keyword": "example keyword 1",
                  "volume": 1200,
                  "difficulty": 45,
                  "cpc": 2.50,
                  "recommendation": "Use as primary H1 on a dedicated landing page with informational content",
                  "relatedKeywords": ["related term 1", "related term 2", "related term 3"]
                },
                {
                  "keyword": "example keyword 2",
                  "volume": 800,
                  "difficulty": 30,
                  "cpc": 1.75,
                  "recommendation": "Create a blog post that targets this long-tail keyword for higher conversion potential",
                  "relatedKeywords": ["related term 4", "related term 5", "related term 6", "related term 7"]
                }
              ]
            }`
          }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const parsedData = JSON.parse(data.choices[0].message.content);
    
    if (!parsedData.keywords || !Array.isArray(parsedData.keywords)) {
      throw new Error("Invalid response format from OpenAI");
    }

    toast.success(`Found ${parsedData.keywords.length} keyword opportunities`);
    return parsedData.keywords;
  } catch (apiError) {
    console.error("Error with AI API, using sample data:", apiError);
    const sampleKeywords = getSampleKeywords(searchTerm);
    toast.success(`Generated ${sampleKeywords.length} keyword ideas for "${searchTerm}"`);
    toast.info("Using sample data for demonstration purposes");
    return sampleKeywords;
  }
};

export const fetchKeywordsFromGemini = async (searchTerm: string): Promise<ResearchKeyword[]> => {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error("Gemini API is not configured");
    }
    
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
              { 
                text: `Generate keyword research data for the term "${searchTerm}". 
            
                For each keyword, provide:
                - Estimated monthly search volume (number between 10-10000)
                - SEO difficulty score (1-100 scale where higher is more difficult)
                - Estimated CPC in USD (0.1-20.0)
                - A specific implementation recommendation for how to use this keyword
                - 3-5 related secondary keywords that would complement this keyword
                
                Generate 5-8 keywords total.
                
                Format your response EXACTLY like this JSON example:
                {
                  "keywords": [
                    {
                      "keyword": "example keyword 1",
                      "volume": 1200,
                      "difficulty": 45,
                      "cpc": 2.50,
                      "recommendation": "Use as primary H1 on a dedicated landing page with informational content",
                      "relatedKeywords": ["related term 1", "related term 2", "related term 3"]
                    },
                    {
                      "keyword": "example keyword 2",
                      "volume": 800,
                      "difficulty": 30,
                      "cpc": 1.75,
                      "recommendation": "Create a blog post that targets this long-tail keyword for higher conversion potential",
                      "relatedKeywords": ["related term 4", "related term 5", "related term 6", "related term 7"]
                    }
                  ]
                }`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 2048
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("Gemini API returned empty response");
    }
    
    const content = data.candidates[0].content.parts[0].text;
    
    // Try to parse JSON from the response
    try {
      // Extract JSON from text if needed (in case there's surrounding text)
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```([\s\S]*?)```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      
      const parsedData = JSON.parse(jsonString);
      
      if (!parsedData.keywords || !Array.isArray(parsedData.keywords)) {
        throw new Error("Invalid response format from Gemini");
      }
      
      toast.success(`Found ${parsedData.keywords.length} keyword opportunities using Gemini`);
      return parsedData.keywords;
    } catch (parseError) {
      console.error("Error parsing Gemini response:", parseError);
      throw parseError;
    }
  } catch (apiError) {
    console.error("Error with Gemini API, using sample data:", apiError);
    const sampleKeywords = getSampleKeywords(searchTerm);
    toast.success(`Generated ${sampleKeywords.length} keyword ideas for "${searchTerm}"`);
    toast.info("Using sample data for demonstration purposes");
    return sampleKeywords;
  }
};

export const prepareContentGeneration = (
  domain: string, 
  keyword: string, 
  relatedKeywords: string[]
) => {
  return generateTopicSuggestions(domain, [], null, [keyword, ...relatedKeywords]);
};
