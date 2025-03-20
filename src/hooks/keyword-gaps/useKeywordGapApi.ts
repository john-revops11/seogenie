
import { toast } from "sonner";
import { ApiSource, KeywordGap, findKeywordGaps, findKeywordGapsWithDataForSEOIntersection } from "@/services/keywords/keywordGaps";
import { 
  keywordGapsCache, 
  getLocationNameByCode,
  normalizeDomainList
} from "@/components/keyword-gaps/KeywordGapUtils";
import { useDataForSeoClient } from "@/hooks/useDataForSeoClient";

export function useKeywordGapApi() {
  const dataForSeoClient = useDataForSeoClient();
  
  // Function to fetch keyword gaps from the API
  const fetchKeywordGaps = async (
    domain: string,
    competitorDomains: string[],
    keywords: any[],
    apiSource: ApiSource = 'dataforseo-intersection',
    locationCode: number = 2840
  ): Promise<KeywordGap[] | null> => {
    try {
      const normalizedDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '');
      // Filter out empty domains and normalize remaining ones
      const validCompetitors = competitorDomains
        .filter(d => d && d.trim() !== '')
        .map(d => d.trim());
      
      // Generate a cache key based on the inputs
      const cacheKey = `${normalizedDomain}_${validCompetitors.join('_')}_${apiSource}_${locationCode}`;
      
      // Initialize keywordGapsCache.data as an empty array if it doesn't exist
      if (!keywordGapsCache.data) {
        keywordGapsCache.data = [];
      }
      
      // Check if we already have cached results
      if (keywordGapsCache.data.length > 0 && 
          keywordGapsCache.domain === normalizedDomain &&
          arraysEqual(keywordGapsCache.competitorDomains, normalizeDomainList(validCompetitors)) &&
          keywordGapsCache.locationCode === locationCode &&
          keywordGapsCache.apiSource === apiSource) {
        console.log("Using cached keyword gaps");
        return keywordGapsCache.data;
      }
      
      console.log(`Generating keyword gaps for ${normalizedDomain} vs`, validCompetitors);
      console.log(`Using API source: ${apiSource} and location: ${getLocationNameByCode(locationCode)}`);
      
      if (validCompetitors.length === 0) {
        console.warn("No valid competitors provided for keyword gap analysis");
        toast.warning("Please add at least one competitor domain to perform gap analysis");
        return [];
      }
      
      // Add loading toast
      toast.loading("Analyzing keyword gaps...", { id: "keyword-gaps-loading" });
      
      try {
        // Use the DataForSEO domain intersection API if specified
        // This is the most efficient way to get keyword gaps
        let gaps: KeywordGap[] = [];
        
        if (apiSource === 'dataforseo-intersection') {
          toast.info(`Using DataForSEO Domain Intersection API for gap analysis`);
          
          try {
            gaps = await findKeywordGapsWithDataForSEOIntersection(
              normalizedDomain, 
              validCompetitors,
              dataForSeoClient,
              locationCode
            );
          } catch (intersectionError) {
            console.error("Error with DataForSEO intersection API:", intersectionError);
            toast.error(`DataForSEO intersection API error: ${intersectionError instanceof Error ? intersectionError.message : 'Unknown error'}`);
            
            // If the intersection API fails, try the standard method as fallback
            toast.info("Falling back to standard gap analysis method");
            gaps = await findKeywordGaps(
              normalizedDomain, 
              validCompetitors, 
              keywords, 
              100, 
              'dataforseo-live', // Fallback to DataForSEO Live API if intersection API fails
              locationCode
            );
          }
        } else {
          // Use the standard gap analysis method
          gaps = await findKeywordGaps(
            normalizedDomain, 
            validCompetitors, 
            keywords, 
            100, 
            apiSource, 
            locationCode
          );
        }
        
        toast.dismiss("keyword-gaps-loading");
        
        if (gaps && gaps.length > 0) {
          console.log(`Found ${gaps.length} keyword gaps`);
          
          // Update cache
          keywordGapsCache.data = gaps;
          keywordGapsCache.domain = normalizedDomain;
          keywordGapsCache.competitorDomains = normalizeDomainList(validCompetitors);
          keywordGapsCache.keywordsLength = keywords.length;
          keywordGapsCache.locationCode = locationCode;
          keywordGapsCache.apiSource = apiSource;
          
          toast.success(`Found ${gaps.length} keyword gaps for analysis`);
          return gaps;
        } else {
          console.warn("No keyword gaps found or service returned empty array");
          toast.warning("No keyword gaps found between your domain and competitors");
          return [];
        }
      } catch (error) {
        toast.dismiss("keyword-gaps-loading");
        throw error;
      }
    } catch (error) {
      console.error("Error fetching keyword gaps:", error);
      toast.error(`Failed to fetch keyword gaps: ${(error as Error).message}`);
      return null;
    }
  };
  
  // Helper function to compare arrays
  const arraysEqual = (arr1: string[], arr2: string[]): boolean => {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false;
    }
    return true;
  };

  return {
    fetchKeywordGaps,
    dataForSeoClient
  };
}
