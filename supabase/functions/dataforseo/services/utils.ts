
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
  
  // Check if error is a timeout or network error
  const isTimeoutError = error.message.includes('timeout') || 
                         error.name === 'AbortError' || 
                         error.message.includes('aborted');
  
  return {
    success: false,
    error: error.message,
    errorType: isTimeoutError ? 'timeout' : 'api',
    domain: domain
  };
}

/**
 * Extract items from API response with error handling
 */
export function extractItems(result: any, errorMessage: string): any[] {
  if (!result) {
    console.error("Null or undefined API result");
    throw new Error(errorMessage);
  }
  
  if (!result.tasks || result.tasks.length === 0) {
    console.error("No tasks in API result");
    throw new Error(errorMessage);
  }
  
  if (!result.tasks[0].result) {
    console.warn("No result in task");
    return [];
  }
  
  return result.tasks[0].result?.[0]?.items || [];
}
