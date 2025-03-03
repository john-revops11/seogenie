
/**
 * URL utility functions
 */

// Ensure URL has a valid format for API requests
export const ensureValidUrl = (url: string): string => {
  // Remove any protocol first
  let cleanUrl = url.replace(/^(https?:\/\/)?(www\.)?/, '');
  
  // Remove any path or query parameters
  cleanUrl = cleanUrl.split('/')[0];
  
  // Remove any trailing periods, commas, etc.
  cleanUrl = cleanUrl.replace(/[.,;:]+$/, '');
  
  // Remove whitespace
  cleanUrl = cleanUrl.trim();
  
  // Log the cleaned URL for debugging
  console.log(`Original URL: ${url}, Cleaned URL: ${cleanUrl}`);
  
  return cleanUrl;
};

// Format URL with protocol for display or specific API needs
export const formatUrlWithProtocol = (url: string): string => {
  if (!url) return '';
  
  const cleanUrl = ensureValidUrl(url);
  return `https://${cleanUrl}`;
};

// Get domain name from full URL
export const getDomainName = (url: string): string => {
  return ensureValidUrl(url);
};

// Check if a string is a valid URL
export const isValidUrl = (url: string): boolean => {
  try {
    // Simple validation - just checks if there's a domain name with at least one dot
    const cleanUrl = ensureValidUrl(url);
    return cleanUrl.includes('.') && cleanUrl.length > 3;
  } catch (error) {
    return false;
  }
};
