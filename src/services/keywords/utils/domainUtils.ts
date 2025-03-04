
/**
 * Utility functions for domain and URL operations
 */

/**
 * Extracts the domain name from a URL, removing protocol and www prefix
 */
export const extractDomain = (url: string): string => {
  try {
    // Handle URLs that don't have a protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    return new URL(url).hostname.replace(/^www\./, '');
  } catch (e) {
    // If URL parsing fails, return the original string
    // This can happen with invalid URLs or simple domain names
    return url.replace(/^www\./, '');
  }
};

/**
 * Normalizes a domain or URL for comparison
 * Removes protocol, www prefix, and trailing slashes
 */
export const normalizeDomain = (url: string): string => {
  try {
    const domain = extractDomain(url);
    return domain.toLowerCase().trim();
  } catch (e) {
    return url.toLowerCase().trim();
  }
};

/**
 * Checks if two domains are the same after normalization
 */
export const areSameDomains = (domain1: string, domain2: string): boolean => {
  return normalizeDomain(domain1) === normalizeDomain(domain2);
};
