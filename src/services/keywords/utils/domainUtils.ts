
/**
 * Utility functions for domain and URL operations
 */

/**
 * Extracts the domain name from a URL, removing protocol and www prefix
 */
export const extractDomain = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch (e) {
    return url;
  }
};
