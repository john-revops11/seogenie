
import { DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD } from '../../apiConfig';
import { getApiKey } from '../apiBase';

/**
 * Get DataForSEO credentials and create authorization header
 */
export const getDataForSeoCredentials = (): { encodedCredentials: string, login: string, password: string } => {
  // Get API credentials from dynamic API keys
  const dataForSeoCredentials = getApiKey("dataforseo");
  
  let login, password;
  
  if (dataForSeoCredentials && dataForSeoCredentials.includes(':')) {
    // If credentials are in username:password format
    [login, password] = dataForSeoCredentials.split(':');
  } else {
    // Fall back to default credentials
    login = DATAFORSEO_LOGIN;
    password = DATAFORSEO_PASSWORD;
  }
  
  // Create authorization string
  const credentials = `${login}:${password}`;
  const encodedCredentials = btoa(credentials);
  
  return { encodedCredentials, login, password };
};
