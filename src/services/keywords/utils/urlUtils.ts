
/**
 * URL validation and formatting utilities
 */

// Ensure a string is a valid URL with protocol
export function ensureValidUrl(urlString: string): string {
  if (!urlString) {
    throw new Error("URL cannot be empty");
  }
  
  // Remove any whitespace
  let cleanUrl = urlString.trim();
  
  // Strip http/https protocol if present
  if (cleanUrl.startsWith('http://')) {
    cleanUrl = cleanUrl.substring(7);
  } else if (cleanUrl.startsWith('https://')) {
    cleanUrl = cleanUrl.substring(8);
  }
  
  // Remove trailing slashes
  while (cleanUrl.endsWith('/')) {
    cleanUrl = cleanUrl.slice(0, -1);
  }
  
  // Add protocol back
  return `https://${cleanUrl}`;
}
