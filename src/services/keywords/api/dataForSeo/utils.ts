
import { KeywordData } from '../../types';
import { getCompetitionLabel } from '../apiUtils';

/**
 * Function to safely convert potential string numbers to actual numbers
 */
export const safeNumberConversion = (value: any): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

/**
 * Parse API response text with better error handling
 */
export const parseApiResponse = async (response: Response): Promise<any> => {
  try {
    const responseText = await response.text();
    if (!responseText || responseText.trim() === '') {
      throw new Error("Empty response from API");
    }
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Failed to parse DataForSEO API response:", error);
    throw new Error(`Failed to parse API response: ${error instanceof Error ? error.message : 'Unknown parsing error'}`);
  }
};

/**
 * Convert API keyword data to our standardized KeywordData format
 */
export const convertToKeywordData = (item: any): KeywordData => {
  return {
    keyword: item.keyword,
    monthly_search: safeNumberConversion(item.search_volume) || 0,
    competition: getCompetitionLabel(safeNumberConversion(item.competition_index) || 50),
    competition_index: safeNumberConversion(item.competition_index) || 50,
    cpc: safeNumberConversion(item.cpc) || 0,
    position: null,
    rankingUrl: null,
  };
};

/**
 * Check the API response status and throw appropriate errors
 */
export const checkApiResponseStatus = (data: any): void => {
  if (data.status_code !== 20000) {
    const errorMsg = data.status_message || "Unknown DataForSEO API error";
    throw new Error(`DataForSEO API error: ${errorMsg}`);
  }
};
