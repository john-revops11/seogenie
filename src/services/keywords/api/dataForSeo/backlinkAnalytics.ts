
import { DataForSeoResponse } from '@/hooks/useDataForSeoClient';
import { callDataForSeoApi } from './base/apiClient';

// Backlinks Analytics
export const fetchBacklinkData = async (domain: string): Promise<DataForSeoResponse | null> => {
  return callDataForSeoApi<DataForSeoResponse>('/v3/backlinks/backlinks_overview/live', [{ 
    target: domain,
    limit: 10
  }]);
};
