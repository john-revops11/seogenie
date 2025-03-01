
import { KeywordData } from './types';

// Function to generate domain-relevant keywords for different business niches
export const generateDomainKeywords = (domainUrl: string): KeywordData[] => {
  const domainName = new URL(domainUrl).hostname.replace(/^www\./, '');
  const baseTerms = domainName.split(/[^a-zA-Z0-9]/).filter(term => term.length > 3);
  
  // Determine domain category from domain name
  let industry = "general";
  
  // Check domain for common industry indicators
  const domainLower = domainName.toLowerCase();
  if (domainLower.includes("analytics") || domainLower.includes("insight") || domainLower.includes("data")) {
    industry = "analytics";
  } else if (domainLower.includes("marketing") || domainLower.includes("advert") || domainLower.includes("brand")) {
    industry = "marketing";
  } else if (domainLower.includes("revenue") || domainLower.includes("pricing") || domainLower.includes("finance")) {
    industry = "revenue";
  } else if (domainLower.includes("software") || domainLower.includes("tech") || domainLower.includes("app")) {
    industry = "tech";
  } else if (domainLower.includes("retail") || domainLower.includes("shop") || domainLower.includes("store")) {
    industry = "retail";
  }
  
  console.log(`Generating synthetic keywords for ${domainName} (detected industry: ${industry})`);
  
  // Industry-specific keywords libraries with realistic patterns
  const keywordLibraries: Record<string, string[]> = {
    analytics: [
      "data analytics strategy", "business intelligence solutions", "analytics dashboard", 
      "predictive analytics tools", "data visualization software", "customer data insights",
      "analytics implementation", "reporting automation", "data-driven decision making",
      "analytics ROI", "KPI tracking", "analytics consulting services",
      "marketing analytics", "performance metrics", "data analysis methods"
    ],
    marketing: [
      "marketing strategy development", "campaign optimization", "brand positioning",
      "marketing ROI measurement", "customer acquisition strategy", "conversion rate optimization",
      "digital marketing analytics", "content strategy", "customer journey mapping",
      "market segmentation", "marketing attribution modeling", "multichannel marketing"
    ],
    revenue: [
      "revenue growth management", "pricing strategy", "profit optimization",
      "revenue forecasting models", "pricing analytics", "monetization strategy",
      "dynamic pricing implementation", "revenue leakage analysis", "price elasticity testing",
      "discount strategy optimization", "customer lifetime value", "subscription pricing models"
    ],
    tech: [
      "software implementation", "technology ROI", "tech stack optimization",
      "digital transformation strategy", "SaaS platform selection", "IT cost optimization",
      "enterprise software integration", "technical performance metrics", "cloud migration strategy",
      "software vendor evaluation", "technology roadmap", "API integration"
    ],
    retail: [
      "retail analytics", "inventory optimization", "retail pricing strategy",
      "omnichannel retail", "customer segmentation", "category management",
      "merchandising effectiveness", "retail performance metrics", "shelf space optimization",
      "retail growth strategy", "assortment planning", "product mix optimization"
    ],
    general: [
      "business strategy", "performance improvement", "operational efficiency",
      "cost reduction strategy", "growth strategy", "business transformation",
      "process optimization", "competitive analysis", "market research",
      "benchmarking metrics", "business intelligence", "strategic planning"
    ]
  };
  
  // Generic high-volume business terms that apply to most businesses
  const commonBusinessTerms = [
    "ROI analytics", "business growth strategy", "performance metrics", 
    "optimization strategy", "strategic planning", "implementation framework",
    "competitive advantage", "business transformation", "operational excellence",
    "data-driven strategy", "market analysis", "best practices",
    "consulting services", "value proposition", "business case development"
  ];
  
  // Select keyword library based on industry
  const industryKeywords = keywordLibraries[industry] || keywordLibraries.general;
  
  // Generate domain-specific variations by combining domain terms with industry keywords
  const domainSpecificKeywords: KeywordData[] = [];
  
  // Add some base terms first
  baseTerms.forEach(term => {
    if (term.length > 3) {
      domainSpecificKeywords.push({
        keyword: term,
        monthly_search: Math.floor(Math.random() * 3000) + 1000,
        competition: Math.random() > 0.5 ? "high" : "medium",
        competition_index: Math.floor(Math.random() * 70) + 30,
        cpc: parseFloat((Math.random() * 5 + 1).toFixed(2))
      });
    }
  });
  
  // Use industry-specific keywords
  industryKeywords.forEach(keyword => {
    // Create a base keyword entry
    domainSpecificKeywords.push({
      keyword: keyword,
      monthly_search: Math.floor(Math.random() * 5000) + 500,
      competition: Math.random() > 0.6 ? "high" : Math.random() > 0.3 ? "medium" : "low",
      competition_index: Math.floor(Math.random() * 100) + 1,
      cpc: parseFloat((Math.random() * 10 + 0.5).toFixed(2))
    });
    
    // Create a domain-specific version for some keywords
    if (Math.random() > 0.5 && baseTerms.length > 0) {
      const baseTerm = baseTerms[Math.floor(Math.random() * baseTerms.length)];
      if (baseTerm && baseTerm.length > 3) {
        domainSpecificKeywords.push({
          keyword: `${baseTerm} ${keyword}`,
          monthly_search: Math.floor(Math.random() * 2000) + 100,
          competition: Math.random() > 0.5 ? "medium" : "low",
          competition_index: Math.floor(Math.random() * 50) + 20,
          cpc: parseFloat((Math.random() * 8 + 0.5).toFixed(2))
        });
      }
    }
  });
  
  // Add common business terms
  commonBusinessTerms.forEach(term => {
    // Create a domain-specific version for business terms
    if (baseTerms.length > 0) {
      const baseTerm = baseTerms[Math.floor(Math.random() * baseTerms.length)];
      if (baseTerm && baseTerm.length > 3) {
        domainSpecificKeywords.push({
          keyword: `${baseTerm} ${term}`,
          monthly_search: Math.floor(Math.random() * 3000) + 200,
          competition: Math.random() > 0.6 ? "high" : "medium",
          competition_index: Math.floor(Math.random() * 60) + 40,
          cpc: parseFloat((Math.random() * 15 + 1).toFixed(2))
        });
      }
    }
    
    // Also add the generic term
    domainSpecificKeywords.push({
      keyword: term,
      monthly_search: Math.floor(Math.random() * 5000) + 1000,
      competition: Math.random() > 0.7 ? "high" : "medium",
      competition_index: Math.floor(Math.random() * 80) + 20,
      cpc: parseFloat((Math.random() * 12 + 2).toFixed(2))
    });
  });
  
  // Add industry-specific combinations
  if (industry === "revenue" || industry === "analytics") {
    const revenueTerms = [
      "pricing strategy", "revenue optimization", "profit analysis",
      "pricing analytics", "revenue growth management", "monetization strategy",
      "pricing models", "revenue forecasting", "customer lifetime value"
    ];
    
    revenueTerms.forEach(term => {
      domainSpecificKeywords.push({
        keyword: term,
        monthly_search: Math.floor(Math.random() * 2000) + 500,
        competition: "high",
        competition_index: Math.floor(Math.random() * 30) + 70, // Higher competition
        cpc: parseFloat((Math.random() * 20 + 5).toFixed(2)) // Higher CPC
      });
      
      // Create domain-specific versions
      if (baseTerms.length > 0) {
        const baseTerm = baseTerms[Math.floor(Math.random() * baseTerms.length)];
        if (baseTerm && baseTerm.length > 3) {
          domainSpecificKeywords.push({
            keyword: `${baseTerm} ${term}`,
            monthly_search: Math.floor(Math.random() * 1000) + 200,
            competition: Math.random() > 0.5 ? "high" : "medium",
            competition_index: Math.floor(Math.random() * 40) + 50,
            cpc: parseFloat((Math.random() * 15 + 3).toFixed(2))
          });
        }
      }
    });
  }
  
  // Create a set to remove duplicates
  const keywordSet = new Map<string, KeywordData>();
  domainSpecificKeywords.forEach(item => {
    keywordSet.set(item.keyword, item);
  });
  
  // Convert back to array and return
  return Array.from(keywordSet.values());
};

// In a real implementation, we would need to extend the API call to get actual ranking URLs
// Here we'll simulate it with some common page types
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
