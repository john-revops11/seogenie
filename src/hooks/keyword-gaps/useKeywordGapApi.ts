
import { toast } from "sonner";
import { KeywordGap } from "@/services/keywordService";
import { findKeywordGaps, ApiSource, findKeywordGapsWithDataForSEOIntersection } from "@/services/keywords/keywordGaps";
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
    apiSource: ApiSource = 'sample',
    locationCode: number = 2840
  ): Promise<KeywordGap[] | null> => {
    try {
      const normalizedDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '');
      // Filter out empty domains and normalize remaining ones
      const validCompetitors = competitorDomains
        .filter(d => d && d.trim() !== '')
        .map(d => d.trim());
      
      console.log(`Generating keyword gaps for ${normalizedDomain} vs`, validCompetitors);
      console.log(`Using API source: ${apiSource} and location: ${getLocationNameByCode(locationCode)}`);
      
      if (validCompetitors.length === 0) {
        console.warn("No valid competitors provided for keyword gap analysis");
        toast.warning("Please add at least one competitor domain to perform gap analysis");
        return [];
      }
      
      // Use the DataForSEO domain intersection API if specified
      let gaps: KeywordGap[] = [];
      
      if (apiSource === 'dataforseo-intersection') {
        toast.info(`Using DataForSEO Domain Intersection API for gap analysis`);
        gaps = await findKeywordGapsWithDataForSEOIntersection(
          normalizedDomain, 
          validCompetitors,
          dataForSeoClient,
          locationCode
        );
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
      
      if (gaps && gaps.length > 0) {
        console.log(`Found ${gaps.length} keyword gaps`);
        
        // Debug: Check which competitors actually appear in the results
        const competitorsInGaps = new Set<string>();
        const gapsByCompetitor = new Map<string, number>();
        
        gaps.forEach(gap => {
          if (gap.competitor) {
            competitorsInGaps.add(gap.competitor);
            gapsByCompetitor.set(gap.competitor, (gapsByCompetitor.get(gap.competitor) || 0) + 1);
          }
        });
        
        console.log("Competitors present in the gaps:", Array.from(competitorsInGaps));
        console.log("Gaps by competitor:", Object.fromEntries(gapsByCompetitor));
        
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
      console.error("Error fetching keyword gaps:", error);
      toast.error(`Failed to fetch keyword gaps: ${(error as Error).message}`);
      return null;
    }
  };

  return {
    fetchKeywordGaps,
    dataForSeoClient
  };
}
