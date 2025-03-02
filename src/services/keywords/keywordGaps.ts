
import { toast } from "sonner";
import { KeywordData, KeywordGap } from './types';
import { OPENAI_API_KEY } from './apiConfig';

// Validate OpenAI API key to ensure it's properly formatted
function validateOpenAIKey(): boolean {
  if (!OPENAI_API_KEY || typeof OPENAI_API_KEY !== 'string' || OPENAI_API_KEY.trim() === "") {
    console.error("OPENAI_API_KEY is not set or invalid");
    return false;
  }
  
  // Basic format validation for OpenAI API keys
  const openAIKeyPattern = /^sk-[a-zA-Z0-9]{48,}$/;
  if (!openAIKeyPattern.test(OPENAI_API_KEY.trim())) {
    console.error("OPENAI_API_KEY format appears invalid");
    return false;
  }
  
  return true;
}

export const findKeywordGaps = async (
  mainDomain: string,
  competitorDomains: string[],
  keywords: KeywordData[],
  targetGapCount: number = 50 * competitorDomains.length // 50 gaps per competitor
): Promise<KeywordGap[]> => {
  try {
    if (!keywords.length) {
      console.error("No keywords provided to findKeywordGaps");
      toast.error("Cannot find keyword gaps: No keywords available from domain analysis");
      return [];
    }
    
    // Extract domain names for better readability in the results
    const extractDomain = (url: string) => {
      try {
        return new URL(url).hostname.replace(/^www\./, '');
      } catch (e) {
        return url;
      }
    };
    
    const mainDomainName = extractDomain(mainDomain);
    const competitorDomainNames = competitorDomains.map(extractDomain);
    
    console.log(`Finding keyword gaps for ${mainDomainName} vs ${competitorDomainNames.join(', ')}`);
    
    // Filter keywords to find ones where competitors rank but the main domain doesn't or ranks poorly
    const potentialGaps = keywords.filter(kw => {
      // Check if the main domain doesn't rank for this keyword or ranks poorly (position > 30)
      const mainDoesntRank = kw.position === null || kw.position > 30;
      
      // Check if at least one competitor ranks for this keyword
      const anyCompetitorRanks = kw.competitorRankings && 
        Object.keys(kw.competitorRankings).some(comp => 
          competitorDomainNames.includes(comp) && 
          kw.competitorRankings[comp] !== null && 
          kw.competitorRankings[comp]! <= 30
        );
      
      return mainDoesntRank && anyCompetitorRanks;
    });
    
    console.log(`Found ${potentialGaps.length} potential keyword gaps before AI analysis`);
    toast.info(`Identified ${potentialGaps.length} potential keyword gaps`);
    
    // If we have enough gaps from the data, use them directly without AI
    if (potentialGaps.length >= targetGapCount) {
      console.log("Using directly identified gaps without AI processing");
      toast.info("Using direct keyword gap analysis (no AI processing needed)");
      
      // Convert to KeywordGap format
      const directGaps: KeywordGap[] = [];
      
      // Create a map to track gaps by competitor to ensure even distribution
      const gapsByCompetitor = new Map<string, KeywordGap[]>();
      competitorDomainNames.forEach(comp => gapsByCompetitor.set(comp, []));
      
      for (const kw of potentialGaps) {
        // Find all competitors that rank for this keyword
        if (kw.competitorRankings) {
          for (const [competitor, position] of Object.entries(kw.competitorRankings)) {
            // Only process competitors that are in our competitor domains list
            if (position !== null && position <= 30 && competitorDomainNames.includes(competitor)) {
              // Calculate opportunity based on search volume and competition
              let opportunity: 'high' | 'medium' | 'low' = 'medium';
              
              // High opportunity: High volume, low competition
              if (kw.monthly_search > 500 && kw.competition_index < 30) {
                opportunity = 'high';
              } 
              // Low opportunity: Low volume, high competition
              else if (kw.monthly_search < 100 && kw.competition_index > 60) {
                opportunity = 'low';
              }
              
              const gap: KeywordGap = {
                keyword: kw.keyword,
                volume: kw.monthly_search,
                difficulty: kw.competition_index,
                opportunity: opportunity,
                competitor: competitor,
                rank: position,
                isTopOpportunity: false
              };
              
              // Add to the competitor's gaps array
              const competitorGaps = gapsByCompetitor.get(competitor) || [];
              if (competitorGaps.length < 50) { // Limit to 50 per competitor
                competitorGaps.push(gap);
                gapsByCompetitor.set(competitor, competitorGaps);
              }
            }
          }
        }
      }
      
      // Combine all gaps from all competitors
      for (const competitorGaps of gapsByCompetitor.values()) {
        directGaps.push(...competitorGaps);
      }
      
      // Identify top 5 opportunity keywords across all competitors
      // Sort by opportunity and then by volume
      const sortedGaps = [...directGaps].sort((a, b) => {
        // First by opportunity
        if (a.opportunity !== b.opportunity) {
          return a.opportunity === 'high' ? -1 : a.opportunity === 'medium' ? 0 : 1;
        }
        // Then by volume
        return b.volume - a.volume;
      });
      
      // Mark the top 5 as high opportunity
      sortedGaps.slice(0, 5).forEach(gap => {
        // Find this gap in the original array and mark it
        const originalGap = directGaps.find(g => g.keyword === gap.keyword && g.competitor === gap.competitor);
        if (originalGap) {
          originalGap.isTopOpportunity = true;
        }
      });
      
      console.log("Returning directly identified gaps:", directGaps.length);
      console.log("Gaps by competitor:", Object.fromEntries(gapsByCompetitor));
      
      toast.success(`Found ${directGaps.length} keyword gaps from your competitors`);
      return directGaps;
    }
    
    // Fall back to OpenAI for analysis if we don't have enough direct gaps
    console.log("Using OpenAI to analyze keyword gaps");
    toast.info("Using AI to analyze and identify keyword gaps");
    
    // Validate OpenAI API key before making the API call
    if (!validateOpenAIKey()) {
      console.error("OPENAI_API_KEY validation failed");
      toast.error("OpenAI API key is missing or invalid. Using basic gap analysis instead.");
      
      // Return basic gaps without AI analysis
      return potentialGaps.map(kw => ({
        keyword: kw.keyword,
        volume: kw.monthly_search,
        difficulty: kw.competition_index,
        opportunity: 'medium',
        competitor: Object.keys(kw.competitorRankings || {})[0] || competitorDomainNames[0],
        rank: kw.competitorRankings ? kw.competitorRankings[Object.keys(kw.competitorRankings)[0]] || null : null,
        isTopOpportunity: false
      }));
    }
    
    // Ensure we're requesting up to 50 gaps per competitor
    const minGapsPerCompetitor = 50;
    const adjustedGapCount = minGapsPerCompetitor * competitorDomains.length;
    
    console.log(`Making OpenAI API request with key: ${OPENAI_API_KEY.substring(0, 10)}...`);
    
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
            content: 'You are an expert SEO keyword analyst who identifies valuable keyword opportunities.'
          },
          {
            role: 'user',
            content: `Analyze the keyword data for main domain "${mainDomainName}" and competitors ${competitorDomainNames.join(', ')}. 
            Identify the top keyword gaps (keywords competitors rank for that the main domain does not, or ranks poorly for).
            
            I need up to ${minGapsPerCompetitor} keyword gaps for EACH competitor domain (${adjustedGapCount} total gaps maximum).
            
            Keyword data: ${JSON.stringify(keywords.slice(0, Math.min(keywords.length, 100)))}
            
            For each keyword gap, include these properties:
            - keyword: string (the keyword)
            - volume: number (estimated monthly search volume, 100-10000)
            - difficulty: number (1-100 scale where higher is more difficult)
            - opportunity: string (high, medium, or low based on potential value)
            - competitor: string (the competitor domain that ranks for this keyword)
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
                  "isTopOpportunity": true
                },
                {
                  "keyword": "example keyword 2",
                  "volume": 800,
                  "difficulty": 30,
                  "opportunity": "medium",
                  "competitor": "competitor2.com",
                  "isTopOpportunity": false
                }
              ]
            }
            
            IMPORTANT: 
            - You must include the competitor property for each gap to identify which competitor ranks for each keyword.
            - Try to provide up to ${minGapsPerCompetitor} keywords for each competitor (evenly distributed if possible).
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
      toast.error(`AI analysis failed: ${response.status} - ${errorText.substring(0, 100)}. Using basic gap analysis instead.`);
      
      // Return basic gaps without AI analysis if OpenAI fails
      return potentialGaps.map(kw => ({
        keyword: kw.keyword,
        volume: kw.monthly_search,
        difficulty: kw.competition_index,
        opportunity: 'medium',
        competitor: Object.keys(kw.competitorRankings || {})[0] || competitorDomainNames[0],
        rank: kw.competitorRankings ? kw.competitorRankings[Object.keys(kw.competitorRankings)[0]] || null : null,
        isTopOpportunity: false
      }));
    }
    
    const data = await response.json();
    console.log("Received OpenAI response for keyword gaps");
    
    try {
      const parsedContent = JSON.parse(data.choices[0].message.content);
      const gaps = parsedContent.keywordGaps;
      
      if (!Array.isArray(gaps) || gaps.length === 0) {
        console.error("OpenAI returned invalid or empty gaps array:", data.choices[0].message.content);
        toast.error("AI returned invalid data format. Using basic gap analysis instead.");
        
        // Return basic gaps without AI analysis if OpenAI returns invalid data
        return potentialGaps.map(kw => ({
          keyword: kw.keyword,
          volume: kw.monthly_search,
          difficulty: kw.competition_index,
          opportunity: 'medium',
          competitor: Object.keys(kw.competitorRankings || {})[0] || competitorDomainNames[0],
          rank: kw.competitorRankings ? kw.competitorRankings[Object.keys(kw.competitorRankings)[0]] || null : null,
          isTopOpportunity: false
        }));
      }
      
      // Verify we have at least some gaps for each competitor
      const gapsByCompetitor = new Map<string, number>();
      gaps.forEach(gap => {
        const competitor = gap.competitor || "unknown";
        gapsByCompetitor.set(competitor, (gapsByCompetitor.get(competitor) || 0) + 1);
      });
      
      console.log("Gaps distribution by competitor:", Object.fromEntries(gapsByCompetitor));
      toast.success(`AI analysis complete: Found ${gaps.length} keyword gaps`);
      
      return gaps;
    } catch (error) {
      console.error("Error parsing OpenAI response:", error, data.choices[0].message.content);
      toast.error(`Failed to parse AI response: ${(error as Error).message}`);
      
      // Return basic gaps without AI analysis if parsing fails
      return potentialGaps.map(kw => ({
        keyword: kw.keyword,
        volume: kw.monthly_search,
        difficulty: kw.competition_index,
        opportunity: 'medium',
        competitor: Object.keys(kw.competitorRankings || {})[0] || competitorDomainNames[0],
        rank: kw.competitorRankings ? kw.competitorRankings[Object.keys(kw.competitorRankings)[0]] || null : null,
        isTopOpportunity: false
      }));
    }
  } catch (error) {
    console.error("Error finding keyword gaps:", error);
    toast.error(`Failed to find keyword gaps: ${(error as Error).message}`);
    
    // Return empty array if we have an error - we're not falling back to mock data anymore
    return [];
  }
};
