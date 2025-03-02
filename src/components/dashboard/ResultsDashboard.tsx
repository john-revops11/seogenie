
import KeywordTable from "@/components/KeywordTable";
import KeywordGapCard from "@/components/KeywordGapCard";
import SeoRecommendationsCard from "@/components/SeoRecommendationsCard";

interface ResultsDashboardProps {
  domain: string;
  competitorDomains: string[];
  keywordData: any[];
  isAnalyzing: boolean;
  onAddCompetitor: (competitor: string) => void;
}

const ResultsDashboard = ({
  domain,
  competitorDomains,
  keywordData,
  isAnalyzing,
  onAddCompetitor
}: ResultsDashboardProps) => {
  return (
    <div className="space-y-6 animate-slide-up">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <div className="md:col-span-2 lg:col-span-2">
          <KeywordTable 
            domain={domain} 
            competitorDomains={competitorDomains} 
            keywords={keywordData}
            isLoading={isAnalyzing}
            onAddCompetitor={onAddCompetitor}
          />
        </div>
        
        <div className="lg:col-span-1">
          <KeywordGapCard 
            domain={domain} 
            competitorDomains={competitorDomains} 
            keywords={keywordData}
            isLoading={isAnalyzing}
          />
        </div>
        
        <div className="lg:col-span-1">
          <SeoRecommendationsCard 
            domain={domain} 
            keywords={keywordData}
            isLoading={isAnalyzing}
          />
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;
