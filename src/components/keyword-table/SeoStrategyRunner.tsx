
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Target } from "lucide-react";
import { toast } from "sonner";
import { runRevologySeoActions } from "@/services/keywords/revologySeoStrategy";
import { KeywordData } from "@/services/keywordService";

interface SeoStrategyRunnerProps {
  domain: string;
  competitorDomains: string[];
  keywords: KeywordData[];
  isLoading: boolean;
}

const SeoStrategyRunner = ({
  domain,
  competitorDomains,
  keywords,
  isLoading
}: SeoStrategyRunnerProps) => {
  const [isRunningSeoStrategy, setIsRunningSeoStrategy] = useState(false);

  const handleRunRevologySeoStrategy = async () => {
    if (!domain || competitorDomains.length === 0 || keywords.length === 0) {
      toast.error("Please ensure you have domain and competitor data first");
      return;
    }

    setIsRunningSeoStrategy(true);
    try {
      await runRevologySeoActions(domain, competitorDomains, keywords);
      toast.success("SEO strategy for Revology Analytics completed successfully");
    } catch (error) {
      console.error("Error running SEO strategy:", error);
      toast.error(`Failed to run SEO strategy: ${(error as Error).message}`);
    } finally {
      setIsRunningSeoStrategy(false);
    }
  };

  return (
    <Button 
      variant="danger"
      size="sm"
      className="transition-all whitespace-nowrap"
      onClick={handleRunRevologySeoStrategy}
      disabled={isLoading || isRunningSeoStrategy}
    >
      {isRunningSeoStrategy ? (
        <>
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          Running Strategy...
        </>
      ) : (
        <>
          <Target className="h-4 w-4 mr-1" />
          Run Revology SEO Strategy
        </>
      )}
    </Button>
  );
};

export default SeoStrategyRunner;
