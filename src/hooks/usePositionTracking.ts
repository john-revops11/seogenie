
import { useState, useEffect } from "react";
import { 
  fetchKeywordRankings, 
  storeRankingHistory, 
  getRankingHistory,
  calculateVisibilityScore,
  RankingData,
  PositionTrackingResult
} from "@/services/keywords/api/dataForSeo/positionTracking";
import { toast } from "sonner";

export function usePositionTracking(domain: string, keywords: string[] = []) {
  const [isLoading, setIsLoading] = useState(false);
  const [rankings, setRankings] = useState<RankingData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [visibilityScore, setVisibilityScore] = useState(0);
  const [historyData, setHistoryData] = useState<Record<string, RankingData[]>>({});
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchRankings = async (customKeywords?: string[]) => {
    if (!domain) {
      setError("Please enter a domain to track");
      return;
    }

    const keywordsToTrack = customKeywords || keywords;
    
    if (!keywordsToTrack || keywordsToTrack.length === 0) {
      setError("Please provide at least one keyword to track");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Clean the domain input
      const cleanDomain = domain.trim().replace(/^https?:\/\//i, '');
      
      // Fetch rankings from DataForSEO API
      const result = await fetchKeywordRankings(cleanDomain, keywordsToTrack);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch rankings");
      }

      // Process historical data to add previous position and change
      // Get the existing history
      const history = getRankingHistory(cleanDomain);
      
      // Get the dates in descending order
      const dates = Object.keys(history).sort().reverse();
      
      // If we have previous data, find the previous position for each keyword
      if (dates.length > 0) {
        const previousDate = dates[0]; // Most recent date in history
        const previousRankings = history[previousDate];
        
        // Add previous position data
        const rankingsWithHistory = result.rankings.map(ranking => {
          const previousRanking = previousRankings?.find(
            prevRank => prevRank.keyword === ranking.keyword
          );
          
          return {
            ...ranking,
            previousPosition: previousRanking?.position || null,
            change: previousRanking?.position 
              ? (previousRanking.position - (ranking.position || 999))
              : 0
          };
        });
        
        setRankings(rankingsWithHistory);
      } else {
        setRankings(result.rankings);
      }
      
      // Calculate visibility score
      const score = calculateVisibilityScore(result.rankings);
      setVisibilityScore(score);
      
      // Store the new rankings in history
      storeRankingHistory(cleanDomain, result.rankings);
      
      // Update history data state
      setHistoryData(getRankingHistory(cleanDomain));
      
      // Set last updated timestamp
      setLastUpdated(new Date().toLocaleString());
      
      toast.success('Position tracking data updated successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error(`Error fetching rankings: ${errorMessage}`);
      console.error('Position tracking error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load historical data on mount
  useEffect(() => {
    if (domain) {
      // Load historical data
      const cleanDomain = domain.trim().replace(/^https?:\/\//i, '');
      const history = getRankingHistory(cleanDomain);
      setHistoryData(history);
      
      // Calculate visibility from most recent data
      const dates = Object.keys(history).sort().reverse();
      if (dates.length > 0) {
        const latestDate = dates[0];
        const latestRankings = history[latestDate];
        setRankings(latestRankings);
        
        // Calculate and set visibility score
        const score = calculateVisibilityScore(latestRankings);
        setVisibilityScore(score);
        
        // Set last updated timestamp
        setLastUpdated(new Date(latestDate).toLocaleString());
      }
    }
  }, [domain]);

  return {
    isLoading,
    rankings,
    error,
    visibilityScore,
    historyData,
    lastUpdated,
    fetchRankings
  };
}
