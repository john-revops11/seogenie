
import { useState, useEffect } from 'react';
import { keywordGapsCache } from '@/components/keyword-gaps/KeywordGapUtils';
import { ApiSource } from '@/services/keywords/keywordGaps';

export function useKeywordGapSettings() {
  // Ensure initial value conforms to the ApiSource type
  const defaultApiSource: ApiSource = (keywordGapsCache.apiSource as ApiSource) || 'dataforseo-intersection';
  const [apiSource, setApiSource] = useState<ApiSource>(defaultApiSource);
  const [locationCode, setLocationCode] = useState<number>(keywordGapsCache.locationCode || 2840);

  useEffect(() => {
    // Update the cache when settings change
    keywordGapsCache.apiSource = apiSource;
    keywordGapsCache.locationCode = locationCode;
  }, [apiSource, locationCode]);

  const handleApiSourceChange = (value: ApiSource) => {
    setApiSource(value);
    keywordGapsCache.apiSource = value;
  };

  const handleLocationChange = (value: number) => {
    setLocationCode(value);
    keywordGapsCache.locationCode = value;
  };

  return {
    apiSource,
    locationCode,
    handleApiSourceChange,
    handleLocationChange
  };
}
