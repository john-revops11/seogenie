
/**
 * Utility functions for domain validation and formatting
 */

/**
 * Validates if a string is a valid URL
 */
export const validateUrl = (url: string): boolean => {
  if (!url) return false;
  
  let processedUrl = url;
  if (!/^https?:\/\//i.test(url)) {
    processedUrl = 'https://' + url;
  }
  
  try {
    new URL(processedUrl);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Formats a URL by adding https:// if missing
 */
export const formatUrl = (url: string): string => {
  if (!url) return "";
  
  if (!/^https?:\/\//i.test(url)) {
    return 'https://' + url;
  }
  return url;
};
