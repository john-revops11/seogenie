
export interface ResearchKeyword {
  keyword: string;
  volume: number;
  difficulty: number;
  cpc: number;
  recommendation: string;
  relatedKeywords: string[];
}

export interface KeywordResearchProps {
  domain: string;
  competitorDomains: string[];
  keywords: any[];
  onGenerateContent: (keyword: string, relatedKeywords: string[]) => void;
  onRunSeoStrategy?: () => void;
}
