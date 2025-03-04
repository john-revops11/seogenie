
import { KeywordGap, KeywordData } from '../types';
import { toast } from "sonner";
import { OPENAI_API_KEY } from '../apiConfig';

/**
 * Analyzes keywords using OpenAI to generate keyword gaps
 */
export const analyzeKeywordsWithAI = async (
  mainDomainName: string,
  competitorDomainNames: string[],
  keywords: KeywordData[],
  targetGapCount: number = 100
): Promise<KeywordGap[]> => {
  if (!OPENAI_API_KEY) {
    console.error("OpenAI API key is not configured");
    toast.error("OpenAI API key is not configured. Please add it in API settings.");
    return [];
  }
  
  const adjustedGapCount = targetGapCount * competitorDomainNames.length;
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert SEO keyword analyst who identifies valuable keyword opportunities.'
          },
          {
            role: 'user',
            content: `Analyze the keyword data for main domain "${mainDomainName}" and competitors ${competitorDomainNames.join(', ')}. 
            Identify the top keyword gaps (keywords competitors rank for that the main domain does not, or ranks poorly for).
            
            I need up to ${targetGapCount} keyword gaps for EACH competitor domain (${adjustedGapCount} total gaps maximum).
            
            Keyword data: ${JSON.stringify(keywords.slice(0, Math.min(keywords.length, 100)))}
            
            For each keyword gap, include these properties:
            - keyword: string (the keyword)
            - volume: number (estimated monthly search volume, 100-10000)
            - difficulty: number (1-100 scale where higher is more difficult)
            - opportunity: string (high, medium, or low based on potential value)
            - competitor: string (the competitor domain that ranks for this keyword)
            - relevance: number (1-100 scale where higher indicates higher relevance to the main domain's business)
            - competitiveAdvantage: number (1-100 scale indicating how likely the main domain could outrank competitors)
            - isTopOpportunity: boolean (mark the top 5 keywords with highest potential value as true)
            
            Format your response EXACTLY like this JSON example:
            {
              "keywordGaps": [
                {
                  "keyword": "example keyword 1",
                  "volume": 1200,
                  "difficulty": 45,
                  "opportunity": "high",
                  "competitor": "competitor1.com",
                  "relevance": 85,
                  "competitiveAdvantage": 72,
                  "isTopOpportunity": true
                },
                {
                  "keyword": "example keyword 2",
                  "volume": 800,
                  "difficulty": 30,
                  "opportunity": "medium",
                  "competitor": "competitor2.com",
                  "relevance": 65,
                  "competitiveAdvantage": 58,
                  "isTopOpportunity": false
                }
              ]
            }
            
            IMPORTANT: 
            - ALWAYS include relevance and competitiveAdvantage scores for each keyword.
            - Relevance (1-100) should analyze how well the keyword matches the main domain's likely business focus.
            - Competitive Advantage (1-100) should assess how likely the main domain could outrank competitors based on difficulty, competition position, and search volume.
            - You must include the competitor property for each gap to identify which competitor ranks for each keyword.
            - Try to provide up to ${targetGapCount} keywords for each competitor (evenly distributed if possible).
            - Mark exactly 5 keywords total as isTopOpportunity: true based on their overall value and potential impact for the main domain.`
          }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error (${response.status}):`, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Received OpenAI response for keyword gaps");
    
    try {
      const parsedContent = JSON.parse(data.choices[0].message.content);
      const gaps = parsedContent.keywordGaps;
      
      if (!Array.isArray(gaps) || gaps.length === 0) {
        console.error("OpenAI returned invalid or empty gaps array:", data.choices[0].message.content);
        throw new Error("Invalid response format from OpenAI");
      }
      
      const gapsByCompetitor = new Map<string, number>();
      gaps.forEach(gap => {
        const competitor = gap.competitor || "unknown";
        gapsByCompetitor.set(competitor, (gapsByCompetitor.get(competitor) || 0) + 1);
      });
      
      console.log("Gaps distribution by competitor:", Object.fromEntries(gapsByCompetitor));
      
      return gaps;
    } catch (error) {
      console.error("Error parsing OpenAI response:", error, data.choices[0].message.content);
      throw new Error("Failed to parse OpenAI response");
    }
  } catch (error) {
    console.error("Error analyzing keywords with AI:", error);
    throw error;
  }
};
