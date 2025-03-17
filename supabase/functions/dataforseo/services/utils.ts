
// Helper functions for data cleaning and processing

/**
 * Clean a domain by removing protocol and www prefix
 */
export function cleanDomain(domain: string): string {
  return domain.replace(/^https?:\/\//, '').replace(/^www\./, '');
}

/**
 * Format error response with consistent structure
 */
export function formatErrorResponse(domain: string, error: Error): any {
  console.error(`Error processing request for ${domain}:`, error);
  return {
    success: false,
    error: error.message,
  };
}

/**
 * Extract items from API response with error handling
 */
export function extractItems(result: any, errorMessage: string): any[] {
  if (!result || !result.tasks || result.tasks.length === 0 || !result.tasks[0].result) {
    throw new Error(errorMessage);
  }
  
  return result.tasks[0].result?.[0]?.items || [];
}
