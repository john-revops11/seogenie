
import ContentGenerator from "@/components/ContentGenerator";
import { ContentEmptyState } from "@/components/content/ContentEmptyState";

interface ContentTabContentProps {
  analysisComplete: boolean;
  domain: string;
  allKeywords: string[];
  onGoToAnalysis: () => void;
}

export const ContentTabContent = ({
  analysisComplete,
  domain,
  allKeywords,
  onGoToAnalysis
}: ContentTabContentProps) => {
  if (!analysisComplete) {
    return <ContentEmptyState onGoToAnalysis={onGoToAnalysis} />;
  }

  return (
    <ContentGenerator 
      domain={domain} 
      selectedKeywords={allKeywords}
    />
  );
};
