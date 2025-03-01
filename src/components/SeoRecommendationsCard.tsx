
// Note: Only modifying the export of the cache

// Create a cache to store recommendations
export const recommendationsCache = {
  data: null as {
    onPage: SeoRecommendation[];
    technical: SeoRecommendation[];
    content: SeoRecommendation[];
  } | null,
  domain: "",
  keywordsLength: 0
};
