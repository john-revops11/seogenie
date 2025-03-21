import { SeoRecommendation } from './types';

// Helper function to convert from old format to new SeoRecommendation format
export function convertToSeoRecommendation(oldRec: {
  type: string;
  recommendation: string;
  priority: string;
  details: string;
  implementationDifficulty: string;
}): SeoRecommendation {
  return {
    title: oldRec.recommendation,
    description: oldRec.details,
    impact: oldRec.priority as 'high' | 'medium' | 'low',
    difficulty: oldRec.implementationDifficulty as 'easy' | 'medium' | 'hard',
    priority: oldRec.priority as 'high' | 'medium' | 'low',
    implementation: oldRec.details,
    category: oldRec.type,
    // Keep the old properties for backward compatibility
    type: oldRec.type,
    recommendation: oldRec.recommendation,
    details: oldRec.details,
    implementationDifficulty: oldRec.implementationDifficulty as 'easy' | 'medium' | 'hard'
  };
}

// Existing function
function getGenericTechnicalRecommendations(): SeoRecommendation[] {
  return [
    convertToSeoRecommendation({
      type: "technical",
      recommendation: "Implement XML sitemap and submit to Google Search Console",
      priority: "high",
      details: "Create and maintain an up-to-date sitemap.xml file to help search engines crawl and index your content efficiently.",
      implementationDifficulty: "easy"
    }),
    convertToSeoRecommendation({
      type: "technical",
      recommendation: "Improve page loading speed",
      priority: "high",
      details: "Compress images, leverage browser caching, and minimize CSS/JavaScript. Aim for load time under 2 seconds.",
      implementationDifficulty: "medium"
    }),
    convertToSeoRecommendation({
      type: "technical",
      recommendation: "Ensure mobile responsiveness",
      priority: "high",
      details: "Test all pages on multiple devices and fix any mobile usability issues. Google primarily uses mobile-first indexing.",
      implementationDifficulty: "medium"
    }),
    convertToSeoRecommendation({
      type: "technical",
      recommendation: "Fix broken links and implement proper redirects",
      priority: "medium",
      details: "Run a site audit to identify and fix broken links. Use 301 redirects for permanently moved content.",
      implementationDifficulty: "easy"
    }),
    convertToSeoRecommendation({
      type: "technical",
      recommendation: "Implement schema markup",
      priority: "medium",
      details: "Add relevant structured data to help search engines understand your content better. Use appropriate schema types for your content.",
      implementationDifficulty: "medium"
    }),
    convertToSeoRecommendation({
      type: "technical",
      recommendation: "Optimize for Core Web Vitals",
      priority: "high",
      details: "Improve LCP, FID, and CLS metrics to enhance user experience and search rankings. Monitor in Google Search Console.",
      implementationDifficulty: "hard"
    })
  ];
}

// Now let's add the generateSeoRecommendations function that's missing
export async function generateSeoRecommendations(
  domain: string,
  keywords: any[]
): Promise<{
  technical: SeoRecommendation[];
  onPage: SeoRecommendation[];
  offPage: SeoRecommendation[];
  content: SeoRecommendation[];
  summary: SeoRecommendation[];
}> {
  // For now, return some generic recommendations
  // This would typically call an API or use AI to generate customized recommendations
  
  const technical = getGenericTechnicalRecommendations();
  
  // Generate some basic content recommendations
  const content: SeoRecommendation[] = [
    convertToSeoRecommendation({
      type: "content",
      recommendation: "Create comprehensive, authoritative content",
      priority: "high",
      details: "Focus on in-depth articles that thoroughly cover topics relevant to your industry. Aim for at least 1,500 words for important pages.",
      implementationDifficulty: "medium"
    }),
    convertToSeoRecommendation({
      type: "content",
      recommendation: "Implement content clustering",
      priority: "medium",
      details: "Group related content together with internal linking to establish topical authority in your niche.",
      implementationDifficulty: "medium"
    })
  ];
  
  // Generate some on-page recommendations
  const onPage: SeoRecommendation[] = [
    convertToSeoRecommendation({
      type: "onPage",
      recommendation: "Optimize meta titles and descriptions",
      priority: "high",
      details: "Create compelling, keyword-rich meta titles (50-60 characters) and descriptions (150-160 characters) for all pages.",
      implementationDifficulty: "easy"
    }),
    convertToSeoRecommendation({
      type: "onPage",
      recommendation: "Improve heading structure",
      priority: "medium",
      details: "Use a single H1 tag and organize content with H2, H3, etc. Include keywords naturally in headings.",
      implementationDifficulty: "easy"
    })
  ];
  
  // Generate some off-page recommendations
  const offPage: SeoRecommendation[] = [
    convertToSeoRecommendation({
      type: "offPage",
      recommendation: "Build high-quality backlinks",
      priority: "high",
      details: "Focus on getting links from authoritative sites in your industry through guest posting, outreach, and creating linkable assets.",
      implementationDifficulty: "hard"
    }),
    convertToSeoRecommendation({
      type: "offPage",
      recommendation: "Develop a social media strategy",
      priority: "medium",
      details: "Build a presence on platforms where your audience is active. Share content consistently and engage with followers.",
      implementationDifficulty: "medium"
    })
  ];
  
  // Generate a summary action plan
  const summary: SeoRecommendation[] = [
    convertToSeoRecommendation({
      type: "summary",
      recommendation: "Priority 1: Technical SEO Foundation",
      priority: "high",
      details: `Start by fixing technical issues for ${domain} including XML sitemap, page speed, and mobile optimization.`,
      implementationDifficulty: "medium"
    }),
    convertToSeoRecommendation({
      type: "summary",
      recommendation: "Priority 2: Content Optimization",
      priority: "high",
      details: "Create comprehensive content around your main keywords and implement proper internal linking.",
      implementationDifficulty: "medium"
    }),
    convertToSeoRecommendation({
      type: "summary",
      recommendation: "Priority 3: Off-page Authority Building",
      priority: "medium",
      details: "Focus on quality link building and social signals to boost domain authority.",
      implementationDifficulty: "hard"
    })
  ];
  
  return {
    technical,
    onPage,
    offPage,
    content,
    summary
  };
}
