
import { SeoRecommendation } from './types';
import { OPENAI_API_KEY } from './apiConfig';

export const generateSeoRecommendations = async (
  domain: string,
  keywords: any[]
): Promise<{
  onPage: SeoRecommendation[];
  technical: SeoRecommendation[];
  content: SeoRecommendation[];
}> => {
  try {
    console.log(`Generating SEO recommendations for ${domain} based on ${keywords.length} keywords`);
    
    // Only use top 50 keywords to prevent payload size issues
    const topKeywords = keywords.slice(0, 50);
    
    // First, try to use the OpenAI API to generate custom recommendations
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
              content: 'You are an expert SEO consultant who provides actionable recommendations based on keyword data.'
            },
            {
              role: 'user',
              content: `Analyze this keyword data for the domain "${domain}" and provide SEO recommendations:
              
              ${JSON.stringify(topKeywords)}
              
              Generate 15-20 total recommendations split into three categories:
              1. On-page SEO recommendations
              2. Technical SEO recommendations
              3. Content strategy recommendations
              
              For each recommendation, include:
              - The specific recommendation
              - Priority level (high, medium, low)
              - A brief explanation of why this is important
              - Implementation difficulty (easy, medium, hard)
              
              Format your response as JSON exactly like this:
              {
                "onPage": [
                  {
                    "type": "onPage",
                    "recommendation": "Specific recommendation here",
                    "priority": "high|medium|low",
                    "details": "Brief explanation of importance",
                    "implementationDifficulty": "easy|medium|hard"
                  }
                ],
                "technical": [
                  {
                    "type": "technical",
                    "recommendation": "Specific recommendation here",
                    "priority": "high|medium|low",
                    "details": "Brief explanation of importance",
                    "implementationDifficulty": "easy|medium|hard"
                  }
                ],
                "content": [
                  {
                    "type": "content",
                    "recommendation": "Specific recommendation here",
                    "priority": "high|medium|low",
                    "details": "Brief explanation of importance",
                    "implementationDifficulty": "easy|medium|hard"
                  }
                ]
              }`
            }
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const parsedContent = JSON.parse(data.choices[0].message.content);
        
        console.log(`Generated ${parsedContent.onPage.length} on-page, ${parsedContent.technical.length} technical, and ${parsedContent.content.length} content recommendations`);
        
        return {
          onPage: parsedContent.onPage,
          technical: parsedContent.technical,
          content: parsedContent.content
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
      onPage: getGenericOnPageRecommendations(),
      technical: getGenericTechnicalRecommendations(),
      content: getGenericContentRecommendations()
    };
  }
};

function generatePredeterminedRecommendations(domain: string, keywords: any[]): {
  onPage: SeoRecommendation[];
  technical: SeoRecommendation[];
  content: SeoRecommendation[];
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
    onPage: getCustomizedOnPageRecommendations(topKeywords, isBusinessSite),
    technical: getCustomizedTechnicalRecommendations(isBusinessSite),
    content: getCustomizedContentRecommendations(topKeywords, isBusinessSite)
  };
}

function getCustomizedOnPageRecommendations(topKeywords: string[], isBusinessSite: boolean): SeoRecommendation[] {
  const baseRecommendations: SeoRecommendation[] = [
    {
      type: "onPage",
      recommendation: `Optimize title tags with primary keywords`,
      priority: "high",
      details: `Include top keywords like "${topKeywords[0]}" and "${topKeywords[1]}" in title tags, staying under 60 characters`,
      implementationDifficulty: "easy"
    },
    {
      type: "onPage",
      recommendation: "Write compelling meta descriptions with call-to-actions",
      priority: "medium",
      details: "Include relevant keywords naturally and keep under 155 characters",
      implementationDifficulty: "easy"
    },
    {
      type: "onPage",
      recommendation: "Optimize URL structures for clarity and keywords",
      priority: "medium",
      details: "Use short, descriptive URLs with hyphens between words and relevant keywords",
      implementationDifficulty: "medium"
    },
    {
      type: "onPage",
      recommendation: "Implement proper header hierarchy (H1-H6)",
      priority: "high",
      details: "Use only one H1 per page and include target keywords in H2s and H3s",
      implementationDifficulty: "easy"
    },
    {
      type: "onPage",
      recommendation: "Add alt text to all images",
      priority: "medium",
      details: "Include descriptive, keyword-rich alt text for all images to improve accessibility and SEO",
      implementationDifficulty: "easy"
    }
  ];
  
  if (isBusinessSite) {
    baseRecommendations.push(
      {
        type: "onPage",
        recommendation: "Optimize service/product pages for conversion",
        priority: "high",
        details: "Include clear CTAs, benefits, and feature descriptions with target keywords",
        implementationDifficulty: "medium"
      }
    );
  } else {
    baseRecommendations.push(
      {
        type: "onPage",
        recommendation: "Implement internal linking structure",
        priority: "high",
        details: "Create a strategic internal linking plan to distribute page authority and help users navigate",
        implementationDifficulty: "medium"
      }
    );
  }
  
  return baseRecommendations;
}

function getCustomizedTechnicalRecommendations(isBusinessSite: boolean): SeoRecommendation[] {
  const baseRecommendations: SeoRecommendation[] = [
    {
      type: "technical",
      recommendation: "Improve page loading speed",
      priority: "high",
      details: "Compress images, leverage browser caching, and minimize CSS/JavaScript",
      implementationDifficulty: "medium"
    },
    {
      type: "technical",
      recommendation: "Ensure mobile responsiveness",
      priority: "high",
      details: "Test all pages on multiple devices and fix any mobile usability issues",
      implementationDifficulty: "medium"
    },
    {
      type: "technical",
      recommendation: "Fix broken links and 404 errors",
      priority: "medium",
      details: "Run a site audit to identify and fix broken links and implement proper 301 redirects",
      implementationDifficulty: "easy"
    },
    {
      type: "technical",
      recommendation: "Implement schema markup",
      priority: "medium",
      details: "Add relevant structured data to help search engines understand your content better",
      implementationDifficulty: "medium"
    },
    {
      type: "technical",
      recommendation: "Create and submit an XML sitemap",
      priority: "medium",
      details: "Generate an updated sitemap and submit it to Google Search Console",
      implementationDifficulty: "easy"
    }
  ];
  
  if (isBusinessSite) {
    baseRecommendations.push(
      {
        type: "technical",
        recommendation: "Implement HTTPS security",
        priority: "high",
        details: "Ensure your site uses SSL encryption, especially for forms and user data collection",
        implementationDifficulty: "medium"
      }
    );
  } else {
    baseRecommendations.push(
      {
        type: "technical",
        recommendation: "Optimize for Core Web Vitals",
        priority: "high",
        details: "Improve LCP, FID, and CLS metrics to enhance user experience and search rankings",
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
      recommendation: `Create content addressing "${topKeywords[0]}" and "${topKeywords[1]}"`,
      priority: "high",
      details: "Develop comprehensive, high-quality content focused on these high-volume keywords",
      implementationDifficulty: "medium"
    },
    {
      type: "content",
      recommendation: "Develop a regular content publishing schedule",
      priority: "medium",
      details: "Consistently publish fresh, relevant content on topics your audience cares about",
      implementationDifficulty: "medium"
    },
    {
      type: "content",
      recommendation: "Create long-form, comprehensive guides",
      priority: "high",
      details: "Develop in-depth content (1500+ words) that thoroughly covers important topics",
      implementationDifficulty: "hard"
    },
    {
      type: "content",
      recommendation: "Update and refresh existing content",
      priority: "medium",
      details: "Regularly review and update older content to maintain relevance and accuracy",
      implementationDifficulty: "medium"
    },
    {
      type: "content",
      recommendation: "Include multimedia elements in content",
      priority: "low",
      details: "Add images, videos, and interactive elements to increase engagement and time on page",
      implementationDifficulty: "medium"
    }
  ];
  
  if (isBusinessSite) {
    baseRecommendations.push(
      {
        type: "content",
        recommendation: "Develop case studies and testimonials",
        priority: "high",
        details: "Create content showcasing successful client results and experiences",
        implementationDifficulty: "medium"
      }
    );
  } else {
    baseRecommendations.push(
      {
        type: "content",
        recommendation: "Implement content clusters around main topics",
        priority: "high",
        details: "Organize content into pillar pages and related cluster content to establish topic authority",
        implementationDifficulty: "hard"
      }
    );
  }
  
  return baseRecommendations;
}

function getGenericOnPageRecommendations(): SeoRecommendation[] {
  return [
    {
      type: "onPage",
      recommendation: "Optimize title tags with primary keywords",
      priority: "high",
      details: "Include target keywords in title tags, keeping them under 60 characters",
      implementationDifficulty: "easy"
    },
    {
      type: "onPage",
      recommendation: "Write compelling meta descriptions",
      priority: "medium",
      details: "Include a call-to-action and keep under 155 characters",
      implementationDifficulty: "easy"
    },
    {
      type: "onPage",
      recommendation: "Optimize URL structures",
      priority: "medium",
      details: "Use short, descriptive URLs with hyphens between words",
      implementationDifficulty: "medium"
    },
    {
      type: "onPage",
      recommendation: "Implement proper header hierarchy",
      priority: "high",
      details: "Use only one H1 per page and include target keywords in H2s and H3s",
      implementationDifficulty: "easy"
    },
    {
      type: "onPage",
      recommendation: "Add alt text to all images",
      priority: "medium",
      details: "Include descriptive alt text for all images",
      implementationDifficulty: "easy"
    },
    {
      type: "onPage",
      recommendation: "Implement internal linking structure",
      priority: "high",
      details: "Create a logical internal linking strategy to distribute page authority",
      implementationDifficulty: "medium"
    }
  ];
}

function getGenericTechnicalRecommendations(): SeoRecommendation[] {
  return [
    {
      type: "technical",
      recommendation: "Improve page loading speed",
      priority: "high",
      details: "Compress images, leverage browser caching, and minimize CSS/JavaScript",
      implementationDifficulty: "medium"
    },
    {
      type: "technical",
      recommendation: "Ensure mobile responsiveness",
      priority: "high",
      details: "Test all pages on multiple devices and fix any mobile usability issues",
      implementationDifficulty: "medium"
    },
    {
      type: "technical",
      recommendation: "Fix broken links and 404 errors",
      priority: "medium",
      details: "Run a site audit to identify and fix broken links",
      implementationDifficulty: "easy"
    },
    {
      type: "technical",
      recommendation: "Implement schema markup",
      priority: "medium",
      details: "Add relevant structured data to help search engines understand your content",
      implementationDifficulty: "medium"
    },
    {
      type: "technical",
      recommendation: "Create and submit an XML sitemap",
      priority: "medium",
      details: "Generate an updated sitemap and submit it to Google Search Console",
      implementationDifficulty: "easy"
    },
    {
      type: "technical",
      recommendation: "Optimize for Core Web Vitals",
      priority: "high",
      details: "Improve LCP, FID, and CLS metrics to enhance user experience",
      implementationDifficulty: "hard"
    }
  ];
}

function getGenericContentRecommendations(): SeoRecommendation[] {
  return [
    {
      type: "content",
      recommendation: "Create comprehensive, high-quality content",
      priority: "high",
      details: "Develop in-depth content that thoroughly addresses user search intent",
      implementationDifficulty: "medium"
    },
    {
      type: "content",
      recommendation: "Develop a regular content publishing schedule",
      priority: "medium",
      details: "Consistently publish fresh, relevant content",
      implementationDifficulty: "medium"
    },
    {
      type: "content",
      recommendation: "Create long-form, comprehensive guides",
      priority: "high",
      details: "Develop in-depth content (1500+ words) on important topics",
      implementationDifficulty: "hard"
    },
    {
      type: "content",
      recommendation: "Update and refresh existing content",
      priority: "medium",
      details: "Regularly review and update older content to maintain relevance",
      implementationDifficulty: "medium"
    },
    {
      type: "content",
      recommendation: "Include multimedia elements in content",
      priority: "low",
      details: "Add images, videos, and interactive elements to increase engagement",
      implementationDifficulty: "medium"
    },
    {
      type: "content",
      recommendation: "Implement content clusters around main topics",
      priority: "high",
      details: "Organize content into pillar pages and related cluster content",
      implementationDifficulty: "hard"
    }
  ];
}
