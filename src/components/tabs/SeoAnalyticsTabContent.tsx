
import React from "react";
import KeywordResearchTool from "@/components/keyword-research/KeywordResearchTool";
import TrafficAnalytics from "@/components/traffic-analytics/TrafficAnalytics";
import VisibilityScoreCard from "@/components/position-tracking/VisibilityScoreCard";
import RankingHistoryChart from "@/components/position-tracking/RankingHistoryChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RankingData } from "@/services/keywords/api/dataForSeo/positionTracking";

// Mock data for demonstration purposes
const mockHistoryData: Record<string, RankingData[]> = {
  "2023-06-01": [
    { 
      keyword: "seo tools", 
      position: 12, 
      url: "https://example.com/seo-tools",
      previousPosition: 15,
      change: 3,
      timestamp: "2023-06-01T12:00:00Z",
      hasSnippet: false,
      hasFeaturedSnippet: false,
      hasPaa: false,
      hasKnowledgePanel: false,
      hasLocalPack: false,
      hasVideo: false,
      hasImage: false,
      serp_features: []
    },
    { 
      keyword: "keyword research", 
      position: 8, 
      url: "https://example.com/keyword-research",
      previousPosition: 10,
      change: 2,
      timestamp: "2023-06-01T12:00:00Z",
      hasSnippet: true,
      hasFeaturedSnippet: false,
      hasPaa: true,
      hasKnowledgePanel: false,
      hasLocalPack: false,
      hasVideo: false,
      hasImage: true,
      serp_features: ["snippet", "people_also_ask", "images"]
    }
  ],
  "2023-07-01": [
    { 
      keyword: "seo tools", 
      position: 10, 
      url: "https://example.com/seo-tools",
      previousPosition: 12,
      change: 2,
      timestamp: "2023-07-01T12:00:00Z",
      hasSnippet: false,
      hasFeaturedSnippet: false,
      hasPaa: false,
      hasKnowledgePanel: false,
      hasLocalPack: false,
      hasVideo: false,
      hasImage: false,
      serp_features: []
    },
    { 
      keyword: "keyword research", 
      position: 7, 
      url: "https://example.com/keyword-research",
      previousPosition: 8,
      change: 1,
      timestamp: "2023-07-01T12:00:00Z",
      hasSnippet: true,
      hasFeaturedSnippet: false,
      hasPaa: true,
      hasKnowledgePanel: false,
      hasLocalPack: false,
      hasVideo: false,
      hasImage: true,
      serp_features: ["snippet", "people_also_ask", "images"]
    }
  ],
  "2023-08-01": [
    { 
      keyword: "seo tools", 
      position: 9, 
      url: "https://example.com/seo-tools",
      previousPosition: 10,
      change: 1,
      timestamp: "2023-08-01T12:00:00Z",
      hasSnippet: false,
      hasFeaturedSnippet: false,
      hasPaa: false,
      hasKnowledgePanel: false,
      hasLocalPack: false,
      hasVideo: false,
      hasImage: false,
      serp_features: []
    },
    { 
      keyword: "keyword research", 
      position: 6, 
      url: "https://example.com/keyword-research",
      previousPosition: 7,
      change: 1,
      timestamp: "2023-08-01T12:00:00Z",
      hasSnippet: true,
      hasFeaturedSnippet: false,
      hasPaa: true,
      hasKnowledgePanel: false,
      hasLocalPack: false,
      hasVideo: false,
      hasImage: true,
      serp_features: ["snippet", "people_also_ask", "images"]
    }
  ],
  "2023-09-01": [
    { 
      keyword: "seo tools", 
      position: 8, 
      url: "https://example.com/seo-tools",
      previousPosition: 9,
      change: 1,
      timestamp: "2023-09-01T12:00:00Z",
      hasSnippet: true,
      hasFeaturedSnippet: false,
      hasPaa: false,
      hasKnowledgePanel: false,
      hasLocalPack: false,
      hasVideo: false,
      hasImage: false,
      serp_features: ["snippet"]
    },
    { 
      keyword: "keyword research", 
      position: 5, 
      url: "https://example.com/keyword-research",
      previousPosition: 6,
      change: 1,
      timestamp: "2023-09-01T12:00:00Z",
      hasSnippet: true,
      hasFeaturedSnippet: false,
      hasPaa: true,
      hasKnowledgePanel: false,
      hasLocalPack: false,
      hasVideo: true,
      hasImage: true,
      serp_features: ["snippet", "people_also_ask", "video", "images"]
    }
  ],
  "2023-10-01": [
    { 
      keyword: "seo tools", 
      position: 7, 
      url: "https://example.com/seo-tools",
      previousPosition: 8,
      change: 1,
      timestamp: "2023-10-01T12:00:00Z",
      hasSnippet: true,
      hasFeaturedSnippet: false,
      hasPaa: false,
      hasKnowledgePanel: false,
      hasLocalPack: false,
      hasVideo: false,
      hasImage: false,
      serp_features: ["snippet"]
    },
    { 
      keyword: "keyword research", 
      position: 4, 
      url: "https://example.com/keyword-research",
      previousPosition: 5,
      change: 1,
      timestamp: "2023-10-01T12:00:00Z",
      hasSnippet: true,
      hasFeaturedSnippet: true,
      hasPaa: true,
      hasKnowledgePanel: false,
      hasLocalPack: false,
      hasVideo: true,
      hasImage: true,
      serp_features: ["featured_snippet", "people_also_ask", "video", "images"]
    }
  ],
  "2023-11-01": [
    { 
      keyword: "seo tools", 
      position: 5, 
      url: "https://example.com/seo-tools",
      previousPosition: 7,
      change: 2,
      timestamp: "2023-11-01T12:00:00Z",
      hasSnippet: true,
      hasFeaturedSnippet: false,
      hasPaa: true,
      hasKnowledgePanel: false,
      hasLocalPack: false,
      hasVideo: false,
      hasImage: true,
      serp_features: ["snippet", "people_also_ask", "images"]
    },
    { 
      keyword: "keyword research", 
      position: 3, 
      url: "https://example.com/keyword-research",
      previousPosition: 4,
      change: 1,
      timestamp: "2023-11-01T12:00:00Z",
      hasSnippet: true,
      hasFeaturedSnippet: true,
      hasPaa: true,
      hasKnowledgePanel: false,
      hasLocalPack: false,
      hasVideo: true,
      hasImage: true,
      serp_features: ["featured_snippet", "people_also_ask", "video", "images"]
    }
  ]
};

const SeoAnalyticsTabContent: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <VisibilityScoreCard 
          score={78} 
          lastUpdated="2023-11-15" 
          isLoading={false} 
        />
        <RankingHistoryChart 
          historyData={mockHistoryData} 
          isLoading={false} 
        />
      </div>
      
      <Tabs defaultValue="keyword-research" className="space-y-6">
        <TabsList>
          <TabsTrigger value="keyword-research">Keyword Research</TabsTrigger>
          <TabsTrigger value="traffic-analytics">Traffic Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="keyword-research" className="space-y-6">
          <KeywordResearchTool />
        </TabsContent>
        
        <TabsContent value="traffic-analytics" className="space-y-6">
          <TrafficAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SeoAnalyticsTabContent;
