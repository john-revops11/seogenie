
import { getApiKey } from '../apiBase';

/**
 * Get DataForSEO credentials and create authorization header
 */
export const getDataForSeoCredentials = (): { encodedCredentials: string, login: string, password: string } => {
  // Get API credentials from dynamic API keys
  const dataForSeoCredentials = getApiKey("dataforseo") || "armin@revologyanalytics.com:ab4016dc9302b8cf";
  
  let login = 'armin@revologyanalytics.com';
  let password = 'ab4016dc9302b8cf';
  
  if (dataForSeoCredentials && dataForSeoCredentials.includes(':')) {
    // If credentials are in username:password format
    [login, password] = dataForSeoCredentials.split(':');
  }
  
  // Create authorization string
  const credentials = `${login}:${password}`;
  const encodedCredentials = btoa(credentials);
  
  return { encodedCredentials, login, password };
};
