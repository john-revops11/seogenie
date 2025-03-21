
import { DataForSeoResponse } from '@/hooks/useDataForSeoClient';
import { callDataForSeoApi } from './base/apiClient';

// Keyword Search Volume - used for bulk keyword data
export const fetchKeywordVolume = async (keywords: string[]): Promise<DataForSeoResponse | null> => {
  return callDataForSeoApi<DataForSeoResponse>('/v3/keywords_data/google/search_volume/live', [
    {
      language_code: "en",
      location_code: 2840,
      keywords
    }
  ]);
};

// Related Keywords
export const fetchRelatedKeywords = async (
  keyword: string,
  locationCode: number = 2840,
  depth: number = 2,
  limit: number = 100
): Promise<DataForSeoResponse | null> => {
  return callDataForSeoApi<DataForSeoResponse>('/v3/dataforseo_labs/google/related_keywords/live', [{ 
    keyword,
    location_code: locationCode,
    language_code: "en",
    depth,
    include_seed_keyword: false,
    include_serp_info: false,
    ignore_synonyms: false,
    include_clickstream_data: false,
    limit
  }]);
};

// Keyword Suggestions
export const fetchKeywordSuggestions = async (
  keyword: string,
  locationCode: number = 2840,
  limit: number = 100
): Promise<DataForSeoResponse | null> => {
  return callDataForSeoApi<DataForSeoResponse>('/v3/dataforseo_labs/google/keyword_suggestions/live', [{ 
    keyword,
    location_code: locationCode,
    language_code: "en",
    include_seed_keyword: false,
    include_serp_info: false,
    ignore_synonyms: false,
    include_clickstream_data: false,
    exact_match: false,
    limit
  }]);
};
