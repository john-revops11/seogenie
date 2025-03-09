
import { useState } from 'react';
import { ApiSource } from '@/services/keywords/keywordGaps';
import { keywordGapsCache } from '@/components/keyword-gaps/KeywordGapUtils';

export function useKeywordGapSettings() {
  const [apiSource, setApiSource] = useState<ApiSource>(keywordGapsCache.apiSource || 'sample');
  const [locationCode, setLocationCode] = useState<number>(keywordGapsCache.locationCode || 2840); // Default to US
  
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
