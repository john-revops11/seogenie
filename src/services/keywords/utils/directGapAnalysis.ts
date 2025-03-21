
import { KeywordData, KeywordGap } from '../types';

/**
 * Determines if a keyword has potential to be a high, medium or low opportunity
 */
export const determineOpportunityLevel = (
  keywordData: KeywordData,
  mainDomainName: string
): 'high' | 'medium' | 'low' => {
  let opportunity: 'high' | 'medium' | 'low' = 'medium';
  
  const relevance = calculateRelevanceScore(keywordData, mainDomainName);
  
  if (keywordData.monthly_search > 500 && keywordData.competition_index < 30 && relevance > 70) {
    opportunity = 'high';
  } 
  else if (keywordData.monthly_search < 100 && keywordData.competition_index > 60 && relevance < 40) {
    opportunity = 'low';
  }
  
  return opportunity;
};

/**
 * Calculates the relevance score for a keyword based on competition and domain name matching
 */
export const calculateRelevanceScore = (keywordData: KeywordData, mainDomainName: string): number => {
  return Math.min(100, Math.max(0, 
    100 - keywordData.competition_index + 
    (keywordData.keyword.toLowerCase().includes(mainDomainName.toLowerCase()) ? 20 : 0)
  ));
};

/**
 * Calculates the competitive advantage score based on position and search volume
 */
export const calculateCompetitiveAdvantage = (position: number, monthlySearch: number): number => {
  return Math.min(100, Math.max(0,
    Math.round(((30 - position) / 30) * 50) + 
    Math.min(50, Math.round(monthlySearch / 100))
  ));
};

/**
 * Finds direct keyword gaps by analyzing ranking data
 */
export const findDirectKeywordGaps = (
  mainDomainName: string,
  competitorDomainNames: string[],
  keywords: KeywordData[],
  targetGapCount: number
): KeywordGap[] => {
  const potentialGaps = keywords.filter(kw => {
    const mainDoesntRank = kw.position === null || kw.position > 30;
    
    const anyCompetitorRanks = kw.competitorRankings && 
      Object.keys(kw.competitorRankings).some(comp => 
        competitorDomainNames.includes(comp) && 
        kw.competitorRankings[comp] !== null && 
        kw.competitorRankings[comp]! <= 30
      );
    
    return mainDoesntRank && anyCompetitorRanks;
  });
  
  console.log(`Found ${potentialGaps.length} potential keyword gaps before analysis`);
  
  const directGaps: KeywordGap[] = [];
  const gapsByCompetitor = new Map<string, KeywordGap[]>();
  competitorDomainNames.forEach(comp => gapsByCompetitor.set(comp, []));
  
  for (const kw of potentialGaps) {
    if (kw.competitorRankings) {
      for (const [competitor, position] of Object.entries(kw.competitorRankings)) {
        if (position !== null && position <= 30 && competitorDomainNames.includes(competitor)) {
          const opportunity = determineOpportunityLevel(kw, mainDomainName);
          const relevance = calculateRelevanceScore(kw, mainDomainName);
          const competitiveAdvantage = calculateCompetitiveAdvantage(position, kw.monthly_search);
          
          const gap: KeywordGap = {
            keyword: kw.keyword,
            volume: kw.monthly_search,
            difficulty: kw.competition_index,
            opportunity: opportunity,
            competitor: competitor,
            rank: position,
            isTopOpportunity: false,
            relevance: relevance,
            competitiveAdvantage: competitiveAdvantage,
            keywordType: "gap"
          };
          
          const competitorGaps = gapsByCompetitor.get(competitor) || [];
          if (competitorGaps.length < targetGapCount) {
            competitorGaps.push(gap);
            gapsByCompetitor.set(competitor, competitorGaps);
          }
        }
      }
    }
  }
  
  // Add shared keywords (keywords where both main domain and competitors rank)
  const sharedKeywords = keywords.filter(kw => {
    const mainRanks = kw.position !== null && kw.position <= 30;
    const anyCompetitorRanks = kw.competitorRankings && 
      Object.keys(kw.competitorRankings).some(comp => 
        competitorDomainNames.includes(comp) && 
        kw.competitorRankings[comp] !== null && 
        kw.competitorRankings[comp]! <= 30
      );
    
    return mainRanks && anyCompetitorRanks;
  }).slice(0, targetGapCount);
  
  for (const kw of sharedKeywords) {
    directGaps.push({
      keyword: kw.keyword,
      volume: kw.monthly_search,
      difficulty: kw.competition_index,
      opportunity: 'medium',
      competitor: null,
      rank: kw.position || 0,
      isTopOpportunity: false,
      relevance: 70,
      competitiveAdvantage: 60,
      keywordType: "shared"
    });
  }
  
  // Add missing keywords (keywords that nobody ranks for but might be valuable)
  const missingKeywords = keywords.filter(kw => {
    const mainDoesntRank = kw.position === null || kw.position > 30;
    const noCompetitorRanks = !kw.competitorRankings || 
      Object.values(kw.competitorRankings).every(pos => pos === null || pos > 30);
    
    return mainDoesntRank && noCompetitorRanks && kw.monthly_search > 100;
  }).slice(0, targetGapCount);
  
  for (const kw of missingKeywords) {
    directGaps.push({
      keyword: kw.keyword,
      volume: kw.monthly_search,
      difficulty: kw.competition_index,
      opportunity: kw.monthly_search > 500 ? 'high' : 'medium',
      competitor: null,
      rank: null,
      isTopOpportunity: false,
      relevance: 40,
      competitiveAdvantage: 0,
      keywordType: "missing"
    });
  }
  
  for (const competitorGaps of gapsByCompetitor.values()) {
    directGaps.push(...competitorGaps);
  }
  
  return directGaps;
};

/**
 * Prioritizes keyword gaps by scoring and marks top opportunities
 */
export const prioritizeKeywordGaps = (gaps: KeywordGap[]): KeywordGap[] => {
  const sortedGaps = [...gaps].sort((a, b) => {
    const scoreA = (a.relevance || 0) * 0.4 + (a.competitiveAdvantage || 0) * 0.4 + Math.min(100, a.volume / 10) * 0.2;
    const scoreB = (b.relevance || 0) * 0.4 + (b.competitiveAdvantage || 0) * 0.4 + Math.min(100, b.volume / 10) * 0.2;
    return scoreB - scoreA;
  });
  
  // Mark top 5 opportunities
  sortedGaps.slice(0, 5).forEach(gap => {
    const originalGap = gaps.find(g => g.keyword === gap.keyword && g.competitor === gap.competitor);
    if (originalGap) {
      originalGap.isTopOpportunity = true;
    }
  });
  
  return gaps;
};
