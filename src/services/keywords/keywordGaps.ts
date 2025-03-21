
import { toast } from "sonner";
import { processCompetitorData } from './utils/competitorDataProcessor';
import { supabase } from "@/integrations/supabase/client";

// Adjusted API sources to focus on DataForSEO and AI
export type ApiSource = 'dataforseo-intersection' | 'dataforseo-live' | 'ai-generated';

export interface KeywordGap {
  keyword: string;
  volume: number;
  difficulty?: number;
  cpc?: number;
  competitors: string[];
  mainDomainRanks: boolean;
  isHighValue?: boolean;
  isLongTail?: boolean;
  searchVolume?: number;
  competitionIndex?: number;
  searchIntent?: string[];
  competitorDomains?: string[];
  rankingDifficulty?: number;
  opportunityScore?: number;
}

/**
 * Find keyword gaps between main domain and competitors using the DataForSEO Domain Intersection API
 */
export const findKeywordGapsWithDataForSEOIntersection = async (
  mainDomain: string,
  competitorDomains: string[],
  dataForSeoClient: any,
  locationCode: number = 2840
): Promise<KeywordGap[]> => {
  if (!mainDomain || competitorDomains.length === 0) {
    console.warn("Missing domain parameters for intersection analysis");
    toast.error("Please provide valid domains for analysis");
    return [];
  }

  try {
    console.log(`Finding keyword gaps using DataForSEO Intersection API for ${mainDomain} vs. ${competitorDomains.join(', ')}`);
    toast.loading("Analyzing keyword intersections between domains...", { id: "intersection-loading" });
    
    // Process each competitor domain against the main domain
    const gapResults: KeywordGap[] = [];
    for (const competitorDomain of competitorDomains) {
      try {
        // Call the DataForSEO edge function with domain intersection
        const { data, error } = await supabase.functions.invoke('dataforseo', {
          body: {
            action: 'domain_intersection',
            target1: mainDomain,
            target2: competitorDomain,
            location_code: locationCode,
            limit: 100
          }
        });
        
        if (error) {
          console.error(`Error with domain intersection for ${competitorDomain}:`, error);
          continue;
        }
        
        if (!data || !data.success || !data.tasks || !data.tasks[0] || !data.tasks[0].result) {
          console.warn(`No intersection data found for ${competitorDomain}`);
          continue;
        }
        
        // Process intersection results
        const intersectionData = data.tasks[0].result;
        for (const item of intersectionData) {
          const keywordData = {
            keyword: item.keyword,
            volume: item.keyword_data?.keyword_info?.search_volume || 0,
            difficulty: item.keyword_data?.keyword_difficulty || 0,
            cpc: item.keyword_data?.keyword_info?.cpc || 0,
            competitors: [competitorDomain],
            mainDomainRanks: false,
            searchVolume: item.keyword_data?.keyword_info?.search_volume || 0,
            competitionIndex: item.keyword_data?.keyword_info?.competition_index || 0,
            searchIntent: item.keyword_data?.keyword_intent || [],
            opportunityScore: calculateOpportunityScore(item.keyword_data?.keyword_info?.search_volume || 0, item.keyword_data?.keyword_info?.cpc || 0)
          };
          
          // Check if this keyword is already in our results
          const existingIndex = gapResults.findIndex(gap => gap.keyword === keywordData.keyword);
          if (existingIndex >= 0) {
            // Add this competitor to the existing entry
            gapResults[existingIndex].competitors.push(competitorDomain);
          } else {
            gapResults.push(keywordData);
          }
        }
        
      } catch (compError) {
        console.error(`Error processing intersection for ${competitorDomain}:`, compError);
      }
    }
    
    toast.dismiss("intersection-loading");
    
    if (gapResults.length === 0) {
      toast.warning("No keyword gaps found using domain intersection");
    } else {
      toast.success(`Found ${gapResults.length} keyword gaps using domain intersection`);
    }
    
    console.log(`Found ${gapResults.length} keyword gaps with intersection API`);
    return gapResults;
  } catch (error) {
    toast.dismiss("intersection-loading");
    console.error("Error with DataForSEO intersection API:", error);
    toast.error(`Failed to analyze domain intersections: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};

/**
 * Find keyword gaps between main domain and competitors
 */
export const findKeywordGaps = async (
  mainDomain: string,
  competitorDomains: string[],
  existingKeywords: any[] = [],
  limit: number = 100,
  apiSource: ApiSource = 'dataforseo-intersection',
  locationCode: number = 2840
): Promise<KeywordGap[]> => {
  try {
    console.log(`Finding keyword gaps for ${mainDomain} vs. ${competitorDomains.join(', ')} using ${apiSource}`);
    
    // If using the DataForSEO intersection API, use the specialized function
    if (apiSource === 'dataforseo-intersection') {
      return findKeywordGapsWithDataForSEOIntersection(mainDomain, competitorDomains, null, locationCode);
    }
    
    // If using DataForSEO Live API, fetch data from the API
    else if (apiSource === 'dataforseo-live') {
      const mainDomainResult = await processCompetitorData(mainDomain, locationCode);
      
      // Process each competitor domain
      const competitorResults = [];
      for (const competitorDomain of competitorDomains) {
        const result = await processCompetitorData(competitorDomain, locationCode);
        competitorResults.push(result);
      }
      
      // Find keywords that competitors rank for but main domain doesn't
      const mainDomainKeywords = new Set(mainDomainResult.keywords.map(k => k.keyword));
      const gapResults: KeywordGap[] = [];
      
      for (const competitor of competitorResults) {
        for (const keyword of competitor.keywords) {
          if (!mainDomainKeywords.has(keyword.keyword)) {
            // This keyword is a gap
            const existingIndex = gapResults.findIndex(gap => gap.keyword === keyword.keyword);
            if (existingIndex >= 0) {
              // Add this competitor to the existing entry
              gapResults[existingIndex].competitors.push(competitor.domain);
            } else {
              gapResults.push({
                keyword: keyword.keyword,
                volume: keyword.searchVolume || 0,
                difficulty: keyword.difficulty || 0,
                cpc: keyword.cpc || 0,
                competitors: [competitor.domain],
                mainDomainRanks: false,
                searchVolume: keyword.searchVolume || 0,
                competitionIndex: keyword.competitionIndex || 0,
                searchIntent: keyword.searchIntent || [],
                opportunityScore: calculateOpportunityScore(keyword.searchVolume || 0, keyword.cpc || 0)
              });
            }
          }
        }
      }
      
      console.log(`Found ${gapResults.length} keyword gaps using DataForSEO Live API`);
      return gapResults.slice(0, limit);
    }
    
    // If using AI-generated gaps, use the existing keyword data
    else if (apiSource === 'ai-generated') {
      console.log("Using AI algorithm to generate keyword gaps");
      return generateAIKeywordGaps(mainDomain, competitorDomains, existingKeywords, limit);
    }
    
    // Default fallback
    console.warn("Unknown API source specified, using AI-generated gaps");
    return generateAIKeywordGaps(mainDomain, competitorDomains, existingKeywords, limit);
  } catch (error) {
    console.error("Error finding keyword gaps:", error);
    throw error;
  }
};

/**
 * Generate keyword gaps using AI analysis of existing keyword data
 */
const generateAIKeywordGaps = (
  mainDomain: string,
  competitorDomains: string[],
  existingKeywords: any[],
  limit: number = 100
): KeywordGap[] => {
  try {
    // Extract valuable keywords from competitors that main domain doesn't rank for
    const gapResults: KeywordGap[] = [];
    
    if (!existingKeywords || existingKeywords.length === 0) {
      console.warn("No existing keyword data available for AI analysis");
      return [];
    }
    
    console.log(`Analyzing ${existingKeywords.length} keywords to find gaps...`);
    
    // Track keywords the main domain ranks for
    const mainDomainKeywords = new Set();
    
    // Create map of competitor domains to their keywords
    const competitorKeywordMap: Record<string, Set<string>> = {};
    competitorDomains.forEach(domain => {
      competitorKeywordMap[domain] = new Set();
    });
    
    // Process existing keywords
    for (const keyword of existingKeywords) {
      const keywordText = keyword.keyword || '';
      if (!keywordText) continue;
      
      if (keyword.rank && keyword.rank[mainDomain] && keyword.rank[mainDomain] <= 100) {
        mainDomainKeywords.add(keywordText);
      }
      
      // Check if competitors rank for this keyword
      for (const competitor of competitorDomains) {
        if (keyword.rank && keyword.rank[competitor] && keyword.rank[competitor] <= 100) {
          competitorKeywordMap[competitor].add(keywordText);
        }
      }
    }
    
    // Find gaps - keywords competitors rank for but main domain doesn't
    for (const competitor of competitorDomains) {
      for (const keyword of competitorKeywordMap[competitor]) {
        if (!mainDomainKeywords.has(keyword)) {
          // This is a gap keyword
          const keywordData = existingKeywords.find(k => k.keyword === keyword);
          if (!keywordData) continue;
          
          const existingGap = gapResults.find(gap => gap.keyword === keyword);
          if (existingGap) {
            existingGap.competitors.push(competitor);
          } else {
            gapResults.push({
              keyword: keyword,
              volume: keywordData.volume || keywordData.search_volume || 0,
              difficulty: keywordData.difficulty || 0,
              cpc: keywordData.cpc || 0,
              competitors: [competitor],
              mainDomainRanks: false,
              isHighValue: (keywordData.volume || keywordData.search_volume || 0) > 500,
              isLongTail: keyword.split(' ').length >= 3,
              searchVolume: keywordData.volume || keywordData.search_volume || 0,
              competitionIndex: keywordData.competition_index || 0,
              rankingDifficulty: calculateRankingDifficulty(keywordData),
              opportunityScore: calculateOpportunityScore(
                keywordData.volume || keywordData.search_volume || 0, 
                keywordData.cpc || 0
              )
            });
          }
        }
      }
    }
    
    // Sort by opportunity score
    gapResults.sort((a, b) => (b.opportunityScore || 0) - (a.opportunityScore || 0));
    
    console.log(`Generated ${gapResults.length} AI keyword gaps`);
    return gapResults.slice(0, limit);
  } catch (error) {
    console.error("Error generating AI keyword gaps:", error);
    return [];
  }
};

/**
 * Calculate a ranking difficulty score based on keyword data
 */
const calculateRankingDifficulty = (keywordData: any): number => {
  try {
    // Start with base difficulty
    let difficulty = keywordData.difficulty || 0;
    
    // Factor in search volume - higher volume generally means more difficulty
    const searchVolume = keywordData.volume || keywordData.search_volume || 0;
    if (searchVolume > 10000) difficulty += 20;
    else if (searchVolume > 5000) difficulty += 15;
    else if (searchVolume > 1000) difficulty += 10;
    else if (searchVolume > 500) difficulty += 5;
    
    // Factor in competition
    const competition = keywordData.competition_index || 0;
    difficulty += competition * 25;
    
    // Factor in CPC - higher CPC usually indicates more valuable/competitive terms
    const cpc = keywordData.cpc || 0;
    if (cpc > 5) difficulty += 15;
    else if (cpc > 3) difficulty += 10;
    else if (cpc > 1) difficulty += 5;
    
    // Cap difficulty at 100
    return Math.min(100, Math.max(0, difficulty));
  } catch (error) {
    console.warn("Error calculating ranking difficulty:", error);
    return 50; // Default middle difficulty
  }
};

/**
 * Calculate an opportunity score based on search volume and CPC
 * Higher values = better opportunities
 */
const calculateOpportunityScore = (searchVolume: number, cpc: number): number => {
  try {
    // Basic formula: volume * cpc with modifiers
    let score = (searchVolume / 100) * (cpc * 2);
    
    // Adjust based on volume thresholds
    if (searchVolume > 5000) score *= 1.5;
    else if (searchVolume > 1000) score *= 1.3;
    else if (searchVolume > 500) score *= 1.2;
    else if (searchVolume < 100) score *= 0.5;
    
    // Cap at 100
    return Math.min(100, Math.round(score));
  } catch (error) {
    console.warn("Error calculating opportunity score:", error);
    return 0;
  }
};
