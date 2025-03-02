
import { Button } from "@/components/ui/button";
import { Loader2, Target } from "lucide-react";

interface SeoStrategyButtonProps {
  isRunningSeoStrategy: boolean;
  onRunSeoStrategy: () => void;
}

const SeoStrategyButton = ({ isRunningSeoStrategy, onRunSeoStrategy }: SeoStrategyButtonProps) => {
  return (
    <Button 
      variant="danger" 
      size="sm"
      onClick={onRunSeoStrategy}
      disabled={isRunningSeoStrategy}
      className="whitespace-nowrap"
    >
      {isRunningSeoStrategy ? (
        <>
          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
          Running Strategy...
        </>
      ) : (
        <>
          <Target className="w-4 h-4 mr-1" /> 
          Run SEO Strategy for Revology
        </>
      )}
    </Button>
  );
};

export default SeoStrategyButton;
