
import { toast } from "sonner";
import { KeywordData } from './types';
import { fetchDomainKeywords, ensureValidUrl } from './api';

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
    
    // Try to fetch real data from API
    let mainKeywords: KeywordData[] = [];
    
    try {
      toast.info(`Fetching keyword data for ${mainDomain}...`, { duration: 3000, id: "fetch-main-domain" });
      mainKeywords = await fetchDomainKeywords(formattedMainDomain);
      
      if (!mainKeywords.length) {
        console.warn(`No keywords found for ${formattedMainDomain}`);
        
        // Create a user prompt using the toast system with a promise
        const userConsent = await new Promise<boolean>((resolve) => {
          toast.message(
            `No keywords found for ${formattedMainDomain} via API. Would you like to use AI to generate keywords?`, 
            {
              id: "ai-keywords-prompt",
              duration: 10000, // Longer duration to allow user to decide
              action: {
                label: "Use AI Tool",
                onClick: () => resolve(true)
              },
              cancel: {
                label: "Cancel",
                onClick: () => resolve(false)
              },
              onDismiss: () => resolve(false)
            }
          );
        });
        
        if (!userConsent) {
          toast.error(`Analysis canceled for ${formattedMainDomain}. Please check your domain or API settings.`, { id: "analysis-canceled" });
          return { keywords: [], success: false };
        }
        
        // User consented to use AI, show a loading toast
        toast.loading(`Using AI to generate keywords for ${formattedMainDomain}...`, { id: "ai-keywords-generating" });
        
        try {
          // Use AI to generate keywords (implement this function to use OpenAI API)
          mainKeywords = await generateKeywordsWithAI(formattedMainDomain);
          
          if (mainKeywords.length > 0) {
            toast.success(`Generated ${mainKeywords.length} keywords using AI for ${mainDomain}`, { id: "ai-keywords-generated" });
          } else {
            toast.error(`Failed to generate keywords using AI for ${formattedMainDomain}`, { id: "ai-keywords-failed" });
            return { keywords: [], success: false };
          }
        } catch (aiError) {
          console.error(`Error generating keywords with AI for ${formattedMainDomain}:`, aiError);
          toast.error(`AI keyword generation failed for ${formattedMainDomain}: ${(aiError as Error).message}`, { id: "ai-generation-error" });
          return { keywords: [], success: false };
        }
      } else {
        toast.success(`Found ${mainKeywords.length} keywords for ${mainDomain}`, { id: "keywords-found" });
      }
    } catch (error) {
      console.error(`Error fetching keywords for ${formattedMainDomain}:`, error);
      
      // Create a user prompt using the toast system with a promise
      const userConsent = await new Promise<boolean>((resolve) => {
        toast.message(
          `API error when fetching keywords for ${formattedMainDomain}. Would you like to use AI to generate keywords instead?`, 
          {
            id: "ai-keywords-prompt",
            duration: 10000, // Longer duration to allow user to decide
            action: {
              label: "Use AI Tool",
              onClick: () => resolve(true)
            },
            cancel: {
              label: "Cancel",
              onClick: () => resolve(false)
            },
            onDismiss: () => resolve(false)
          }
        );
      });
      
      if (!userConsent) {
        toast.error(`Analysis canceled for ${formattedMainDomain}. Please check your API settings.`, { id: "analysis-canceled" });
        return { keywords: [], success: false };
      }
      
      // User consented to use AI, show a loading toast
      toast.loading(`Using AI to generate keywords for ${formattedMainDomain}...`, { id: "ai-keywords-generating" });
      
      try {
        // Use AI to generate keywords (implement this function to use OpenAI API)
        mainKeywords = await generateKeywordsWithAI(formattedMainDomain);
        
        if (mainKeywords.length > 0) {
          toast.success(`Generated ${mainKeywords.length} keywords using AI for ${mainDomain}`, { id: "ai-keywords-generated" });
        } else {
          toast.error(`Failed to generate keywords using AI for ${formattedMainDomain}`, { id: "ai-keywords-failed" });
          return { keywords: [], success: false };
        }
      } catch (aiError) {
        console.error(`Error generating keywords with AI for ${formattedMainDomain}:`, aiError);
        toast.error(`AI keyword generation failed for ${formattedMainDomain}: ${(aiError as Error).message}`, { id: "ai-generation-error" });
        return { keywords: [], success: false };
      }
    }
    
    // Process competitor domains
    const competitorResults = [];
    
    for (const domain of formattedCompetitorDomains) {
      try {
        toast.info(`Analyzing competitor: ${domain}`);
        let keywords = [];
        
        try {
          keywords = await fetchDomainKeywords(domain);
        } catch (error) {
          console.error(`Error fetching competitor keywords for ${domain}:`, error);
          
          // Create a user prompt using the toast system with a promise
          const userConsent = await new Promise<boolean>((resolve) => {
            toast.message(
              `API error when fetching keywords for competitor ${domain}. Would you like to use AI to generate keywords?`, 
              {
                id: `ai-competitor-keywords-prompt-${domain}`,
                duration: 10000, // Longer duration to allow user to decide
                action: {
                  label: "Use AI Tool",
                  onClick: () => resolve(true)
                },
                cancel: {
                  label: "Skip",
                  onClick: () => resolve(false)
                },
                onDismiss: () => resolve(false)
              }
            );
          });
          
          if (!userConsent) {
            toast.info(`Skipped AI keyword generation for competitor ${domain}.`);
            continue;
          }
          
          // User consented to use AI, show a loading toast
          toast.loading(`Using AI to generate keywords for competitor ${domain}...`, { id: `ai-competitor-generating-${domain}` });
          
          try {
            // Use AI to generate keywords for competitor
            keywords = await generateKeywordsWithAI(domain);
            
            if (keywords.length === 0) {
              toast.warning(`Failed to generate keywords for competitor ${domain}. Skipping.`);
              continue;
            }
            
            toast.success(`Generated ${keywords.length} keywords for competitor ${domain} using AI`, { id: `ai-competitor-success-${domain}` });
          } catch (aiError) {
            console.error(`Error generating keywords with AI for competitor ${domain}:`, aiError);
            toast.error(`AI keyword generation failed for competitor ${domain}: ${(aiError as Error).message}`);
            continue;
          }
        }
        
        if (keywords.length > 0) {
          competitorResults.push({ domain, keywords });
          toast.success(`Found ${keywords.length} keywords for ${domain}`);
        } else {
          console.warn(`No keywords found for ${domain}`);
          toast.warning(`No keywords found for competitor ${domain}`);
        }
      } catch (error) {
        console.error(`Error analyzing competitor ${domain}:`, error);
        toast.error(`Failed to analyze ${domain}: ${(error as Error).message}`);
      }
    }
    
    // If we have no competitor results, inform the user
    if (competitorResults.length === 0 && formattedCompetitorDomains.length > 0) {
      toast.error("Failed to analyze any competitors. Please check your competitor domains or API settings.");
    }
    
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
        position: kw.position, 
        rankingUrl: kw.rankingUrl, 
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
          
          existing.competitorRankings[domainName] = kw.position;
          existing.competitorUrls[domainName] = kw.rankingUrl;
        } else {
          // Add new keyword that main domain doesn't have
          keywordMap.set(kw.keyword, {
            keyword: kw.keyword,
            monthly_search: kw.monthly_search,
            competition: kw.competition,
            competition_index: kw.competition_index,
            cpc: kw.cpc,
            position: null, // Main domain doesn't rank for this
            rankingUrl: null,
            competitorRankings: {
              [domainName]: kw.position
            },
            competitorUrls: {
              [domainName]: kw.rankingUrl
            }
          });
        }
      });
    });
    
    const keywords = Array.from(keywordMap.values());
    toast.success(`Analysis complete: Found ${keywords.length} total keywords for comparison`);
    
    return {
      keywords: keywords,
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

// Function to generate keywords using AI (OpenAI API)
async function generateKeywordsWithAI(domain: string): Promise<KeywordData[]> {
  try {
    // Extract domain name without TLD for better context
    const domainName = domain.replace(/https?:\/\//i, '').replace(/www\./i, '').split('.')[0];

    // Import from apiConfig to access OPENAI_API_KEY
    const { OPENAI_API_KEY } = await import('./apiConfig');
    
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your-openai-api-key') {
      throw new Error("OpenAI API key is not configured");
    }
    
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
            content: 'You are an SEO expert who specializes in keyword research.'
          },
          {
            role: 'user',
            content: `Generate realistic keyword data for the domain "${domain}" which appears to be about "${domainName}".

Create realistic SEO keyword data including:
1. 20-30 keywords that would be relevant to this domain
2. For each keyword, include:
   - Monthly search volume (realistic numbers between 10-10000)
   - SEO competition score (0-100 scale)
   - Competition index (1-10 scale)
   - CPC in USD ($0.10-$20.00)
   - Position in search results (1-100, null if not ranking)
   - Ranking URL if position exists (use format: ${domain}/page-name)

Format the response as a JSON array exactly as follows:
[
  {
    "keyword": "example keyword",
    "monthly_search": 1500,
    "competition": 65,
    "competition_index": 7,
    "cpc": 3.50,
    "position": 12,
    "rankingUrl": "${domain}/example-page"
  },
  {
    "keyword": "another keyword",
    "monthly_search": 800,
    "competition": 45,
    "competition_index": 5,
    "cpc": 2.75,
    "position": null,
    "rankingUrl": null
  }
]`
          }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API returned status ${response.status}`);
    }
    
    const data = await response.json();
    const generatedKeywords = JSON.parse(data.choices[0].message.content);
    
    // Ensure the returned data is an array
    if (!Array.isArray(generatedKeywords)) {
      throw new Error("OpenAI did not return an array of keywords");
    }
    
    return generatedKeywords;
  } catch (error) {
    console.error("Error generating keywords with AI:", error);
    throw new Error(`AI keyword generation failed: ${(error as Error).message}`);
  }
}
