import { getApiKey } from '@/services/apiIntegrationService';

const DATAFORSEO_API_URL = "https://api.dataforseo.com/v3/serp/google/organic/live/advanced";

// Export function to fetch domain keywords using DataForSEO
export const fetchDataForSeoDomainKeywords = async (domain: string) => {
  try {
    console.log(`Fetching DataForSEO domain keywords for: ${domain}`);
    
    const apiCredentials = getApiKey('dataforseo');
    if (!apiCredentials) {
      throw new Error('DataForSEO API credentials not configured');
    }
    
    const [login, password] = apiCredentials.split(':');

    const postData = {
      tasks: [
        {
          target: domain,
          location_name: "United States",
          language_name: "English"
        }
      ]
    };

    const auth = 'Basic ' + Buffer.from(`${login}:${password}`).toString('base64');

    const response = await fetch(DATAFORSEO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': auth
      },
      body: JSON.stringify(postData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DataForSEO API error:', response.status, errorText);
      throw new Error(`DataForSEO API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.tasks && data.tasks[0] && data.tasks[0].result && data.tasks[0].result[0]) {
      const organicResults = data.tasks[0].result[0].items || [];
      const keywords = organicResults.map((item: any) => item.keyword);
      console.log(`DataForSEO keywords for ${domain}:`, keywords);
      return keywords;
    } else {
      console.warn('No results from DataForSEO API for domain:', domain);
      return [];
    }
  } catch (error) {
    console.error('Error fetching DataForSEO domain keywords:', error);
    throw error;
  }
};
