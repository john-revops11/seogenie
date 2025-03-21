import { toast } from 'sonner';

interface RateLimitConfig {
  maxRequests: number;
  timeWindow: number; // in milliseconds
  timeout: number; // in milliseconds
}

interface RateLimitState {
  requests: number;
  windowStart: number;
}

class RateLimiter {
  private static instance: RateLimiter;
  private limits: Map<string, RateLimitConfig> = new Map();
  private states: Map<string, RateLimitState> = new Map();
  private timeouts: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {
    // Default configurations
    this.setLimit('openai', { maxRequests: 60, timeWindow: 60000, timeout: 30000 }); // 60 requests per minute
    this.setLimit('pinecone', { maxRequests: 100, timeWindow: 60000, timeout: 10000 }); // 100 requests per minute
    this.setLimit('semrush', { maxRequests: 50, timeWindow: 60000, timeout: 15000 }); // 50 requests per minute
    this.setLimit('dataforseo', { maxRequests: 30, timeWindow: 60000, timeout: 20000 }); // 30 requests per minute
  }

  public static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  /**
   * Sets rate limit configuration for a service
   */
  public setLimit(service: string, config: RateLimitConfig): void {
    this.limits.set(service, config);
    if (!this.states.has(service)) {
      this.states.set(service, { requests: 0, windowStart: Date.now() });
    }
  }

  /**
   * Checks if a request is allowed and updates the rate limit state
   */
  public async checkLimit(service: string): Promise<void> {
    const config = this.limits.get(service);
    if (!config) {
      throw new Error(`No rate limit configuration found for service: ${service}`);
    }

    let state = this.states.get(service);
    if (!state) {
      state = { requests: 0, windowStart: Date.now() };
      this.states.set(service, state);
    }

    const now = Date.now();
    if (now - state.windowStart >= config.timeWindow) {
      // Reset window
      state.requests = 0;
      state.windowStart = now;
    }

    if (state.requests >= config.maxRequests) {
      const waitTime = config.timeWindow - (now - state.windowStart);
      toast.error(`Rate limit exceeded for ${service}. Please wait ${Math.ceil(waitTime / 1000)} seconds.`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      state.requests = 0;
      state.windowStart = Date.now();
    }

    state.requests++;
  }

  /**
   * Sets a timeout for an API request
   */
  public async setTimeout<T>(service: string, promise: Promise<T>): Promise<T> {
    const config = this.limits.get(service);
    if (!config) {
      throw new Error(`No timeout configuration found for service: ${service}`);
    }

    const timeoutPromise = new Promise<T>((_, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Request to ${service} timed out after ${config.timeout}ms`));
      }, config.timeout);
      this.timeouts.set(service, timeout);
    });

    try {
      const result = await Promise.race([promise, timeoutPromise]);
      const timeout = this.timeouts.get(service);
      if (timeout) {
        clearTimeout(timeout);
        this.timeouts.delete(service);
      }
      return result;
    } catch (error) {
      const timeout = this.timeouts.get(service);
      if (timeout) {
        clearTimeout(timeout);
        this.timeouts.delete(service);
      }
      throw error;
    }
  }

  /**
   * Clears all timeouts for a service
   */
  public clearState(service: string): void {
    this.states.delete(service);
    const timeout = this.timeouts.get(service);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(service);
    }
  }

  /**
   * Clears all timeouts
   */
  public clearAllStates(): void {
    this.states.clear();
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts.clear();
  }

  /**
   * Gets current rate limit status for a service
   */
  public getStatus(service: string): {
    requests: number;
    maxRequests: number;
    timeWindow: number;
    remainingRequests: number;
    windowStart: number;
  } | null {
    const config = this.limits.get(service);
    const state = this.states.get(service);

    if (!config || !state) {
      return null;
    }

    return {
      requests: state.requests,
      maxRequests: config.maxRequests,
      timeWindow: config.timeWindow,
      remainingRequests: Math.max(0, config.maxRequests - state.requests),
      windowStart: state.windowStart
    };
  }
}

// Export singleton instance
export const rateLimiter = RateLimiter.getInstance();
