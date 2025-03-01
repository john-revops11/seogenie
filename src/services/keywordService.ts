import { toast } from "sonner";

// API configuration
const API_HOST = "keyword-tool.p.rapidapi.com";
const API_KEY = "b84198e677msh416f3b6bc96f2b3p1a60f3jsnaadb78e898c9"; // This is already public in the screenshots
const API_URL = "https://keyword-tool.p.rapidapi.com/urlextract/";
const OPENAI_API_KEY = "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";

// NEW Google Keyword Insight API configuration
const GOOGLE_KEYWORD_API_HOST = "google-keyword-insight1.p.rapidapi.com";
const GOOGLE_KEYWORD_API_URL = "https://google-keyword-insight1.p.rapidapi.com/globalurl/";

export interface KeywordData {
  keyword: string;
  monthly_search: number;
  competition: string;
  competition_index: number;
  cpc: number;
  position?: number | null; // For tracking ranking positions
  rankingUrl?: string | null; // Added to store the URL where keyword ranks
  competitorRankings?: Record<string, number | null>; // For competitor rankings
  competitorUrls?: Record<string, string | null>; // Added to store competitor URLs where keywords rank
}

export interface DomainKeywordResponse {
  success: boolean;
  place_id: number;
  lang_id: number;
  currency_code: string;
  period: string;
  url: string;
  reason?: string; // Added the missing reason property
  data: Array<{
    keyword: string;
    monthly_search: number;
    monthly_search_count?: number;
    change_three_month?: number;
    yoy_change?: number;
    competition: string;
    competition_index: number;
    low_bid: number;
    high_bid: number;
  }>;
}

// Google Keyword Insight API response interface
export interface GoogleKeywordInsightResponse {
  keywords: Array<{
    keyword: string;
    volume: number;
    difficulty: number;
    cpc: number;
    current_rank: number | null;
  }>;
  status: string;
  url: string;
}

// Function to generate domain-relevant keywords for different business niches
const generateDomainKeywords = (domainUrl: string): KeywordData[] => {
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

// New function to fetch keywords using Google Keyword Insight API
export const fetchGoogleKeywordInsights = async (domainUrl: string): Promise<KeywordData[]> => {
  try {
    const queryParams = new URLSearchParams({
      url: domainUrl,
      lang: 'en'
    });

    console.log(`Fetching keywords from Google Keyword Insight API for domain: ${domainUrl}`);
    
    const response = await fetch(`${GOOGLE_KEYWORD_API_URL}?${queryParams}`, {
      method: "GET",
      headers: {
        "x-rapidapi-host": GOOGLE_KEYWORD_API_HOST,
        "x-rapidapi-key": API_KEY
      }
    });

    // Check for API quota exceeded or other errors
    if (!response.ok) {
      console.warn(`Google Keyword API error ${response.status} for ${domainUrl}. Falling back to synthetic data.`);
      toast.info("Using synthetic keyword data (API limit reached)");
      return generateDomainKeywords(domainUrl);
    }

    const data: GoogleKeywordInsightResponse = await response.json();
    
    if (data.status !== "success" || !data.keywords || data.keywords.length === 0) {
      console.warn(`Google Keyword API unsuccessful for ${domainUrl}. Falling back to synthetic data.`);
      toast.info("Using synthetic keyword data (API request unsuccessful)");
      return generateDomainKeywords(domainUrl);
    }

    // Transform the API response to our KeywordData format
    return data.keywords.map(item => ({
      keyword: item.keyword,
      monthly_search: item.volume,
      competition: getCompetitionLabel(item.difficulty),
      competition_index: item.difficulty,
      cpc: item.cpc,
      position: item.current_rank,
      rankingUrl: null, // We'll simulate this for now
    }));
  } catch (error) {
    console.error(`Error fetching Google keywords for ${domainUrl}:`, error);
    toast.info("Using synthetic keyword data (API connection error)");
    return generateDomainKeywords(domainUrl);
  }
};

// Helper function to convert difficulty number to competition label
function getCompetitionLabel(difficulty: number): string {
  if (difficulty < 30) return "low";
  if (difficulty < 60) return "medium";
  return "high";
}

export const fetchDomainKeywords = async (domainUrl: string): Promise<KeywordData[]> => {
  // Try the Google Keyword Insight API first
  try {
    const googleKeywords = await fetchGoogleKeywordInsights(domainUrl);
    if (googleKeywords.length > 0) {
      console.log(`Successfully fetched ${googleKeywords.length} keywords from Google Keyword Insight API`);
      return googleKeywords;
    }
  } catch (error) {
    console.error("Error with Google Keyword Insight API, falling back to alternative:", error);
  }
  
  // Fall back to the original API if Google API fails
  try {
    const queryParams = new URLSearchParams({
      url: domainUrl,
      place_id: "2360", // US
      lang_id: "1000", // English
      scan_type: "url"
    });

    console.log(`Falling back to original API for domain: ${domainUrl}`);
    
    const response = await fetch(`${API_URL}?${queryParams}`, {
      method: "GET",
      headers: {
        "x-rapidapi-host": API_HOST,
        "x-rapidapi-key": API_KEY
      }
    });

    // Check for API quota exceeded or other errors
    if (!response.ok) {
      console.warn(`API error ${response.status} for ${domainUrl}. Falling back to synthetic data.`);
      toast.info("Using synthetic keyword data (API limit reached)");
      return generateDomainKeywords(domainUrl);
    }

    const data: DomainKeywordResponse = await response.json();
    
    if (!data.success) {
      console.warn(`API unsuccessful for ${domainUrl}: ${data.reason || 'Unknown reason'}. Falling back to synthetic data.`);
      toast.info("Using synthetic keyword data (API request unsuccessful)");
      return generateDomainKeywords(domainUrl);
    }

    // If API returns no keywords, fall back to synthetic data
    if (!data.data || data.data.length === 0) {
      console.warn(`API returned no keywords for ${domainUrl}. Falling back to synthetic data.`);
      toast.info("Using synthetic keyword data (no keywords found)");
      return generateDomainKeywords(domainUrl);
    }

    // Transform the API response to our KeywordData format
    return data.data.map(item => ({
      keyword: item.keyword,
      monthly_search: item.monthly_search,
      competition: item.competition,
      competition_index: item.competition_index,
      cpc: ((item.low_bid + item.high_bid) / 2) || 0, // Average of low and high bid
      position: null, // We'll populate this separately
      rankingUrl: null, // We'll simulate this for now
    }));
  } catch (error) {
    console.error(`Error fetching domain keywords for ${domainUrl}:`, error);
    toast.info("Using synthetic keyword data (API connection error)");
    return generateDomainKeywords(domainUrl);
  }
};

// In a real implementation, we would need to extend the API call to get actual ranking URLs
// Here we'll simulate it with some common page types
const generateSampleUrl = (domain: string, keyword: string): string => {
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

export const analyzeDomains = async (
  mainDomain: string, 
  competitorDomains: string[]
): Promise<{
  keywords: KeywordData[],
  success: boolean
}> => {
  try {
    // Make sure domains have proper URL format
    const formattedMainDomain = ensureValidUrl(mainDomain);
    const formattedCompetitorDomains = competitorDomains
      .filter(domain => domain.trim() !== "")
      .map(domain => ensureValidUrl(domain));
    
    console.log("Analyzing domains using Google Keyword Insight API:", formattedMainDomain, formattedCompetitorDomains);
    
    // Start with loading the main domain keywords
    const mainKeywords = await fetchDomainKeywords(formattedMainDomain);
    
    if (!mainKeywords.length) {
      throw new Error(`No keywords found for ${formattedMainDomain}`);
    }
    
    // Process competitor domains one by one with better error handling
    const competitorResults = [];
    
    for (const domain of formattedCompetitorDomains) {
      try {
        toast.info(`Analyzing competitor: ${domain}`);
        const keywords = await fetchDomainKeywords(domain);
        
        if (keywords.length > 0) {
          competitorResults.push({ domain, keywords });
          toast.success(`Found ${keywords.length} keywords for ${domain}`);
        } else {
          console.warn(`No keywords found for ${domain}`);
          toast.warning(`No keywords found for ${domain}`);
        }
      } catch (error) {
        console.error(`Error analyzing competitor ${domain}:`, error);
        toast.error(`Failed to analyze ${domain}: ${(error as Error).message}`);
        // Continue with other competitors even if one fails
      }
    }
    
    // Process and merge data
    const keywordMap = new Map<string, KeywordData>();
    
    // Add main domain keywords first
    mainKeywords.forEach(kw => {
      // Simulate a ranking position and URL for the main domain
      const position = Math.floor(Math.random() * 100) + 1;
      const rankingUrl = generateSampleUrl(formattedMainDomain, kw.keyword);
      
      keywordMap.set(kw.keyword, {
        keyword: kw.keyword,
        monthly_search: kw.monthly_search,
        competition: kw.competition,
        competition_index: kw.competition_index,
        cpc: kw.cpc,
        position: position, // Simulate ranking position
        rankingUrl: rankingUrl, // Add ranking URL
        competitorRankings: {},
        competitorUrls: {}
      });
    });
    
    // Add competitor keywords and rankings
    competitorResults.forEach(({ domain, keywords }) => {
      const domainName = new URL(domain).hostname.replace(/^www\./, '');
      
      keywords.forEach(kw => {
        if (keywordMap.has(kw.keyword)) {
          // Update existing keyword with competitor ranking
          const existing = keywordMap.get(kw.keyword)!;
          if (!existing.competitorRankings) {
            existing.competitorRankings = {};
          }
          if (!existing.competitorUrls) {
            existing.competitorUrls = {};
          }
          
          // Simulate a ranking position and URL for this competitor
          const position = Math.floor(Math.random() * 100) + 1;
          const rankingUrl = generateSampleUrl(domain, kw.keyword);
          
          existing.competitorRankings[domainName] = position;
          existing.competitorUrls[domainName] = rankingUrl;
        } else {
          // Add new keyword that main domain doesn't have
          const position = Math.floor(Math.random() * 100) + 1;
          const rankingUrl = generateSampleUrl(domain, kw.keyword);
          
          keywordMap.set(kw.keyword, {
            keyword: kw.keyword,
            monthly_search: kw.monthly_search,
            competition: kw.competition,
            competition_index: kw.competition_index,
            cpc: kw.cpc,
            position: null, // Main domain doesn't rank for this
            rankingUrl: null,
            competitorRankings: {
              [domainName]: position
            },
            competitorUrls: {
              [domainName]: rankingUrl
            }
          });
        }
      });
    });
    
    return {
      keywords: Array.from(keywordMap.values()),
      success: true
    };
  } catch (error) {
    console.error("Error analyzing domains:", error);
    toast.error(`Domain analysis failed: ${(error as Error).message}`);
    return {
      keywords: [],
      success: false
    };
  }
};

// Ensure a string is a valid URL with protocol
function ensureValidUrl(urlString: string): string {
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

export interface KeywordGap {
  keyword: string;
  volume: number;
  difficulty: number;
  opportunity: 'high' | 'medium' | 'low';
  competitor?: string; // Competitor domain that ranks for this keyword
  rank?: number; // The competitor's ranking position for this keyword
}

export interface SeoRecommendation {
  type: 'onPage' | 'technical' | 'content';
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
  details?: string; // Optional details about the recommendation
  implementationDifficulty?: 'easy' | 'medium' | 'hard'; // Optional difficulty assessment
}

export const findKeywordGaps = async (
  mainDomain: string,
  competitorDomains: string[],
  keywords: KeywordData[],
  targetGapCount: number = 30 // Default to 30 gaps (aiming for at least 10 per competitor)
): Promise<KeywordGap[]> => {
  try {
    if (!keywords.length) {
      console.error("No keywords provided to findKeywordGaps");
      return [];
    }
    
    // Extract domain names for better readability in the results
    const extractDomain = (url: string) => {
      try {
        return new URL(url).hostname.replace(/^www\./, '');
      } catch (e) {
        return url;
      }
    };
    
    const mainDomainName = extractDomain(mainDomain);
    const competitorDomainNames = competitorDomains.map(extractDomain);
    
    console.log(`Finding keyword gaps for ${mainDomainName} vs ${competitorDomainNames.join(', ')}`);
    
    // Filter keywords to find ones where competitors rank but the main domain doesn't or ranks poorly
    const potentialGaps = keywords.filter(kw => {
      // Check if the main domain doesn't rank for this keyword or ranks poorly (position > 30)
      const mainDoesntRank = kw.position === null || kw.position > 30;
      
      // Check if at least one competitor ranks for this keyword
      const anyCompetitorRanks = kw.competitorRankings && 
        Object.keys(kw.competitorRankings).some(comp => 
          competitorDomainNames.includes(comp) && 
          kw.competitorRankings[comp] !== null && 
          kw.competitorRankings[comp]! <= 30
        );
      
      return mainDoesntRank && anyCompetitorRanks;
    });
    
    console.log(`Found ${potentialGaps.length} potential keyword gaps before AI analysis`);
    
    // If we have enough gaps from the data, use them directly without AI
    if (potentialGaps.length >= targetGapCount) {
      console.log("Using directly identified gaps without AI processing");
      
      // Convert to KeywordGap format
      const directGaps: KeywordGap[] = [];
      
      for (const kw of potentialGaps) {
        // Find the best-ranking competitor for this keyword
        let bestCompetitor = '';
        let bestPosition = 100;
        
        if (kw.competitorRankings) {
          for (const [competitor, position] of Object.entries(kw.competitorRankings)) {
            if (position !== null && position < bestPosition && competitorDomainNames.includes(competitor)) {
              bestPosition = position;
              bestCompetitor = competitor;
            }
          }
        }
        
        // Skip if we couldn't find a relevant competitor
        if (!bestCompetitor) continue;
        
        // Calculate opportunity based on search volume and competition
        let opportunity: 'high' | 'medium' | 'low' = 'medium';
        
        // High opportunity: High volume, low competition
        if (kw.monthly_search > 500 && kw.competition_index < 30) {
          opportunity = 'high';
        } 
        // Low opportunity: Low volume, high competition
        else if (kw.monthly_search < 100 && kw.competition_index > 60) {
          opportunity = 'low';
        }
        
        directGaps.push({
          keyword: kw.keyword,
          volume: kw.monthly_search,
          difficulty: kw.competition_index,
          opportunity: opportunity,
          competitor: bestCompetitor
        });
        
        // Stop once we have enough gaps
        if (directGaps.length >= targetGapCount) break;
      }
      
      // Check if we have enough gaps for each competitor
      const gapsByCompetitor = new Map<string, number>();
      directGaps.forEach(gap => {
        const competitor = gap.competitor || "unknown";
        gapsByCompetitor.set(competitor, (gapsByCompetitor.get(competitor) || 0) + 1);
      });
      
      // If we have enough, return them
      const hasEnoughPerCompetitor = competitorDomainNames.every(comp => 
        (gapsByCompetitor.get(comp) || 0) >= 10
      );
      
      if (hasEnoughPerCompetitor || directGaps.length >= targetGapCount) {
        console.log("Returning directly identified gaps:", directGaps.length);
        return directGaps;
      }
    }
    
    // Fall back to OpenAI for analysis if we don't have enough direct gaps
    console.log("Using OpenAI to analyze keyword gaps");
    
    // Ensure we're requesting at least 10 gaps per competitor
    const minGapsPerCompetitor = Math.ceil(targetGapCount / competitorDomains.length);
    const adjustedGapCount = Math.max(targetGapCount, minGapsPerCompetitor * competitorDomains.length);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert SEO keyword analyst who identifies valuable keyword opportunities.'
          },
          {
            role: 'user',
            content: `Analyze the keyword data for main domain "${mainDomainName}" and competitors ${competitorDomainNames.join(', ')}. 
            Identify the top keyword gaps (keywords competitors rank for that the main domain does not, or ranks poorly for).
            
            I need at least ${minGapsPerCompetitor} keyword gaps for EACH competitor domain (${adjustedGapCount} total gaps).
            
            Keyword data: ${JSON.stringify(keywords.slice(0, Math.min(keywords.length, 50)))}
            
            For each keyword gap, include these properties:
            - keyword: string (the keyword)
            - volume: number (estimated monthly search volume, 100-10000)
            - difficulty: number (1-100 scale where higher is more difficult)
            - opportunity: string (high, medium, or low based on potential value)
            - competitor: string (the competitor domain that ranks for this keyword)
            
            Format your response EXACTLY like this JSON example:
            {
              "keywordGaps": [
                {
                  "keyword": "example keyword 1",
                  "volume": 1200,
                  "difficulty": 45,
                  "opportunity": "high",
                  "competitor": "competitor1.com"
                },
                {
                  "keyword": "example keyword 2",
                  "volume": 800,
                  "difficulty": 30,
                  "opportunity": "medium",
                  "competitor": "competitor2.com"
                }
              ]
            }
            
            IMPORTANT: You must include the competitor property for each gap to identify which competitor ranks for each keyword.
            You must return at least ${minGapsPerCompetitor} keywords for each competitor.`
          }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error (${response.status}):`, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Received OpenAI response for keyword gaps");
    
    try {
      const parsedContent = JSON.parse(data.choices[0].message.content);
      const gaps = parsedContent.keywordGaps;
      
      if (!Array.isArray(gaps) || gaps.length === 0) {
        console.error("OpenAI returned invalid or empty gaps array:", data.choices[0].message.content);
        throw new Error("Invalid response format from OpenAI");
      }
      
      // Verify we have at least some gaps for each competitor
      const gapsByCompetitor = new Map<string, number>();
      gaps.forEach(gap => {
        const competitor = gap.competitor || "unknown";
        gapsByCompetitor.set(competitor, (gapsByCompetitor.get(competitor) || 0) + 1);
      });
      
      console.log("Gaps distribution by competitor:", Object.fromEntries(gapsByCompetitor));
      
      return gaps;
    } catch (error) {
      console.error("Error parsing OpenAI response:", error, data.choices[0].message.content);
      throw new Error("Failed to parse OpenAI response");
    }
  } catch (error) {
    console.error("Error finding keyword gaps:", error);
    toast.error(`Failed to find keyword gaps: ${(error as Error).message}`);
    
    // Return mock keyword gaps if the API fails, ensuring at least 10 per competitor
    const mockGaps: KeywordGap[] = [];
    
    // Extract domain names for the mock data
    const extractDomain = (url: string) => {
      try {
        return new URL(url).hostname.replace(/^www\./, '');
      } catch (e) {
        return url;
      }
    };
    
    const competitorDomainNames = competitorDomains.map(extractDomain);
    
    // Base template gaps that we'll customize for each competitor
    const baseGapTemplates = [
      { keyword: 'seo competitor analysis', volume: 1200, difficulty: 45, opportunity: 'high' as const },
      { keyword: 'keyword gap tool', volume: 880, difficulty: 38, opportunity: 'high' as const },
      { keyword: 'best keyword research method', volume: 720, difficulty: 52, opportunity: 'medium' as const },
      { keyword: 'seo tools comparison', volume:
