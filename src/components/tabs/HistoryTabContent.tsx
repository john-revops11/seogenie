
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import ContentHistory from "@/components/content-generator/ContentHistory";
import { ContentEmptyState } from "@/components/content/ContentEmptyState";

interface HistoryTabContentProps {
  analysisComplete: boolean;
  onGoToAnalysis: () => void;
}

export const HistoryTabContent = ({ analysisComplete, onGoToAnalysis }: HistoryTabContentProps) => {
  if (!analysisComplete) {
    return <ContentEmptyState onGoToAnalysis={onGoToAnalysis} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content History</CardTitle>
        <CardDescription>View your previously generated content</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-4">
          <ContentHistory />
        </div>
      </CardContent>
    </Card>
  );
};
