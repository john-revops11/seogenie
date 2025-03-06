
import { DashboardContent } from "@/components/domain-analysis/DashboardContent";
import { AnalysisError } from "@/components/domain-analysis/AnalysisError";
import { DomainAnalysisForm } from "@/components/domain-analysis/DomainAnalysisForm";
import KeywordResearch from "@/components/KeywordResearch";

interface DashboardTabContentProps {
  mainDomain: string;
  competitorDomains: string[];
  isAnalyzing: boolean;
  progress: number;
  analysisComplete: boolean;
  keywordData: any[];
  analysisError: string | null;
  onMainDomainChange: (domain: string) => void;
  onAddCompetitorDomain: () => void;
  onRemoveCompetitorDomain: (index: number) => void;
  onUpdateCompetitorDomain: (index: number, value: string) => void;
  onAnalyze: () => void;
  onReset: () => void;
  onAddCompetitor: (competitor: string) => void;
  onRemoveCompetitor: (competitor: string) => void;
  onGenerateContentFromKeyword: (keyword: string, relatedKeywords: string[]) => void;
  onRunSeoStrategy: () => void;
}

export const DashboardTabContent = ({
  mainDomain,
  competitorDomains,
  isAnalyzing,
  progress,
  analysisComplete,
  keywordData,
  analysisError,
  onMainDomainChange,
  onAddCompetitorDomain,
  onRemoveCompetitorDomain,
  onUpdateCompetitorDomain,
  onAnalyze,
  onReset,
  onAddCompetitor,
  onRemoveCompetitor,
  onGenerateContentFromKeyword,
  onRunSeoStrategy
}: DashboardTabContentProps) => {
  // Filter out empty competitor domains
  const validCompetitorDomains = competitorDomains.filter(domain => domain && domain.trim() !== "");

  if (analysisError) {
    return (
      <div className="space-y-6">
        <AnalysisError errorMessage={analysisError} onReset={onReset} />
        
        <KeywordResearch 
          domain={mainDomain || "example.com"}
          competitorDomains={validCompetitorDomains}
          keywords={keywordData || []}
          onGenerateContent={onGenerateContentFromKeyword}
          onRunSeoStrategy={onRunSeoStrategy}
        />
      </div>
    );
  }

  if (!analysisComplete) {
    return (
      <div className="space-y-6">
        <DomainAnalysisForm 
          mainDomain={mainDomain}
          competitorDomains={competitorDomains}
          isAnalyzing={isAnalyzing}
          progress={progress}
          onMainDomainChange={onMainDomainChange}
          onAddCompetitorDomain={onAddCompetitorDomain}
          onRemoveCompetitorDomain={onRemoveCompetitorDomain}
          onUpdateCompetitorDomain={onUpdateCompetitorDomain}
          onAnalyze={onAnalyze}
        />
        
        <KeywordResearch 
          domain={mainDomain || "example.com"}
          competitorDomains={validCompetitorDomains}
          keywords={[]}
          onGenerateContent={onGenerateContentFromKeyword}
          onRunSeoStrategy={onRunSeoStrategy}
        />
      </div>
    );
  }

  return (
    <DashboardContent 
      domain={mainDomain}
      competitorDomains={validCompetitorDomains}
      keywords={keywordData}
      isAnalyzing={isAnalyzing}
      onAddCompetitor={onAddCompetitor}
      onRemoveCompetitor={onRemoveCompetitor}
      onGenerateContentFromKeyword={onGenerateContentFromKeyword}
      onRunSeoStrategy={onRunSeoStrategy}
    />
  );
};
