
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, ChevronRight } from "lucide-react";

interface ContentEmptyStateProps {
  onGoToAnalysis: () => void;
}

export const ContentEmptyState = ({ onGoToAnalysis }: ContentEmptyStateProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Generation</CardTitle>
        <CardDescription>Run a keyword analysis first to get content recommendations</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-10">
        <div className="text-center">
          <Zap className="w-12 h-12 mx-auto mb-4 text-revology opacity-50" />
          <h3 className="text-lg font-medium">No keyword data available</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Please complete a keyword analysis first to enable AI-driven content generation
          </p>
          <Button 
            onClick={onGoToAnalysis}
            className="mt-6 bg-revology hover:bg-revology-dark"
          >
            Go to Analysis <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
