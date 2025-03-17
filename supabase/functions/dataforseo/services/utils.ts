
// Helper functions for data cleaning and processing

/**
 * Clean a domain by removing protocol and www prefix
 */
export function cleanDomain(domain: string): string {
  if (!domain) return "";
  return domain.replace(/^https?:\/\//, '').replace(/^www\./, '');
}

/**
 * Format error response with consistent structure
 */
export function formatErrorResponse(domain: string, error: Error): any {
  console.error(`Error processing request for ${domain}:`, error);
  
  // Check if error is a timeout or network error
  const isTimeoutError = 
    error.name === 'TimeoutError' || 
    error.name === 'AbortError' || 
    (error.message && (
      error.message.includes('timeout') || 
      error.message.includes('timed out') || 
      error.message.includes('aborted')
    ));
  
  return {
    success: false,
    error: error.message || "Unknown error",
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

/**
 * Safely access nested properties in API response
 */
export function safeGet(obj: any, path: string, defaultValue: any = null): any {
  try {
    const parts = path.split('.');
    let current = obj;
    
    for (const part of parts) {
      if (current === null || current === undefined) {
        return defaultValue;
      }
      current = current[part];
    }
    
    return current === undefined ? defaultValue : current;
  } catch (error) {
    console.warn(`Error accessing path ${path}:`, error);
    return defaultValue;
  }
}
