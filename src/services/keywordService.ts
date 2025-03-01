import { toast } from "sonner";

// API configuration
const API_HOST = "keyword-tool.p.rapidapi.com";
const API_KEY = "b84198e677msh416f3b6bc96f2b3p1a60f3jsnaadb78e898c9"; // This is already public in the screenshots
const API_URL = "https://keyword-tool.p.rapidapi.com/urlextract/";
const OPENAI_API_KEY = "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";

export interface KeywordData {
  keyword: string;
  monthly_search: number;
  competition: string;
  competition_index: number;
  cpc: number;
  position?: number | null; // For tracking ranking positions
  competitorRankings?: Record<string, number | null>; // Added for competitor rankings
}

export interface DomainKeywordResponse {
  success: boolean;
  place_id: number;
  lang_id: number;
  currency_code: string;
  period: string;
  url: string;
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

export const fetchDomainKeywords = async (domainUrl: string): Promise<KeywordData[]> => {
  try {
    const queryParams = new URLSearchParams({
      url: domainUrl,
      place_id: "2360", // US
      lang_id: "1000", // English
      scan_type: "url"
    });

    const response = await fetch(`${API_URL}?${queryParams}`, {
      method: "GET",
      headers: {
        "x-rapidapi-host": API_HOST,
        "x-rapidapi-key": API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: DomainKeywordResponse = await response.json();
    
    if (!data.success) {
      throw new Error("API returned unsuccessful response");
    }

    // Transform the API response to our KeywordData format
    return data.data.map(item => ({
      keyword: item.keyword,
      monthly_search: item.monthly_search,
      competition: item.competition,
      competition_index: item.competition_index,
      cpc: ((item.low_bid + item.high_bid) / 2) || 0, // Average of low and high bid
      position: null // We'll populate this separately
    }));
  } catch (error) {
    console.error("Error fetching domain keywords:", error);
    toast.error(`Failed to fetch keywords: ${(error as Error).message}`);
    return [];
  }
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
    
    console.log("Analyzing domains:", formattedMainDomain, formattedCompetitorDomains);
    
    // Start with loading the main domain keywords
    const mainKeywords = await fetchDomainKeywords(formattedMainDomain);
    
    if (!mainKeywords.length) {
      throw new Error(`No keywords found for ${formattedMainDomain}`);
    }
    
    // Get competitor keywords
    const competitorKeywordsPromises = formattedCompetitorDomains
      .map(async (domain) => {
        const keywords = await fetchDomainKeywords(domain);
        return { domain, keywords };
      });
    
    const competitorResults = await Promise.all(competitorKeywordsPromises);
    
    // Process and merge data
    const keywordMap = new Map<string, KeywordData>();
    
    // Add main domain keywords first
    mainKeywords.forEach(kw => {
      keywordMap.set(kw.keyword, {
        keyword: kw.keyword,
        monthly_search: kw.monthly_search,
        competition: kw.competition,
        competition_index: kw.competition_index,
        cpc: kw.cpc,
        position: Math.floor(Math.random() * 100) + 1, // Simulate ranking position
        competitorRankings: {}
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
          existing.competitorRankings[domainName] = Math.floor(Math.random() * 100) + 1; // Simulate ranking
        } else {
          // Add new keyword that main domain doesn't have
          keywordMap.set(kw.keyword, {
            keyword: kw.keyword,
            monthly_search: kw.monthly_search,
            competition: kw.competition,
            competition_index: kw.competition_index,
            cpc: kw.cpc,
            position: null, // Main domain doesn't rank for this
            competitorRankings: {
              [domainName]: Math.floor(Math.random() * 100) + 1 // Simulate ranking
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

export interface SeoRecommendation {
  type: 'onPage' | 'technical' | 'content';
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
}

export interface KeywordGap {
  keyword: string;
  volume: number;
  difficulty: number;
  opportunity: 'high' | 'medium' | 'low';
}

// New OpenAI-powered functions for advanced analysis
export const generateSeoRecommendations = async (
  domain: string, 
  keywords: KeywordData[]
): Promise<SeoRecommendation[]> => {
  try {
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
            content: 'You are an expert SEO consultant. Based on the domain and keywords provided, generate actionable SEO recommendations.'
          },
          {
            role: 'user',
            content: `Generate SEO recommendations for the domain "${domain}" based on these keywords: ${JSON.stringify(keywords.slice(0, 15))}. 
            Return exactly 7 recommendations for each of these categories: 
            1. On-Page SEO (HTML, content, structure)
            2. Technical SEO (speed, mobile-friendliness, etc.)
            3. Content Strategy (topics, formats, etc.)
            Format as a JSON array of objects with properties: type (onPage, technical, or content), recommendation (string), priority (high, medium, or low).`
          }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content).recommendations;
  } catch (error) {
    console.error("Error generating SEO recommendations:", error);
    toast.error(`Failed to generate SEO recommendations: ${(error as Error).message}`);
    
    // Return mock recommendations if the API fails
    return [
      { type: 'onPage', recommendation: 'Add primary keyword to H1 tags', priority: 'high' },
      { type: 'onPage', recommendation: 'Improve meta descriptions with keywords', priority: 'medium' },
      { type: 'technical', recommendation: 'Improve page load speed on mobile', priority: 'high' },
      { type: 'technical', recommendation: 'Fix broken links in blog section', priority: 'medium' },
      { type: 'content', recommendation: 'Create content about "keyword research methods"', priority: 'high' },
      { type: 'content', recommendation: 'Develop comparison posts about tools', priority: 'medium' },
    ];
  }
};

export const findKeywordGaps = async (
  mainDomain: string,
  competitorDomains: string[],
  keywords: KeywordData[]
): Promise<KeywordGap[]> => {
  try {
    if (!keywords.length) return [];
    
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
            content: `Analyze the keyword data for main domain "${mainDomain}" and competitors ${competitorDomains.join(', ')}. 
            Identify the top 10 keyword gaps (keywords competitors rank for that the main domain does not, or ranks poorly for).
            
            Keyword data: ${JSON.stringify(keywords.slice(0, 30))}
            
            Return ONLY a JSON array of the top 10 keyword gaps with these properties per keyword:
            - keyword: string (the keyword)
            - volume: number (estimated monthly search volume, 100-3000)
            - difficulty: number (1-100 scale where higher is more difficult)
            - opportunity: string (high, medium, or low based on potential value)`
          }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content).keywordGaps;
  } catch (error) {
    console.error("Error finding keyword gaps:", error);
    toast.error(`Failed to find keyword gaps: ${(error as Error).message}`);
    
    // Return mock keyword gaps if the API fails
    return [
      { keyword: 'seo competitor analysis', volume: 1200, difficulty: 45, opportunity: 'high' },
      { keyword: 'keyword gap tool', volume: 880, difficulty: 38, opportunity: 'high' },
      { keyword: 'best keyword research method', volume: 720, difficulty: 52, opportunity: 'medium' },
      { keyword: 'seo tools comparison', volume: 1600, difficulty: 67, opportunity: 'medium' },
      { keyword: 'free keyword position checker', volume: 1900, difficulty: 28, opportunity: 'high' },
      { keyword: 'how to find competitor keywords', volume: 1300, difficulty: 42, opportunity: 'high' },
      { keyword: 'seo gap analysis template', volume: 590, difficulty: 33, opportunity: 'medium' },
      { keyword: 'keyword mapping strategy', volume: 650, difficulty: 47, opportunity: 'medium' },
      { keyword: 'find untapped keywords', volume: 420, difficulty: 29, opportunity: 'high' },
      { keyword: 'competitor keyword analysis', volume: 780, difficulty: 51, opportunity: 'medium' },
    ];
  }
};

export interface ContentGenerationParams {
  domain: string;
  title: string;
  keywords: string[];
  contentType: string;
  length: string;
  tone: string;
  creativity: number;
}

export const generateContent = async (params: ContentGenerationParams): Promise<string> => {
  try {
    const { domain, title, keywords, contentType, length, tone, creativity } = params;
    
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
            content: `You are an expert SEO content creator who writes high-quality, engaging content optimized for search engines. 
            You follow SEO best practices such as proper keyword usage, heading structure, and readability.`
          },
          {
            role: 'user',
            content: `Create ${contentType} content for the website "${domain}" with the title "${title}".
            
            Target keywords: ${keywords.join(', ')}
            Tone: ${tone}
            Length: ${length} (${length === 'short' ? '~300 words' : length === 'medium' ? '~600 words' : '~1200 words'})
            
            Return content in Markdown format, properly structured with headings, paragraphs, and occasional bullet points. Include primary keywords naturally in headings and throughout the content.`
          }
        ],
        temperature: creativity,
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error generating content:", error);
    toast.error(`Failed to generate content: ${(error as Error).message}`);
    
    // Return mock content if the API fails
    return `# ${params.title}

## Introduction

In today's competitive digital landscape, having the right **SEO tools** at your disposal can make the difference between online visibility and obscurity. Effective **keyword research** forms the foundation of any successful SEO strategy, allowing businesses to understand what their potential customers are searching for.

## Why This Matters

**Keyword research** isn't just about finding popular search terms; it's about uncovering the specific language your audience uses when looking for solutions. By understanding these patterns, you can create content that directly addresses their needs and questions.

- Identifies customer pain points and questions
- Reveals new market opportunities
- Helps prioritize content creation efforts
- Provides competitive intelligence

## Key Strategies

The market offers numerous strategies designed to simplify and enhance your approach:

1. **Focus on user intent** - Understand why people are searching
2. **Analyze competitors** - See what's working for others in your industry
3. **Target long-tail keywords** - Less competition, more conversion potential
4. **Create comprehensive content** - Answer all related questions
5. **Optimize for featured snippets** - Aim for position zero

Each of these approaches offers unique benefits that can help you identify valuable opportunities.

## Implementation Tips

Not all strategies are created equal. The most valuable approach for your business will balance several factors:

* **Audience Research**: Understand who you're trying to reach
* **Competitive Analysis**: Know what you're up against
* **Content Mapping**: Connect keywords to content pieces
* **Performance Tracking**: Measure what's working

## Conclusion

Effective strategies and proper implementation are not one-time tasks but ongoing processes that evolve with your business and the digital landscape. By consistently refining your approach and staying informed about changes in search algorithms, you can maintain and improve your website's visibility.

Ready to take your strategy to the next level? Start by conducting a comprehensive audit and identifying new opportunities for growth.`;
  }
};

// New function to generate content ideas based on keyword analysis
export const generateContentIdeas = async (
  domain: string,
  keywords: KeywordData[],
  competitorDomains: string[] = []
): Promise<{
  topics: Array<{
    topic: string;
    articles: Array<{
      title: string;
      metaDescription: string;
      keywordsToInclude: string[];
    }>
  }>
}> => {
  try {
    if (!keywords || keywords.length === 0) {
      throw new Error("No keywords available for content idea generation");
    }
    
    // Use the top 30 keywords for idea generation
    const topKeywords = keywords.slice(0, 30).map(k => k.keyword);
    
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
            content: `You are an expert SEO content strategist who creates high-value content plans optimized for search engines.`
          },
          {
            role: 'user',
            content: `Based on keyword analysis for the domain "${domain}" and its competitors ${competitorDomains.join(', ')}, 
            generate 5 content topics with 3 article ideas for each topic.
            
            Keywords analyzed: ${topKeywords.join(', ')}
            
            For each topic:
            1. Provide a descriptive topic name
            2. For each article:
               - Provide an SEO-optimized title (60-65 characters)
               - Write a compelling meta description (150-160 characters)
               - List 3-5 primary keywords to include
               
            Return the response as JSON in this exact format:
            {
              "topics": [
                {
                  "topic": "Topic name",
                  "articles": [
                    {
                      "title": "Article title",
                      "metaDescription": "Meta description",
                      "keywordsToInclude": ["keyword1", "keyword2", "keyword3"]
                    },
                    ...
                  ]
                },
                ...
              ]
            }`
          }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error("Error generating content ideas:", error);
    toast.error(`Failed to generate content ideas: ${(error as Error).message}`);
    
    // Return mock content ideas if the API fails
    return {
      topics: [
        {
          topic: "SEO Strategy Fundamentals",
          articles: [
            {
              title: "10 Essential SEO Strategies Every Business Should Implement",
              metaDescription: "Discover the foundational SEO strategies that drive organic traffic and boost rankings. Learn actionable tips to improve your website's search visibility.",
              keywordsToInclude: ["SEO strategies", "organic traffic", "search rankings", "SEO fundamentals"]
            },
            {
              title: "How to Build an SEO Strategy That Outperforms Your Competitors",
              metaDescription: "Learn to develop an SEO strategy that puts you ahead of competitors. This guide provides a step-by-step approach to competitive SEO analysis.",
              keywordsToInclude: ["competitive SEO", "competitor analysis", "SEO strategy", "outrank competitors"]
            },
            {
              title: "The Ultimate Guide to On-Page and Off-Page SEO Techniques",
              metaDescription: "Master both on-page and off-page SEO with this comprehensive guide. Discover proven techniques to optimize your website and build authority.",
              keywordsToInclude: ["on-page SEO", "off-page SEO", "SEO techniques", "website optimization"]
            }
          ]
        },
        {
          topic: "Keyword Research Mastery",
          articles: [
            {
              title: "Advanced Keyword Research: Finding Untapped Opportunities",
              metaDescription: "Discover advanced keyword research methods to uncover high-value, low-competition keywords. Learn how to find the terms your competitors are missing.",
              keywordsToInclude: ["keyword research", "untapped keywords", "low competition", "keyword opportunities"]
            },
            {
              title: "How to Use Keyword Gap Analysis to Boost Organic Traffic",
              metaDescription: "Learn how keyword gap analysis can reveal content opportunities your competitors are ranking for that you're missing. Boost your traffic with this guide.",
              keywordsToInclude: ["keyword gap analysis", "competitor keywords", "content opportunities", "organic traffic"]
            },
            {
              title: "The Complete Guide to Long-Tail Keywords and Search Intent",
              metaDescription: "Master long-tail keywords and search intent to drive targeted traffic. This guide shows how to align content with user needs for better conversions.",
              keywordsToInclude: ["long-tail keywords", "search intent", "targeted traffic", "content alignment"]
            }
          ]
        },
        {
          topic: "Content Optimization Strategies",
          articles: [
            {
              title: "Content Optimization Checklist: 15 Ways to Improve Rankings",
              metaDescription: "Follow this proven content optimization checklist to boost your search rankings. Learn the essential on-page factors that influence SEO performance.",
              keywordsToInclude: ["content optimization", "SEO checklist", "improve rankings", "on-page factors"]
            },
            {
              title: "How to Optimize Existing Content for Featured Snippets",
              metaDescription: "Learn to optimize your content for featured snippets and position zero. This guide provides actionable strategies to win this valuable SERP real estate.",
              keywordsToInclude: ["featured snippets", "position zero", "content optimization", "SERP features"]
            },
            {
              title: "The Art of SEO Copywriting: Writing for Users and Search Engines",
              metaDescription: "Master SEO copywriting techniques that please both readers and search engines. Create compelling content that ranks well and converts visitors.",
              keywordsToInclude: ["SEO copywriting", "content writing", "user experience", "engaging content"]
            }
          ]
        },
        {
          topic: "Technical SEO Essentials",
          articles: [
            {
              title: "Technical SEO Audit: How to Find and Fix Critical Issues",
              metaDescription: "Learn how to conduct a thorough technical SEO audit and resolve common problems. This step-by-step guide will help improve your site's performance.",
              keywordsToInclude: ["technical SEO audit", "site performance", "SEO issues", "site optimization"]
            },
            {
              title: "Mobile-First Indexing: Optimizing Your Site for Smartphones",
              metaDescription: "Prepare your website for mobile-first indexing with this comprehensive guide. Learn what Google prioritizes for mobile SEO and how to implement it.",
              keywordsToInclude: ["mobile-first indexing", "mobile SEO", "responsive design", "page speed"]
            },
            {
              title: "Schema Markup Implementation: Boosting CTR and Visibility",
              metaDescription: "Implement schema markup to enhance your search listings with rich results. Learn how structured data can improve click-through rates and visibility.",
              keywordsToInclude: ["schema markup", "structured data", "rich results", "SERP visibility"]
            }
          ]
        },
        {
          topic: "Link Building and Authority",
          articles: [
            {
              title: "Ethical Link Building: 12 Strategies That Actually Work in 2023",
              metaDescription: "Discover ethical link building strategies that drive results without risking penalties. This guide covers proven tactics for building quality backlinks.",
              keywordsToInclude: ["link building", "backlinks", "SEO authority", "ethical SEO"]
            },
            {
              title: "How to Earn High-Quality Backlinks with Content Marketing",
              metaDescription: "Learn how to create link-worthy content that naturally attracts backlinks. This guide shows how content marketing and SEO work together for link building.",
              keywordsToInclude: ["content marketing", "earn backlinks", "link-worthy content", "natural link building"]
            },
            {
              title: "Competitor Backlink Analysis: Finding Your Best Link Opportunities",
              metaDescription: "Use competitor backlink analysis to discover your best link building opportunities. This guide shows how to leverage competitor research for SEO gains.",
              keywordsToInclude: ["backlink analysis", "competitor research", "link opportunities", "SEO competitive analysis"]
            }
          ]
        }
      ]
    };
  }
};
