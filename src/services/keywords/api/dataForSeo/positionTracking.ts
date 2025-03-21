
import { getDataForSeoCredentials } from './auth';
import { parseApiResponse, checkApiResponseStatus } from './utils';

export interface RankingData {
  keyword: string;
  position: number | null;
  previousPosition: number | null;
  change: number;
  url: string | null;
  timestamp: string;
  hasSnippet: boolean;
  hasFeaturedSnippet: boolean;
  hasPaa: boolean; // People Also Ask
  hasKnowledgePanel: boolean;
  hasLocalPack: boolean;
  hasVideo: boolean;
  hasImage: boolean;
  serp_features?: string[];
}

export interface PositionTrackingResult {
  success: boolean;
  rankings: RankingData[];
  error?: string;
}

/**
 * Fetches current SERP rankings for a set of keywords
 */
export const fetchKeywordRankings = async (
  domain: string,
  keywords: string[],
  locationCode: number = 2840 // Default to US
): Promise<PositionTrackingResult> => {
  try {
    if (!keywords || keywords.length === 0) {
      throw new Error("No keywords provided for position tracking");
    }

    const { encodedCredentials } = getDataForSeoCredentials();

    // Format domain by removing http/https if present
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '');
    
    // Prepare tasks for batch processing - one task per keyword
    const tasks = keywords.map(keyword => ({
      keyword,
      location_code: locationCode,
      language_code: "en",
      depth: 100, // Look up to position 100
      se_domain: "google.com",
      device: "desktop"
    }));
    
    console.log(`Fetching SERP data for ${keywords.length} keywords for domain ${cleanDomain}`);
    
    // Call the SERP API
    const SERP_API_URL = "https://api.dataforseo.com/v3/serp/google/organic/live/advanced";
    
    const response = await fetch(SERP_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${encodedCredentials}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(tasks)
    });

    // Parse response
    const data = await parseApiResponse(response);
    
    // Check API status
    checkApiResponseStatus(data);
    
    // Process the results to find the domain's rankings
    const rankings: RankingData[] = [];
    
    if (data.tasks && data.tasks.length > 0) {
      for (const task of data.tasks) {
        if (task.result && task.result.length > 0) {
          const keyword = task.data?.keyword || '';
          const result = task.result[0];
          
          // Look for the domain in the result items
          let domainRanking: RankingData | null = null;
          
          if (result.items && result.items.length > 0) {
            for (let i = 0; i < result.items.length; i++) {
              const item = result.items[i];
              
              // Check if this result is for our domain
              if (item.domain && item.domain.includes(cleanDomain)) {
                domainRanking = {
                  keyword,
                  position: item.rank_absolute || null,
                  previousPosition: null, // We need historical data for this
                  change: 0, // Calculate once we have historical data
                  url: item.url || null,
                  timestamp: new Date().toISOString(),
                  hasSnippet: !!item.description,
                  hasFeaturedSnippet: item.featured_snippet || false,
                  hasPaa: item.people_also_ask || false,
                  hasKnowledgePanel: item.knowledge_graph || false,
                  hasLocalPack: item.local_pack || false,
                  hasVideo: item.video || false,
                  hasImage: item.images || false,
                  serp_features: item.serp_features || []
                };
                break; // Found our domain, no need to continue
              }
            }
          }
          
          // If we didn't find our domain in the results
          if (!domainRanking) {
            domainRanking = {
              keyword,
              position: null, // Not in top 100
              previousPosition: null,
              change: 0,
              url: null,
              timestamp: new Date().toISOString(),
              hasSnippet: false,
              hasFeaturedSnippet: false,
              hasPaa: false,
              hasKnowledgePanel: false,
              hasLocalPack: false,
              hasVideo: false,
              hasImage: false,
              serp_features: []
            };
          }
          
          rankings.push(domainRanking);
        }
      }
    }
    
    return {
      success: true,
      rankings
    };
  } catch (error) {
    console.error("Error fetching keyword rankings:", error);
    return {
      success: false,
      rankings: [],
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
};

/**
 * Store ranking history for a domain
 * In a real implementation, this would save to a database
 * For now, we'll use localStorage as a simple storage mechanism
 */
export const storeRankingHistory = (
  domain: string, 
  rankings: RankingData[]
): void => {
  try {
    // Generate a storage key for this domain
    const storageKey = `ranking_history_${domain.replace(/[^a-z0-9]/gi, '_')}`;
    
    // Get existing history if any
    const existingHistoryString = localStorage.getItem(storageKey);
    const existingHistory: Record<string, RankingData[]> = existingHistoryString 
      ? JSON.parse(existingHistoryString) 
      : {};
    
    // Get today's date as YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];
    
    // Update history with today's rankings
    existingHistory[today] = rankings;
    
    // Save back to localStorage
    localStorage.setItem(storageKey, JSON.stringify(existingHistory));
    
    console.log(`Stored ${rankings.length} rankings for ${domain} on ${today}`);
  } catch (error) {
    console.error("Error storing ranking history:", error);
  }
};

/**
 * Get ranking history for a domain
 */
export const getRankingHistory = (
  domain: string
): Record<string, RankingData[]> => {
  try {
    // Generate storage key for this domain
    const storageKey = `ranking_history_${domain.replace(/[^a-z0-9]/gi, '_')}`;
    
    // Get history from localStorage
    const historyString = localStorage.getItem(storageKey);
    if (!historyString) {
      return {};
    }
    
    return JSON.parse(historyString);
  } catch (error) {
    console.error("Error retrieving ranking history:", error);
    return {};
  }
};

/**
 * Calculate a visibility score for a set of rankings
 * Higher scores mean better visibility in search results
 */
export const calculateVisibilityScore = (rankings: RankingData[]): number => {
  if (!rankings || rankings.length === 0) {
    return 0;
  }
  
  let totalScore = 0;
  let totalKeywords = 0;
  
  for (const ranking of rankings) {
    if (ranking.position !== null) {
      totalKeywords++;
      
      // Score formula based on position:
      // #1 = 100 points
      // #2-3 = 70 points
      // #4-10 = 50 points
      // #11-20 = 30 points
      // #21-50 = 10 points
      // #51-100 = 5 points
      // Not ranking = 0 points
      
      const position = ranking.position;
      let score = 0;
      
      if (position === 1) score = 100;
      else if (position <= 3) score = 70;
      else if (position <= 10) score = 50;
      else if (position <= 20) score = 30;
      else if (position <= 50) score = 10;
      else if (position <= 100) score = 5;
      
      // Add bonus for featured snippet (20 points)
      if (ranking.hasFeaturedSnippet) {
        score += 20;
      }
      
      totalScore += score;
    }
  }
  
  // Calculate average score (0-100)
  return totalKeywords > 0 ? Math.round(totalScore / totalKeywords) : 0;
};
