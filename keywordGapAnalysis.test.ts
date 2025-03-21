import { fetchKeywordData, fetchSERPData, fetchCompetitorAnalysis, testDataForSEOConnection } from '../dataforseoApi';
import { setApiKey, clearAllApiKeys } from '@/services/api/apiConfig';
import { generateContent } from '@/services/content/contentGenerator';
import { enhanceContent } from '@/services/content/contentEnhancer';

describe('Keyword Gap Analysis and Content Generation', () => {
  beforeAll(() => {
    // Set up test credentials
    setApiKey('dataforseo_login', 'test@example.com');
    setApiKey('dataforseo_password', 'testPassword123!');
  });

  afterAll(() => {
    // Clean up test credentials
    clearAllApiKeys();
  });

  describe('Keyword Gap Analysis', () => {
    it('should analyze keyword gaps between competitors', async () => {
      const targetDomain = 'example.com';
      const competitorDomain = 'competitor.com';
      
      // Fetch keyword data for both domains
      const targetKeywords = await fetchKeywordData(targetDomain);
      const competitorKeywords = await fetchKeywordData(competitorDomain);

      // Identify keyword gaps
      const targetKeywordSet = new Set(targetKeywords.map((k: any) => k.keyword));
      const competitorKeywordSet = new Set(competitorKeywords.map((k: any) => k.keyword));
      
      // Find keywords that competitor ranks for but target doesn't
      const keywordGaps = Array.from(competitorKeywordSet).filter(
        keyword => !targetKeywordSet.has(keyword)
      );

      expect(Array.isArray(keywordGaps)).toBe(true);
      expect(keywordGaps.length).toBeGreaterThan(0);
    });

    it('should analyze SERP positions for target keywords', async () => {
      const keyword = 'test keyword';
      const serpData = await fetchSERPData(keyword);

      expect(Array.isArray(serpData)).toBe(true);
      if (serpData.length > 0) {
        expect(serpData[0]).toHaveProperty('position');
        expect(serpData[0]).toHaveProperty('title');
        expect(serpData[0]).toHaveProperty('url');
      }
    });
  });

  describe('Content Generation', () => {
    it('should generate content based on keyword data', async () => {
      const keyword = 'test keyword';
      const keywordData = await fetchKeywordData(keyword);
      
      const content = await generateContent({
        keyword,
        searchVolume: keywordData.searchVolume,
        competition: keywordData.competition,
        cpc: keywordData.cpc,
        serpInfo: keywordData.serpInfo
      });

      expect(content).toHaveProperty('title');
      expect(content).toHaveProperty('content');
      expect(content).toHaveProperty('metaDescription');
      expect(content.content.length).toBeGreaterThan(500);
    });

    it('should enhance content with RAG', async () => {
      const keyword = 'test keyword';
      const keywordData = await fetchKeywordData(keyword);
      
      const content = await generateContent({
        keyword,
        searchVolume: keywordData.searchVolume,
        competition: keywordData.competition,
        cpc: keywordData.cpc,
        serpInfo: keywordData.serpInfo
      });

      const enhancedContent = await enhanceContent({
        content: content.content,
        keyword,
        serpInfo: keywordData.serpInfo
      });

      expect(enhancedContent).toHaveProperty('content');
      expect(enhancedContent.content.length).toBeGreaterThan(content.content.length);
      expect(enhancedContent).toHaveProperty('enhancements');
    });

    it('should generate content with proper keyword density', async () => {
      const keyword = 'test keyword';
      const keywordData = await fetchKeywordData(keyword);
      
      const content = await generateContent({
        keyword,
        searchVolume: keywordData.searchVolume,
        competition: keywordData.competition,
        cpc: keywordData.cpc,
        serpInfo: keywordData.serpInfo
      });

      // Calculate keyword density
      const words = content.content.toLowerCase().split(/\s+/);
      const keywordCount = words.filter(word => word === keyword.toLowerCase()).length;
      const density = (keywordCount / words.length) * 100;

      // Keyword density should be between 1% and 3%
      expect(density).toBeGreaterThanOrEqual(1);
      expect(density).toBeLessThanOrEqual(3);
    });
  });

  describe('Integration Tests', () => {
    it('should perform complete keyword analysis and content generation workflow', async () => {
      const targetDomain = 'example.com';
      const competitorDomain = 'competitor.com';
      
      // 1. Fetch competitor analysis
      const competitors = await fetchCompetitorAnalysis(targetDomain);
      expect(Array.isArray(competitors)).toBe(true);

      // 2. Analyze top competitor
      if (competitors.length > 0) {
        const topCompetitor = competitors[0];
        const competitorKeywords = await fetchKeywordData(topCompetitor.domain);
        
        // 3. Generate content for a gap keyword
        if (competitorKeywords.length > 0) {
          const gapKeyword = competitorKeywords[0];
          const content = await generateContent({
            keyword: gapKeyword.keyword,
            searchVolume: gapKeyword.searchVolume,
            competition: gapKeyword.competition,
            cpc: gapKeyword.cpc,
            serpInfo: gapKeyword.serpInfo
          });

          // 4. Enhance content
          const enhancedContent = await enhanceContent({
            content: content.content,
            keyword: gapKeyword.keyword,
            serpInfo: gapKeyword.serpInfo
          });

          expect(enhancedContent).toHaveProperty('content');
          expect(enhancedContent).toHaveProperty('enhancements');
        }
      }
    });
  });
});
