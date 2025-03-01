
// Domain analysis utility functions for content generation

/**
 * Analyzes a domain and relevant keywords to extract niche-related terms
 */
export const analyzeDomainNiche = (domain: string, keywords: string[] = []): string[] => {
  const domainName = domain.replace(/https?:\/\//i, '').replace(/www\./i, '').split('.')[0];
  // Extract meaningful words from domain name
  const domainWords = domainName.split(/[^a-zA-Z0-9]/).filter(word => word.length > 3);
  
  // Extract common themes from keywords
  const allWords = keywords.flatMap(keyword => 
    keyword.toLowerCase().split(/\s+/)
  );
  
  // Count word frequencies to identify niche-related terms
  const wordFrequency: Record<string, number> = {};
  allWords.forEach(word => {
    if (word.length > 3) { // Only consider meaningful words
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    }
  });
  
  // Sort words by frequency to find common niche terms
  const nicheTerms = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([term]) => term);
  
  // Combine domain words with niche terms
  const relevantTerms = [...new Set([...domainWords, ...nicheTerms])];
  
  console.log("Domain niche analysis:", {
    domain,
    domainWords,
    topNicheTerms: nicheTerms,
    combinedRelevantTerms: relevantTerms
  });
  
  return relevantTerms;
};
