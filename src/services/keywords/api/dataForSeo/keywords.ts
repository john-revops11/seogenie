
import { KeywordData } from '../../types';
import { getApiKey } from '@/services/apiIntegrationService';

const DATAFORSEO_KEYWORDS_API_URL = "https://api.dataforseo.com/v3/keywords_data/google/search_volume/live";

/**
 * Fetches keyword search volume data from DataForSEO
 */
export const fetchKeywordVolumeData = async (keywords: string[]): Promise<KeywordData[]> => {
  try {
    console.log(`Fetching DataForSEO volume data for ${keywords.length} keywords`);
    
    if (keywords.length === 0) {
      return [];
    }
    
    const apiCredentials = getApiKey('dataforseo');
    if (!apiCredentials) {
      throw new Error('DataForSEO API credentials not configured');
    }
    
    const login = apiCredentials.split(':')[0];
    const password = apiCredentials.split(':')[1];

    const postData = {
      tasks: keywords.map(keyword => ({
        keyword: keyword,
        language_name: "English",
        location_name: "United States"
      }))
    };

    const response = await fetch(DATAFORSEO_KEYWORDS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${login}:${password}`)
      },
      body: JSON.stringify(postData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DataForSEO API error:', errorText);
      throw new Error(`DataForSEO API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.tasks || data.tasks.length === 0) {
      console.warn('DataForSEO API returned no tasks');
      return [];
    }

    // Map the API response to our KeywordData format
    const keywordData: KeywordData[] = [];
    data.tasks.forEach((task: any) => {
      if (task.result && Array.isArray(task.result)) {
        task.result.forEach((resultItem: any) => {
          if (resultItem.items && Array.isArray(resultItem.items)) {
            resultItem.items.forEach((item: any) => {
              keywordData.push({
                keyword: item.keyword,
                monthly_search: item.search_volume,
                competition: item.competition,
                competition_index: item.competition,
                cpc: item.cpc,
                position: null,
                rankingUrl: null
              });
            });
          }
        });
      }
    });

    return keywordData;
  } catch (error) {
    console.error('Error fetching keyword volume data:', error);
    throw error;
  }
};
