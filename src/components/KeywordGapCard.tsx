
// Note: Only modifying the export of the cache

// Create a cache to store keyword gaps
export const keywordGapsCache = {
  data: null as KeywordGap[] | null,
  domain: "",
  competitorDomains: [] as string[],
  keywordsLength: 0
};
