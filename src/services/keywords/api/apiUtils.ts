
import { KeywordData } from '../types';

/**
 * Helper function to convert difficulty number to competition label
 */
export function getCompetitionLabel(difficulty: number): string {
  if (difficulty < 30) return "low";
  if (difficulty < 60) return "medium";
  return "high";
}

/**
 * Ensure a string is a valid URL with protocol
 */
export function ensureValidUrl(urlString: string): string {
  try {
    // If it's already a valid URL, return it
    new URL(urlString);
    return urlString;
  } catch (e) {
    // If not, try adding https://
    try {
      const withHttps = `https://${urlString}`;
      new URL(withHttps);
      return withHttps;
    } catch (e) {
      throw new Error(`Invalid URL: ${urlString}`);
    }
  }
}
