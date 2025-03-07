
// Domain analysis utility functions for content generation

/**
 * Analyzes a domain and relevant keywords to extract niche-related terms
 * and determine the business category
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
  
  // Determine primary business category from domain and keywords
  const businessCategories = determineBusinessCategory(domainName, keywords);
  
  // Add business category terms to the relevant terms
  const industryCategoryTerms = generateIndustryTerms(businessCategories);
  
  // Combine domain words with niche terms and industry terms
  const relevantTerms = [...new Set([...domainWords, ...nicheTerms, ...industryCategoryTerms])];
  
  console.log("Domain niche analysis:", {
    domain,
    domainWords,
    businessCategories,
    topNicheTerms: nicheTerms,
    industryCategoryTerms,
    combinedRelevantTerms: relevantTerms
  });
  
  return relevantTerms;
};

/**
 * Determines the likely business category based on domain name and keywords
 */
function determineBusinessCategory(domainName: string, keywords: string[] = []): string[] {
  const domainLower = domainName.toLowerCase();
  const keywordsText = keywords.join(' ').toLowerCase();
  const categories: string[] = [];
  
  // Check for analytics/data focus
  if (
    domainLower.includes('analytics') || 
    domainLower.includes('insight') || 
    domainLower.includes('data') ||
    keywordsText.includes('analytics') || 
    keywordsText.includes('data') || 
    keywordsText.includes('metrics')
  ) {
    categories.push('analytics');
  }
  
  // Check for revenue/pricing focus
  if (
    domainLower.includes('revenue') || 
    domainLower.includes('pricing') || 
    domainLower.includes('price') ||
    domainLower.includes('profit') ||
    keywordsText.includes('revenue') || 
    keywordsText.includes('pricing') || 
    keywordsText.includes('monetization') ||
    keywordsText.includes('profit')
  ) {
    categories.push('revenue');
  }
  
  // Check for marketing focus
  if (
    domainLower.includes('marketing') || 
    domainLower.includes('market') || 
    domainLower.includes('brand') ||
    keywordsText.includes('marketing') || 
    keywordsText.includes('brand') || 
    keywordsText.includes('campaign')
  ) {
    categories.push('marketing');
  }
  
  // Add general business category if nothing specific was identified
  if (categories.length === 0) {
    categories.push('business');
  }
  
  return categories;
}

/**
 * Generates industry-specific terms based on detected business categories
 */
function generateIndustryTerms(categories: string[]): string[] {
  const industryTerms: string[] = [];
  
  // Add terms based on detected categories
  categories.forEach(category => {
    switch(category) {
      case 'analytics':
        industryTerms.push(
          'data analysis', 
          'business intelligence', 
          'analytics dashboard', 
          'performance metrics',
          'data visualization'
        );
        break;
      case 'revenue':
        industryTerms.push(
          'revenue growth management', 
          'pricing strategy', 
          'profit optimization',
          'monetization',
          'dynamic pricing'
        );
        break;
      case 'marketing':
        industryTerms.push(
          'marketing strategy', 
          'campaign optimization', 
          'customer acquisition',
          'market segmentation',
          'brand positioning'
        );
        break;
      default:
        industryTerms.push(
          'business strategy',
          'operational efficiency',
          'growth management',
          'strategic planning',
          'performance improvement'
        );
    }
  });
  
  return industryTerms;
}
