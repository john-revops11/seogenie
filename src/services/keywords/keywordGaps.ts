
import { toast } from "sonner";
import { KeywordData, KeywordGap } from './types';
import { OPENAI_API_KEY } from './apiConfig';

export const findKeywordGaps = async (
  mainDomain: string,
  competitorDomains: string[],
  keywords: KeywordData[],
  targetGapCount: number = 100 // Limit to 100 per competitor
): Promise<KeywordGap[]> => {
  try {
    if (!keywords.length) {
      console.error("No keywords provided to findKeywordGaps");
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
    
    // If we have enough gaps from the data, use them directly with local analysis
    if (potentialGaps.length > 0) {
      console.log("Using directly identified gaps with local analysis");
      
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
              
              // Calculate relevance score (0-100) based on competition index and search intent match
              const relevance = Math.min(100, Math.max(0, 
                100 - kw.competition_index + 
                (kw.keyword.toLowerCase().includes(mainDomainName.toLowerCase()) ? 20 : 0)
              ));
              
              // Calculate competitive advantage (0-100) based on competitor position and search volume
              const competitiveAdvantage = Math.min(100, Math.max(0,
                Math.round(((30 - position) / 30) * 50) + // Position factor (better position = higher advantage)
                Math.min(50, Math.round(kw.monthly_search / 100)) // Volume factor
              ));
              
              // High opportunity: High volume, low competition, high relevance
              if (kw.monthly_search > 500 && kw.competition_index < 30 && relevance > 70) {
                opportunity = 'high';
              } 
              // Low opportunity: Low volume, high competition, low relevance
              else if (kw.monthly_search < 100 && kw.competition_index > 60 && relevance < 40) {
                opportunity = 'low';
              }
              
              const gap: KeywordGap = {
                keyword: kw.keyword,
                volume: kw.monthly_search,
                difficulty: kw.competition_index,
                opportunity: opportunity,
                competitor: competitor,
                rank: position,
                isTopOpportunity: false,
                relevance: relevance, // Add relevance score
                competitiveAdvantage: competitiveAdvantage // Add competitive advantage score
              };
              
              // Add to the competitor's gaps array
              const competitorGaps = gapsByCompetitor.get(competitor) || [];
              if (competitorGaps.length < targetGapCount) { // Limit to targetGapCount per competitor
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
      
      // Identify top opportunity keywords across all competitors based on combined scoring
      // Sort by a combined score of relevance, competitive advantage, and volume
      const sortedGaps = [...directGaps].sort((a, b) => {
        const scoreA = (a.relevance || 0) * 0.4 + (a.competitiveAdvantage || 0) * 0.4 + Math.min(100, a.volume / 10) * 0.2;
        const scoreB = (b.relevance || 0) * 0.4 + (b.competitiveAdvantage || 0) * 0.4 + Math.min(100, b.volume / 10) * 0.2;
        return scoreB - scoreA;
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
      return directGaps;
    }
    
    // Fall back to OpenAI for analysis if we don't have enough direct gaps
    console.log("Using OpenAI to analyze keyword gaps");
    
    // Check if OpenAI API key is available
    if (!OPENAI_API_KEY) {
      console.error("OpenAI API key is not configured");
      toast.error("OpenAI API key is not configured. Please add it in API settings.");
      
      // Return empty array if we have an error - we're not falling back to mock data anymore
      return [];
    }
    
    // Ensure we're requesting up to targetGapCount gaps per competitor
    const adjustedGapCount = targetGapCount * competitorDomains.length;
    
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
      
      // Verify we have at least some gaps for each competitor
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
    console.error("Error finding keyword gaps:", error);
    toast.error(`Failed to find keyword gaps: ${(error as Error).message}`);
    
    // Return empty array if we have an error - we're not falling back to mock data anymore
    return [];
  }
};
