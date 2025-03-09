
import { toast } from "sonner";
import { KeywordData, KeywordGap } from './types';
import { getApiKey } from '@/services/apiIntegrationService';

interface RevologySeoReport {
  competitorInsights: {
    competitorName: string;
    topKeywords: string[];
    averagePosition: number;
    uniqueKeywords: string[];
  }[];
  keywordGaps: KeywordGap[];
  strategicOpportunities: {
    keyword: string;
    volume: number;
    difficulty: number;
    opportunityScore: number;
    rationale: string;
  }[];
  recommendedActions: string[];
}

/**
 * Generates a comprehensive SEO strategy report for Revology Analytics
 * based on competitor keyword data.
 */
export const generateRevologySeoStrategy = async (
  domain: string,
  competitorDomains: string[],
  keywords: KeywordData[]
): Promise<RevologySeoReport | null> => {
  try {
    // Extract domain names for better readability
    const extractDomain = (url: string) => {
      try {
        return new URL(url).hostname.replace(/^www\./, '');
      } catch (e) {
        return url;
      }
    };
    
    const mainDomainName = extractDomain(domain);
    const competitorDomainNames = competitorDomains.map(extractDomain);
    
    toast.info("Generating SEO strategy based on competitor analysis...");
    
    // Call OpenAI API to generate strategic recommendations
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getApiKey('openai')}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert SEO strategist specialized in SaaS analytics businesses. 
            You're analyzing competitor keyword data for revologyanalytics.com, a company that provides 
            analytics and business intelligence solutions. Your goal is to identify strategic keyword 
            opportunities and provide actionable recommendations based on competitor data.`
          },
          {
            role: 'user',
            content: `Analyze the following keyword data for main domain "${mainDomainName}" and 
            competitors ${competitorDomainNames.join(', ')}. 
            
            Generate a comprehensive SEO strategy report with:
            1. Competitor Insights: Key metrics and top keywords for each competitor
            2. Keyword Gaps: Important keywords competitors rank for that revologyanalytics.com doesn't
            3. Strategic Opportunities: Most valuable keywords to target based on volume, difficulty, and relevance
            4. Recommended Actions: Clear next steps for implementation
            
            Keyword data: ${JSON.stringify(keywords.slice(0, Math.min(keywords.length, 150)))}
            
            Format your response as a structured JSON object.`
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
    console.log("Received OpenAI response for Revology SEO strategy");
    
    // Parse the response
    try {
      const parsedContent = JSON.parse(data.choices[0].message.content);
      
      toast.success("SEO strategy generated successfully");
      return parsedContent;
    } catch (error) {
      console.error("Error parsing OpenAI response:", error);
      toast.error("Failed to parse SEO strategy results");
      return null;
    }
  } catch (error) {
    console.error("Error generating SEO strategy:", error);
    toast.error(`Failed to generate SEO strategy: ${(error as Error).message}`);
    return null;
  }
};

/**
 * Runs a specific sequence of SEO analysis actions for Revology Analytics
 */
export const runRevologySeoActions = async (
  domain: string,
  competitorDomains: string[],
  keywords: KeywordData[]
): Promise<void> => {
  try {
    // Step 1: Analyze Competitor Keywords
    toast.info("Step 1: Analyzing competitor keywords...");
    
    // Generate competitor keyword insights
    const competitorInsights = competitorDomains.map(competitorDomain => {
      const domainName = extractDomain(competitorDomain);
      
      // Find keywords where this competitor ranks
      const competitorKeywords = keywords.filter(kw => 
        kw.competitorRankings && 
        kw.competitorRankings[domainName] !== undefined && 
        kw.competitorRankings[domainName] !== null
      );
      
      // Sort by position
      const sortedKeywords = [...competitorKeywords].sort((a, b) => {
        const posA = a.competitorRankings?.[domainName] || 100;
        const posB = b.competitorRankings?.[domainName] || 100;
        return posA - posB;
      });
      
      // Calculate average position
      const positions = sortedKeywords
        .map(kw => kw.competitorRankings?.[domainName])
        .filter(pos => pos !== null && pos !== undefined) as number[];
      
      const avgPosition = positions.length > 0 
        ? positions.reduce((sum, pos) => sum + pos, 0) / positions.length 
        : 0;
      
      // Get top keywords
      const topKeywords = sortedKeywords
        .slice(0, 5)
        .map(kw => kw.keyword);
      
      // Find unique keywords (competitor ranks but main domain doesn't)
      const uniqueKeywords = sortedKeywords
        .filter(kw => kw.position === null || kw.position > 30)
        .map(kw => kw.keyword)
        .slice(0, 5);
      
      return {
        competitorName: domainName,
        keywordCount: competitorKeywords.length,
        topKeywords,
        averagePosition: Math.round(avgPosition * 10) / 10,
        uniqueKeywords
      };
    });
    
    toast.success(`Analyzed keywords for ${competitorDomains.length} competitors`);
    
    // Step 2: Generate Summary Overview
    toast.info("Step 2: Generating keyword overview summary...");
    
    // Get main domain ranking keywords
    const mainDomainName = extractDomain(domain);
    const rankingKeywords = keywords.filter(kw => kw.position !== null && kw.position <= 30);
    
    // Find keyword gaps (keywords multiple competitors rank for but main domain doesn't)
    const keywordGaps = keywords.filter(kw => {
      // Main domain doesn't rank well
      const mainDoesntRank = kw.position === null || kw.position > 30;
      
      // Count how many competitors rank for this keyword
      let competitorRankCount = 0;
      if (kw.competitorRankings) {
        for (const [comp, pos] of Object.entries(kw.competitorRankings)) {
          if (pos !== null && pos <= 30) {
            competitorRankCount++;
          }
        }
      }
      
      // Return true if main doesn't rank but multiple competitors do
      return mainDoesntRank && competitorRankCount >= 2;
    })
    .sort((a, b) => b.monthly_search - a.monthly_search)
    .slice(0, 10);
    
    // Create summary message
    const summary = {
      mainDomain: mainDomainName,
      rankingKeywordCount: rankingKeywords.length,
      avgPosition: rankingKeywords.length > 0 
        ? Math.round((rankingKeywords.reduce((sum, kw) => sum + (kw.position || 0), 0) / rankingKeywords.length) * 10) / 10
        : 0,
      topKeywordGaps: keywordGaps.map(kw => ({
        keyword: kw.keyword,
        volume: kw.monthly_search,
        difficulty: kw.competition_index,
        competitorsRanking: Object.entries(kw.competitorRankings || {})
          .filter(([_, pos]) => pos !== null && pos <= 30)
          .length
      }))
    };
    
    console.log("SEO strategy summary:", summary);
    toast.success("SEO analysis complete! Review the results in the gaps and recommendations sections.");
    
  } catch (error) {
    console.error("Error running Revology SEO actions:", error);
    toast.error(`SEO analysis failed: ${(error as Error).message}`);
  }
};

// Helper function to extract domain name
function extractDomain(url: string): string {
  try {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return new URL(url).hostname.replace(/^www\./, '');
    }
    return url.replace(/^www\./, '');
  } catch (error) {
    return url;
  }
}
