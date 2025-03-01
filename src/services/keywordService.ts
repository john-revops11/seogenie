
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

export const generateContent = async (
  domain: string,
  title: string,
  keywords: string[],
  contentType: string,
  creativity: number
): Promise<{
  title: string;
  metaDescription: string;
  outline: string[];
  content: string;
}> => {
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
            content: `You are an expert SEO content creator who writes high-quality, engaging content optimized for search engines. 
            You follow SEO best practices such as proper keyword usage, heading structure, and readability.`
          },
          {
            role: 'user',
            content: `Create ${contentType} content for the website "${domain}" with the title "${title}".
            
            Target keywords: ${keywords.join(', ')}
            
            Return a JSON object with these properties:
            - title: An SEO-optimized title that includes primary keywords
            - metaDescription: A compelling meta description under 160 characters that includes keywords and encourages clicks
            - outline: An array of section headings (5-7 items)
            - content: The full content in Markdown format, properly structured with headings, paragraphs, and occasional bullet points. Include primary keywords naturally in headings and throughout the content.`
          }
        ],
        temperature: creativity / 100, // Convert 0-100 scale to 0-1
        response_format: { type: 'json_object' }
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error("Error generating content:", error);
    toast.error(`Failed to generate content: ${(error as Error).message}`);
    
    // Return mock content if the API fails
    return {
      title: title,
      metaDescription: `Discover the best ${keywords.join(", ")} and strategies to improve your SEO performance. Learn how to analyze and optimize your website for better rankings.`,
      outline: [
        "Introduction to SEO Tools and Keyword Research",
        "Why Keyword Research is Critical for SEO Success",
        "Top 5 SEO Tools for Effective Keyword Analysis",
        "How to Identify Valuable Keywords for Your Industry",
        "Implementing Keyword Strategy for Better Rankings",
        "Measuring and Tracking Keyword Performance",
        "Conclusion and Next Steps"
      ],
      content: `# ${title}

## Introduction to SEO Tools and Keyword Research

In today's competitive digital landscape, having the right **SEO tools** at your disposal can make the difference between online visibility and obscurity. Effective **keyword research** forms the foundation of any successful SEO strategy, allowing businesses to understand what their potential customers are searching for.

## Why Keyword Research is Critical for SEO Success

**Keyword research** isn't just about finding popular search terms; it's about uncovering the specific language your audience uses when looking for solutions. By understanding these patterns, you can create content that directly addresses their needs and questions.

- Identifies customer pain points and questions
- Reveals new market opportunities
- Helps prioritize content creation efforts
- Provides competitive intelligence

## Top 5 SEO Tools for Effective Keyword Analysis

The market offers numerous **SEO tools** designed to simplify and enhance your keyword discovery process:

1. **SEMrush** - Comprehensive keyword data with competitive analysis
2. **Ahrefs** - In-depth backlink analysis and keyword difficulty metrics
3. **Moz Keyword Explorer** - Keyword suggestions with opportunity scores
4. **Google Keyword Planner** - Direct insights from Google's data
5. **Ubersuggest** - User-friendly interface with content ideas

Each of these tools offers unique features that can help you identify valuable keywords and understand their potential.

## How to Identify Valuable Keywords for Your Industry

Not all keywords are created equal. The most valuable keywords for your business will balance search volume, competition, and relevance:

* **Search Volume**: How many people are searching for this term monthly
* **Keyword Difficulty**: How hard it will be to rank for this term
* **Commercial Intent**: How likely searchers are to convert
* **Relevance**: How closely the keyword matches your offerings

## Implementing Keyword Strategy for Better Rankings

Once you've identified your target keywords, implementation becomes key:

- Incorporate primary keywords in titles, headings, and opening paragraphs
- Use secondary keywords naturally throughout your content
- Optimize meta descriptions and URL structures
- Create topic clusters around related keywords
- Develop a content calendar based on keyword opportunities

## Measuring and Tracking Keyword Performance

The work doesn't end with implementation. Regular monitoring helps you understand what's working and what needs adjustment:

1. Track ranking positions for target keywords
2. Monitor organic traffic to optimized pages
3. Analyze user behavior and engagement metrics
4. Adjust strategy based on performance data

## Conclusion and Next Steps

**SEO tools** and effective **keyword research** are not one-time tasks but ongoing processes that evolve with your business and the digital landscape. By consistently refining your approach and staying informed about changes in search algorithms, you can maintain and improve your website's visibility.

Ready to take your SEO strategy to the next level? Start by conducting a comprehensive keyword audit and identifying new opportunities for growth.`
    };
  }
};
