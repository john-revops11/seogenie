
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
