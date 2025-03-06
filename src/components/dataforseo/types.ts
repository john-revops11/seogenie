
export interface SerpResult {
  keyword: string;
  position: number | null;
  url: string | null;
  title: string | null;
  snippet: string | null;
  total_results: number;
}

export interface VolumeResult {
  keyword: string;
  search_volume: number;
  cpc: number;
  competition: number;
}

export interface TrafficResult {
  organic_traffic: number;
  paid_traffic: number;
  total_traffic: number;
}

export interface CompetitorResult {
  domain: string;
  score: number;
  common_keywords: number;
}

export interface DataForSEOAnalysisResult {
  serp: {
    success: boolean;
    results: SerpResult[];
    error?: string;
  };
  volume: {
    success: boolean;
    results: VolumeResult[];
    error?: string;
  };
  traffic: {
    success: boolean;
    results: TrafficResult;
    error?: string;
  };
  competitors: {
    success: boolean;
    results: CompetitorResult[];
    error?: string;
  };
}
