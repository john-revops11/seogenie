
import { KeywordData } from '../types';

/**
 * Generates a sample ranking URL for a domain and keyword
 */
export const generateSampleUrl = (domain: string, keyword: string): string => {
  // Remove protocol and trailing slashes to get clean domain
  const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
  
  // Convert keyword to URL-friendly slug
  const slug = keyword.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  // Randomly select a common URL pattern
  const patterns = [
    `https://${cleanDomain}/${slug}/`,
    `https://${cleanDomain}/blog/${slug}/`,
    `https://${cleanDomain}/services/${slug}/`,
    `https://${cleanDomain}/product/${slug}/`,
    `https://${cleanDomain}/resources/${slug}/`,
  ];
  
  return patterns[Math.floor(Math.random() * patterns.length)];
};

/**
 * Generate mock keyword data for demonstration purposes
 */
export const generateMockKeywords = (domain: string, count: number = 15): KeywordData[] => {
  const keywordPrefixes = ['analytics', 'data', 'business', 'revenue', 'growth', 
    'marketing', 'strategy', 'insight', 'performance', 'metrics', 'dashboard',
    'reporting', 'forecast', 'prediction', 'trends', 'visualization'];
  
  const keywordSuffixes = ['software', 'platform', 'service', 'tool', 'solution',
    'management', 'analysis', 'optimization', 'tracking', 'reporting', 'dashboard',
    'integration', 'automation', 'intelligence', 'framework', 'methodology'];
  
  const keywords: KeywordData[] = [];
  
  for (let i = 0; i < count; i++) {
    const prefix = keywordPrefixes[Math.floor(Math.random() * keywordPrefixes.length)];
    const suffix = keywordSuffixes[Math.floor(Math.random() * keywordSuffixes.length)];
    const keyword = `${prefix} ${suffix}`;
    
    // Generate realistic-looking data
    const monthlySearch = Math.floor(Math.random() * 10000) + 100;
    const competitionIndex = Math.floor(Math.random() * 100) + 1;
    const cpc = (Math.random() * 10 + 0.5).toFixed(2);
    const position = Math.floor(Math.random() * 100) + 1;
    
    keywords.push({
      keyword,
      monthly_search: monthlySearch,
      competition: competitionIndex < 30 ? "low" : competitionIndex < 70 ? "medium" : "high",
      competition_index: competitionIndex,
      cpc: parseFloat(cpc),
      position,
      rankingUrl: generateSampleUrl(domain, keyword),
    });
  }
  
  return keywords;
};
