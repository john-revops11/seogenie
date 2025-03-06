
import { useState } from "react";
import { toast } from "sonner";
import { ApiSource } from "@/services/keywords/keywordGaps";
import { keywordGapsCache, getLocationNameByCode } from "@/components/keyword-gaps/KeywordGapUtils";

export function useKeywordGapSettings() {
  const [apiSource, setApiSource] = useState<ApiSource>('sample');
  const [locationCode, setLocationCode] = useState<number>(keywordGapsCache.locationCode || 2840);

  const handleApiSourceChange = (value: ApiSource) => {
    if (value !== apiSource) {
      setApiSource(value);
      toast.info(`Switched to ${value} data source`);
    }
  };

  const handleLocationChange = (newLocationCode: number) => {
    if (newLocationCode !== locationCode) {
      setLocationCode(newLocationCode);
      keywordGapsCache.locationCode = newLocationCode;
      toast.info(`Switched location to ${getLocationNameByCode(newLocationCode)}`);
    }
  };

  return {
    apiSource,
    locationCode,
    handleApiSourceChange,
    handleLocationChange
  };
}
