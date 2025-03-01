
import { SeoRecommendation } from './types';
import { OPENAI_API_KEY } from './apiConfig';

export const generateSeoRecommendations = async (
  domain: string,
  keywords: any[]
): Promise<{
  technical: SeoRecommendation[];
  onPage: SeoRecommendation[];
  offPage: SeoRecommendation[];
  content: SeoRecommendation[];
  summary: SeoRecommendation[];
}> => {
  try {
    console.log(`Generating SEO recommendations for ${domain} based on ${keywords.length} keywords`);
    
    // Only use top 50 keywords to prevent payload size issues
    const topKeywords = keywords.slice(0, 50);
    
    // First, try to use the OpenAI API to generate custom recommendations
    try {
      const systemPrompt = `You are an experienced SEO expert. Provide a detailed SEO review and clear recommendations for the main domain: ${domain}. Organize your advice into distinct sections, covering Technical SEO, On-Page SEO, Off-Page SEO, and Content Optimization.`;
      
      const userPrompt = `Based on these keywords: ${JSON.stringify(topKeywords)}, provide detailed SEO recommendations for ${domain}.

For each recommendation, be specific about:

1. **Technical SEO**:
   - Site structure and indexability (sitemap.xml, robots.txt, etc.).
   - Load speed and Core Web Vitals (recommend specific improvements if metrics are known).
   - Mobile responsiveness (highlight potential issues).
   - Structured data markup (mention applicable schema types if relevant).

2. **On-Page SEO**:
   - Title tags (recommend character count, suggested formatting).
   - Meta descriptions (provide recommended character limit ~150-160, example text if needed).
   - Header tags (H1, H2, H3) usage with focus keywords.
   - Keyword placement, density, and internal linking suggestions.
   - Content structure (bullet points, short paragraphs, scannability).

3. **Off-Page / Backlink Strategy**:
   - Target publications or platforms for guest posting or backlink outreach.
   - Social media signals and brand mentions.
   - Competitor backlink gap analysis suggestions.

4. **Content / Keyword Optimization**:
   - Recommended keywords (long-tail vs. short-tail), search intent alignment.
   - Keyword clustering for different pages or blog topics.
   - Suggested content upgrades or new article ideas to fill keyword gaps.

5. **Summary & Action Steps**:
   - List high-priority items (e.g., "Fix technical errors" or "Revamp meta tags on top-traffic pages").
   - Provide a rough timeline or roadmap.
   - If possible, give metrics to track (e.g., ranking changes, organic traffic, site speed improvements).

For each recommendation, include:
- The specific recommendation
- Priority level (high, medium, low)
- A brief explanation of why this is important
- Implementation difficulty (easy, medium, hard)

Format your response as JSON exactly like this:
{
  "technical": [
    {
      "type": "technical",
      "recommendation": "Specific recommendation here",
      "priority": "high|medium|low",
      "details": "Brief explanation of importance, including specific metrics or parameters if applicable",
      "implementationDifficulty": "easy|medium|hard"
    }
  ],
  "onPage": [
    {
      "type": "onPage",
      "recommendation": "Specific recommendation here",
      "priority": "high|medium|low",
      "details": "Brief explanation of importance, including specific metrics or parameters if applicable",
      "implementationDifficulty": "easy|medium|hard"
    }
  ],
  "offPage": [
    {
      "type": "offPage",
      "recommendation": "Specific recommendation here",
      "priority": "high|medium|low",
      "details": "Brief explanation of importance, including specific metrics or parameters if applicable",
      "implementationDifficulty": "easy|medium|hard"
    }
  ],
  "content": [
    {
      "type": "content",
      "recommendation": "Specific recommendation here",
      "priority": "high|medium|low",
      "details": "Brief explanation of importance, including specific metrics or parameters if applicable",
      "implementationDifficulty": "easy|medium|hard"
    }
  ],
  "summary": [
    {
      "type": "summary",
      "recommendation": "High-priority action item",
      "priority": "high",
      "details": "Timeline and expected metrics to track",
      "implementationDifficulty": "easy|medium|hard"
    }
  ]
}`;
      
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
              content: systemPrompt
            },
            {
              role: 'user',
              content: userPrompt
            }
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const parsedContent = JSON.parse(data.choices[0].message.content);
        
        console.log(`Generated ${
          (parsedContent.technical?.length || 0) + 
          (parsedContent.onPage?.length || 0) + 
          (parsedContent.offPage?.length || 0) + 
          (parsedContent.content?.length || 0) +
          (parsedContent.summary?.length || 0)
        } total SEO recommendations`);
        
        return {
          technical: parsedContent.technical || [],
          onPage: parsedContent.onPage || [],
          offPage: parsedContent.offPage || [],
          content: parsedContent.content || [],
          summary: parsedContent.summary || []
        };
      } else {
        console.warn(`OpenAI API returned status ${response.status}, falling back to predetermined recommendations`);
        throw new Error(`OpenAI API error: ${response.status}`);
      }
    } catch (error) {
      console.error("Error with OpenAI API:", error);
      
      // Fallback to predetermined recommendations
      return generatePredeterminedRecommendations(domain, keywords);
    }
  } catch (error) {
    console.error("Error generating SEO recommendations:", error);
    
    // Final fallback - generic recommendations
    return {
      technical: getGenericTechnicalRecommendations(),
      onPage: getGenericOnPageRecommendations(),
      offPage: getGenericOffPageRecommendations(),
      content: getGenericContentRecommendations(),
      summary: getGenericSummaryRecommendations()
    };
  }
};

function generatePredeterminedRecommendations(domain: string, keywords: any[]): {
  technical: SeoRecommendation[];
  onPage: SeoRecommendation[];
  offPage: SeoRecommendation[];
  content: SeoRecommendation[];
  summary: SeoRecommendation[];
} {
  console.log("Generating predetermined recommendations based on domain and keywords");
  
  // Extract domain name for analysis
  const domainName = domain.replace(/https?:\/\//i, '').replace(/www\./i, '').split('.')[0];
  
  // Get the top 10 keywords by search volume
  const topKeywords = [...keywords]
    .sort((a, b) => (b.monthly_search || 0) - (a.monthly_search || 0))
    .slice(0, 10)
    .map(k => k.keyword);
  
  // Determine if this is likely a business/corporate site or a blog/content site
  const isBusinessSite = domainName.match(/corp|inc|solutions|analytics|software|tech|consulting/i) !== null;
  
  return {
    technical: getCustomizedTechnicalRecommendations(isBusinessSite),
    onPage: getCustomizedOnPageRecommendations(topKeywords, isBusinessSite),
    offPage: getCustomizedOffPageRecommendations(domain, isBusinessSite),
    content: getCustomizedContentRecommendations(topKeywords, isBusinessSite),
    summary: getCustomizedSummaryRecommendations(isBusinessSite)
  };
}

function getCustomizedTechnicalRecommendations(isBusinessSite: boolean): SeoRecommendation[] {
  const baseRecommendations: SeoRecommendation[] = [
    {
      type: "technical",
      recommendation: "Implement XML sitemap and submit to Google Search Console",
      priority: "high",
      details: "Create and maintain an up-to-date sitemap.xml file to help search engines crawl and index your content efficiently. Submit to GSC monthly.",
      implementationDifficulty: "easy"
    },
    {
      type: "technical",
      recommendation: "Optimize page loading speed to under 2 seconds",
      priority: "high",
      details: "Compress images, minimize CSS/JS files, leverage browser caching, and implement lazy loading. Aim for a PageSpeed score above 80.",
      implementationDifficulty: "medium"
    },
    {
      type: "technical",
      recommendation: "Ensure mobile responsiveness across all devices",
      priority: "high",
      details: "Test all pages on multiple devices/screen sizes and fix any mobile usability issues. Check hamburger menus, text size, and touch targets.",
      implementationDifficulty: "medium"
    },
    {
      type: "technical",
      recommendation: "Optimize Core Web Vitals metrics",
      priority: "high",
      details: "Improve LCP < 2.5s, FID < 100ms, and CLS < 0.1 to enhance user experience and search rankings. Monitor regularly in GSC.",
      implementationDifficulty: "hard"
    },
    {
      type: "technical",
      recommendation: "Implement proper robots.txt configuration",
      priority: "medium",
      details: "Configure robots.txt to allow critical content crawling while blocking non-essential pages (login, admin areas) from search engines.",
      implementationDifficulty: "easy"
    },
    {
      type: "technical",
      recommendation: "Fix broken links and implement proper 301 redirects",
      priority: "medium",
      details: "Run a site audit to identify 404 errors and create proper 301 redirects for moved or deleted content. Prevents link equity loss.",
      implementationDifficulty: "easy"
    }
  ];
  
  if (isBusinessSite) {
    baseRecommendations.push(
      {
        type: "technical",
        recommendation: "Implement HTTPS security with proper SSL certificate",
        priority: "high",
        details: "Ensure your site uses SSL encryption, especially for forms and user data collection. Verify no mixed content warnings exist.",
        implementationDifficulty: "medium"
      },
      {
        type: "technical",
        recommendation: "Implement schema markup for organization and services",
        priority: "medium",
        details: "Add Organization schema with logo, contact info, and social profiles. Use Service schema for individual service pages to enhance rich snippets.",
        implementationDifficulty: "medium"
      }
    );
  } else {
    baseRecommendations.push(
      {
        type: "technical",
        recommendation: "Implement schema markup for articles and authors",
        priority: "medium",
        details: "Add Article schema to blog posts with author, publication date, and featured image. Implement BreadcrumbList schema for navigation paths.",
        implementationDifficulty: "medium"
      },
      {
        type: "technical",
        recommendation: "Set up RSS feed for content distribution",
        priority: "low",
        details: "Create an RSS feed for your blog to facilitate content discovery and syndication. Link from homepage and include in sitemap.",
        implementationDifficulty: "easy"
      }
    );
  }
  
  return baseRecommendations;
}

function getCustomizedOnPageRecommendations(topKeywords: string[], isBusinessSite: boolean): SeoRecommendation[] {
  const baseRecommendations: SeoRecommendation[] = [
    {
      type: "onPage",
      recommendation: `Optimize title tags with primary keywords (55-60 characters)`,
      priority: "high",
      details: `Include top keywords like "${topKeywords[0]}" and "${topKeywords[1]}" in title tags. Format as "Primary Keyword | Secondary Keyword | Brand Name" with total length under 60 characters.`,
      implementationDifficulty: "easy"
    },
    {
      type: "onPage",
      recommendation: "Write compelling meta descriptions with call-to-actions (150-160 characters)",
      priority: "medium",
      details: "Include relevant keywords naturally in meta descriptions, keep under 155 characters, and add a clear call-to-action. Example: 'Learn how to [keyword]. Our expert guides provide step-by-step solutions. Start improving today!'",
      implementationDifficulty: "easy"
    },
    {
      type: "onPage",
      recommendation: "Optimize URL structures for clarity and keywords",
      priority: "medium",
      details: "Use short, descriptive URLs with hyphens between words (e.g., domain.com/category-name/product-name). Include target keywords but keep under 60 characters total.",
      implementationDifficulty: "medium"
    },
    {
      type: "onPage",
      recommendation: "Implement proper header hierarchy (H1-H6)",
      priority: "high",
      details: "Use only one H1 per page with primary keyword. Use H2s for main sections and H3s for subsections, including secondary keywords naturally. Never skip levels (e.g., H1 to H3).",
      implementationDifficulty: "easy"
    },
    {
      type: "onPage",
      recommendation: "Add descriptive alt text to all images",
      priority: "medium",
      details: "Include descriptive, keyword-rich alt text for all images (5-15 words). Describe image content accurately while naturally incorporating relevant keywords.",
      implementationDifficulty: "easy"
    },
    {
      type: "onPage",
      recommendation: "Implement strategic internal linking structure",
      priority: "high",
      details: "Create a logical internal linking plan with descriptive anchor text containing target keywords. Link from high-authority pages to important content and from related content to each other.",
      implementationDifficulty: "medium"
    }
  ];
  
  if (isBusinessSite) {
    baseRecommendations.push(
      {
        type: "onPage",
        recommendation: "Create dedicated service/product pages with optimization",
        priority: "high",
        details: "Develop individual pages for each core service with unique H1s, compelling USPs, clear CTAs, and customer testimonials. Include service-specific keywords in the first 100 words.",
        implementationDifficulty: "medium"
      },
      {
        type: "onPage",
        recommendation: "Optimize location-based pages for local search",
        priority: "medium",
        details: "Create location-specific content with city/region names in titles, headers, and content. Include embedded Google Maps and local business schema markup.",
        implementationDifficulty: "medium"
      }
    );
  } else {
    baseRecommendations.push(
      {
        type: "onPage",
        recommendation: "Optimize blog post structure for readability",
        priority: "high", 
        details: "Use short paragraphs (3-4 sentences max), bullet points, numbered lists, and subheadings every 300 words. Include table of contents for posts longer than 1500 words.",
        implementationDifficulty: "medium"
      },
      {
        type: "onPage",
        recommendation: "Add FAQ sections to key pages",
        priority: "medium",
        details: "Include FAQ sections with 5-8 questions targeting long-tail keyword variations. Implement FAQ schema markup to enhance chances of featured snippets.",
        implementationDifficulty: "easy"
      }
    );
  }
  
  return baseRecommendations;
}

function getCustomizedOffPageRecommendations(domain: string, isBusinessSite: boolean): SeoRecommendation[] {
  // Extract domain TLD
  const tld = domain.replace(/https?:\/\//i, '').replace(/www\./i, '').split('.').pop() || 'com';
  
  const baseRecommendations: SeoRecommendation[] = [
    {
      type: "offPage",
      recommendation: "Develop a strategic backlink acquisition plan",
      priority: "high",
      details: "Target high-authority websites (DA 40+) in your industry for guest posting and backlink opportunities. Aim for 5-10 new quality backlinks per month.",
      implementationDifficulty: "hard"
    },
    {
      type: "offPage",
      recommendation: "Create shareable content assets for natural link building",
      priority: "medium",
      details: "Develop infographics, research studies, or comprehensive guides that naturally attract backlinks. Promote via email outreach to industry websites.",
      implementationDifficulty: "hard"
    },
    {
      type: "offPage",
      recommendation: "Monitor and disavow toxic backlinks",
      priority: "medium",
      details: "Regularly audit backlink profile and disavow spammy or low-quality links that could harm rankings. Use Google Search Console to identify and address issues.",
      implementationDifficulty: "medium"
    },
    {
      type: "offPage",
      recommendation: "Implement social media sharing strategy",
      priority: "medium",
      details: "Share all new content across relevant social platforms with engaging snippets. Include image/video content for higher engagement rates and more shares.",
      implementationDifficulty: "easy"
    }
  ];
  
  if (isBusinessSite) {
    baseRecommendations.push(
      {
        type: "offPage",
        recommendation: "Get listed in industry-specific directories",
        priority: "medium",
        details: `Submit your business to relevant industry directories and association websites. Ensure NAP (Name, Address, Phone) consistency across all listings.`,
        implementationDifficulty: "medium"
      },
      {
        type: "offPage",
        recommendation: "Set up and optimize Google Business Profile",
        priority: "high",
        details: "Claim and fully optimize your GBP listing with accurate business info, photos, services, and regular posts. Actively request and respond to customer reviews.",
        implementationDifficulty: "easy"
      }
    );
  } else {
    baseRecommendations.push(
      {
        type: "offPage",
        recommendation: "Participate in relevant online communities",
        priority: "medium",
        details: "Contribute valuable insights to discussions on Reddit, Quora, and industry forums. Include contextual links to your content where appropriate and helpful.",
        implementationDifficulty: "medium"
      },
      {
        type: "offPage",
        recommendation: "Build relationships with influencers in your niche",
        priority: "medium",
        details: "Identify and connect with influencers who can amplify your content. Offer them exclusive content, interviews, or collaborative opportunities.",
        implementationDifficulty: "hard"
      }
    );
  }
  
  return baseRecommendations;
}

function getCustomizedContentRecommendations(topKeywords: string[], isBusinessSite: boolean): SeoRecommendation[] {
  const baseRecommendations: SeoRecommendation[] = [
    {
      type: "content",
      recommendation: `Create comprehensive content targeting "${topKeywords[0]}" and "${topKeywords[1]}"`,
      priority: "high",
      details: `Develop authoritative content (1500+ words) focused on these high-volume keywords. Include expert insights, statistics, and actionable advice to establish topical authority.`,
      implementationDifficulty: "medium"
    },
    {
      type: "content",
      recommendation: "Implement content clustering strategy",
      priority: "high",
      details: "Organize content into pillar pages (comprehensive guides on broad topics) and supporting cluster content (detailed articles on subtopics) with internal linking between them.",
      implementationDifficulty: "hard"
    },
    {
      type: "content",
      recommendation: "Develop a consistent content publishing schedule",
      priority: "medium",
      details: "Publish high-quality content on a regular basis (2-4 times per month minimum). Maintain consistent quality and word count (1000+ words per piece).",
      implementationDifficulty: "medium"
    },
    {
      type: "content",
      recommendation: "Update and refresh existing content quarterly",
      priority: "medium",
      details: "Regularly review older content to add new information, update statistics, improve readability, and re-optimize for current keyword trends. Update publication dates.",
      implementationDifficulty: "medium"
    },
    {
      type: "content",
      recommendation: "Include multimedia elements in content",
      priority: "medium",
      details: "Add custom images, videos, charts, and interactive elements to increase engagement and time on page. Include proper alt text and captions with relevant keywords.",
      implementationDifficulty: "medium"
    }
  ];
  
  if (isBusinessSite) {
    baseRecommendations.push(
      {
        type: "content",
        recommendation: "Create detailed case studies and client success stories",
        priority: "high",
        details: "Develop case studies showcasing measurable results and specific benefits clients received. Include metrics, testimonials, and process descriptions.",
        implementationDifficulty: "medium"
      },
      {
        type: "content",
        recommendation: "Develop conversion-focused service pages",
        priority: "high",
        details: "Create detailed service pages with clear USPs, benefits, process steps, FAQs, and compelling CTAs. Target service-specific keywords (e.g., 'affordable [service] in [location]').",
        implementationDifficulty: "medium"
      }
    );
  } else {
    baseRecommendations.push(
      {
        type: "content",
        recommendation: "Create 'what is' and 'how to' content for search intent",
        priority: "high",
        details: "Develop educational content that directly addresses user search intent. Create 'what is' articles for informational queries and 'how to' guides for instructional needs.",
        implementationDifficulty: "medium"
      },
      {
        type: "content",
        recommendation: "Develop 10x content on core topics",
        priority: "high",
        details: "Create content significantly better than top-ranking competitors by including more depth, better examples, original research, expert quotes, and comprehensive solutions.",
        implementationDifficulty: "hard"
      }
    );
  }
  
  return baseRecommendations;
}

function getCustomizedSummaryRecommendations(isBusinessSite: boolean): SeoRecommendation[] {
  // Create a roadmap of action items with timeline
  return [
    {
      type: "summary",
      recommendation: "Phase 1: Technical Foundation (Weeks 1-2)",
      priority: "high",
      details: "Fix technical SEO issues including site speed, mobile responsiveness, XML sitemap, and robots.txt configuration. Metrics to track: PageSpeed score improvement, Core Web Vitals metrics, crawl errors reduction.",
      implementationDifficulty: "medium"
    },
    {
      type: "summary",
      recommendation: "Phase 2: On-Page Optimization (Weeks 3-5)",
      priority: "high",
      details: "Optimize title tags, meta descriptions, URL structures, and header tags on top 20 pages. Implement proper keyword usage and internal linking. Metrics to track: Keyword rankings, click-through rates from search results.",
      implementationDifficulty: "medium"
    },
    {
      type: "summary",
      recommendation: "Phase 3: Content Development (Weeks 6-12)",
      priority: "high",
      details: "Create and publish new optimized content based on keyword research. Develop pillar pages and supporting cluster content. Metrics to track: Organic traffic growth, engaged users, time on page.",
      implementationDifficulty: "hard"
    },
    {
      type: "summary",
      recommendation: "Phase 4: Off-Page Strategy (Ongoing)",
      priority: "medium",
      details: "Implement backlink acquisition campaign, social sharing strategy, and brand mentions monitoring. Metrics to track: Referring domains growth, social shares, brand mention frequency.",
      implementationDifficulty: "hard"
    },
    {
      type: "summary",
      recommendation: "Continuous Monitoring and Refinement",
      priority: "medium",
      details: "Set up monthly reporting on key SEO metrics. Identify underperforming areas and refine strategy accordingly. Expect meaningful ranking improvements within 3-6 months for competitive terms.",
      implementationDifficulty: "medium"
    }
  ];
}

// Generic fallback recommendations if other methods fail

function getGenericTechnicalRecommendations(): SeoRecommendation[] {
  return [
    {
      type: "technical",
      recommendation: "Implement XML sitemap and submit to Google Search Console",
      priority: "high",
      details: "Create and maintain an up-to-date sitemap.xml file to help search engines crawl and index your content efficiently.",
      implementationDifficulty: "easy"
    },
    {
      type: "technical",
      recommendation: "Improve page loading speed",
      priority: "high",
      details: "Compress images, leverage browser caching, and minimize CSS/JavaScript. Aim for load time under 2 seconds.",
      implementationDifficulty: "medium"
    },
    {
      type: "technical",
      recommendation: "Ensure mobile responsiveness",
      priority: "high",
      details: "Test all pages on multiple devices and fix any mobile usability issues. Google primarily uses mobile-first indexing.",
      implementationDifficulty: "medium"
    },
    {
      type: "technical",
      recommendation: "Fix broken links and implement proper redirects",
      priority: "medium",
      details: "Run a site audit to identify and fix broken links. Use 301 redirects for permanently moved content.",
      implementationDifficulty: "easy"
    },
    {
      type: "technical",
      recommendation: "Implement schema markup",
      priority: "medium",
      details: "Add relevant structured data to help search engines understand your content better. Use appropriate schema types for your content.",
      implementationDifficulty: "medium"
    },
    {
      type: "technical",
      recommendation: "Optimize for Core Web Vitals",
      priority: "high",
      details: "Improve LCP, FID, and CLS metrics to enhance user experience and search rankings. Monitor in Google Search Console.",
      implementationDifficulty: "hard"
    }
  ];
}

function getGenericOnPageRecommendations(): SeoRecommendation[] {
  return [
    {
      type: "onPage",
      recommendation: "Optimize title tags with primary keywords",
      priority: "high",
      details: "Include target keywords in title tags, keeping them under 60 characters. Format as 'Primary Keyword | Secondary Keyword | Brand Name'.",
      implementationDifficulty: "easy"
    },
    {
      type: "onPage",
      recommendation: "Write compelling meta descriptions",
      priority: "medium",
      details: "Include a call-to-action and keep under 155 characters. Use natural language that encourages clicks from search results.",
      implementationDifficulty: "easy"
    },
    {
      type: "onPage",
      recommendation: "Optimize URL structures",
      priority: "medium",
      details: "Use short, descriptive URLs with hyphens between words and include target keywords where natural.",
      implementationDifficulty: "medium"
    },
    {
      type: "onPage",
      recommendation: "Implement proper header hierarchy",
      priority: "high",
      details: "Use only one H1 per page and include target keywords in H2s and H3s. Structure content logically with headers.",
      implementationDifficulty: "easy"
    },
    {
      type: "onPage",
      recommendation: "Add descriptive alt text to all images",
      priority: "medium",
      details: "Include descriptive alt text for all images. Describe the image accurately while incorporating relevant keywords naturally.",
      implementationDifficulty: "easy"
    },
    {
      type: "onPage",
      recommendation: "Implement strategic internal linking",
      priority: "high",
      details: "Create a logical internal linking strategy to distribute page authority and help users navigate your site effectively.",
      implementationDifficulty: "medium"
    }
  ];
}

function getGenericOffPageRecommendations(): SeoRecommendation[] {
  return [
    {
      type: "offPage",
      recommendation: "Develop a backlink acquisition strategy",
      priority: "high",
      details: "Target relevant, high-authority websites for backlinks through guest posting, resource link building, and outreach campaigns.",
      implementationDifficulty: "hard"
    },
    {
      type: "offPage",
      recommendation: "Create shareable content assets",
      priority: "medium",
      details: "Develop infographics, studies, or comprehensive guides that naturally attract backlinks and social shares.",
      implementationDifficulty: "hard"
    },
    {
      type: "offPage",
      recommendation: "Monitor and disavow toxic backlinks",
      priority: "medium",
      details: "Regularly audit your backlink profile and disavow spammy or low-quality links that could harm your rankings.",
      implementationDifficulty: "medium"
    },
    {
      type: "offPage",
      recommendation: "Implement social sharing strategy",
      priority: "medium",
      details: "Share all new content across relevant social platforms with engaging snippets to increase visibility and traffic.",
      implementationDifficulty: "easy"
    },
    {
      type: "offPage",
      recommendation: "Get listed in relevant directories",
      priority: "low",
      details: "Submit your site to industry-specific directories and resource lists to build citation signals.",
      implementationDifficulty: "easy"
    },
    {
      type: "offPage",
      recommendation: "Develop brand mentions strategy",
      priority: "low",
      details: "Increase unlinked brand mentions across the web through PR, partnerships, and community engagement.",
      implementationDifficulty: "medium"
    }
  ];
}

function getGenericContentRecommendations(): SeoRecommendation[] {
  return [
    {
      type: "content",
      recommendation: "Create comprehensive, high-quality content",
      priority: "high",
      details: "Develop in-depth content (1500+ words) that thoroughly addresses user search intent with expert insights and actionable advice.",
      implementationDifficulty: "medium"
    },
    {
      type: "content",
      recommendation: "Implement content clustering strategy",
      priority: "high",
      details: "Organize content into pillar pages and supporting cluster content with strategic internal linking between related topics.",
      implementationDifficulty: "hard"
    },
    {
      type: "content",
      recommendation: "Develop a consistent publishing schedule",
      priority: "medium",
      details: "Consistently publish fresh, relevant content (2-4 times monthly) to signal site activity to search engines.",
      implementationDifficulty: "medium"
    },
    {
      type: "content",
      recommendation: "Update and refresh existing content",
      priority: "medium",
      details: "Regularly review and update older content to maintain relevance, accuracy, and optimize for current keyword trends.",
      implementationDifficulty: "medium"
    },
    {
      type: "content",
      recommendation: "Include multimedia elements",
      priority: "low",
      details: "Add images, videos, and interactive elements to increase engagement, time on page, and natural keyword inclusion.",
      implementationDifficulty: "medium"
    },
    {
      type: "content",
      recommendation: "Optimize for featured snippets",
      priority: "medium",
      details: "Structure content to target featured snippets with clear definitions, steps, lists, and tables that directly answer common questions.",
      implementationDifficulty: "medium"
    }
  ];
}

function getGenericSummaryRecommendations(): SeoRecommendation[] {
  return [
    {
      type: "summary",
      recommendation: "Phase 1: Technical SEO Foundation (Weeks 1-2)",
      priority: "high",
      details: "Address critical technical issues first, including site speed, mobile optimization, and XML sitemap implementation.",
      implementationDifficulty: "medium"
    },
    {
      type: "summary",
      recommendation: "Phase 2: On-Page Optimization (Weeks 3-5)",
      priority: "high",
      details: "Optimize metadata, headers, and content structure on top-performing and high-potential pages.",
      implementationDifficulty: "medium"
    },
    {
      type: "summary",
      recommendation: "Phase 3: Content Development (Weeks 6-12)",
      priority: "high",
      details: "Create new optimized content and update existing content based on keyword research and user intent.",
      implementationDifficulty: "hard"
    },
    {
      type: "summary",
      recommendation: "Phase 4: Off-Page Strategy (Ongoing)",
      priority: "medium",
      details: "Implement link building campaigns, social promotion, and brand visibility initiatives.",
      implementationDifficulty: "hard"
    },
    {
      type: "summary",
      recommendation: "Monitor and Refine (Monthly)",
      priority: "medium",
      details: "Track rankings, traffic, and engagement metrics. Adjust strategy based on performance data.",
      implementationDifficulty: "medium"
    }
  ];
}

