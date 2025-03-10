
import { KeywordGapCard } from "@/components/KeywordGapCard";
import { SeoRecommendationsCard } from "@/components/SeoRecommendationsCard";
import KeywordTable from "@/components/KeywordTable";
import KeywordResearch from "@/components/KeywordResearch";

interface DashboardContentProps {
  domain: string;
  competitorDomains: string[];
  keywords: any[];
  isAnalyzing: boolean;
  onAddCompetitor: (competitor: string) => void;
  onRemoveCompetitor: (competitor: string) => void;
  onGenerateContentFromKeyword: (keyword: string, relatedKeywords: string[]) => void;
  onRunSeoStrategy: () => void;
}

export const DashboardContent = ({
  domain,
  competitorDomains,
  keywords,
  isAnalyzing,
  onAddCompetitor,
  onRemoveCompetitor,
  onGenerateContentFromKeyword,
  onRunSeoStrategy
}: DashboardContentProps) => {
  return (
    <div className="space-y-6 animate-slide-up">
      <div className="grid gap-6">
        <div>
          <KeywordTable 
            domain={domain} 
            competitorDomains={competitorDomains} 
            keywords={keywords || []}
            isLoading={isAnalyzing}
            onAddCompetitor={onAddCompetitor}
            onRemoveCompetitor={onRemoveCompetitor}
          />
        </div>
        
        <div>
          <KeywordGapCard 
            domain={domain} 
            competitorDomains={competitorDomains} 
            keywords={keywords || []}
            isLoading={isAnalyzing}
          />
        </div>
        
        <div>
          <SeoRecommendationsCard 
            domain={domain} 
            keywords={keywords || []}
            isLoading={isAnalyzing}
          />
        </div>
      </div>
      
      <KeywordResearch 
        domain={domain}
        competitorDomains={competitorDomains}
        keywords={keywords || []}
        onGenerateContent={onGenerateContentFromKeyword}
        onRunSeoStrategy={onRunSeoStrategy}
      />
    </div>
  );
};
