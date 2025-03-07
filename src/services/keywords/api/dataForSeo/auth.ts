
import { DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD } from '../../apiConfig';
import { getApiKey } from '../apiBase';

/**
 * Get DataForSEO credentials and create authorization header
 */
export const getDataForSeoCredentials = (): { encodedCredentials: string, login: string, password: string } => {
  // Get API credentials from dynamic API keys
  const dataForSeoCredentials = getApiKey("dataforseo");
  
  if (!dataForSeoCredentials) {
    throw new Error("DataForSEO API credentials not configured");
  }
  
  let login, password;
  
  // Check if credentials are in username:password format
  if (dataForSeoCredentials.includes(':')) {
    [login, password] = dataForSeoCredentials.split(':');
  } else {
    // Fall back to default credentials if format is incorrect
    login = DATAFORSEO_LOGIN;
    password = DATAFORSEO_PASSWORD;
  }
  
  // Create authorization string
  const credentials = `${login}:${password}`;
  const encodedCredentials = btoa(credentials);
  
  return { encodedCredentials, login, password };
};
