
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface KeywordGapEmptyProps {
  error: string | null;
  onRefreshAnalysis: () => void;
}

export function KeywordGapEmpty({ error, onRefreshAnalysis }: KeywordGapEmptyProps) {
  return (
    <>
      {error ? (
        <Alert variant="destructive" className="bg-amber-50 text-amber-800 border-amber-200">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Analysis Issue</AlertTitle>
          <AlertDescription>
            {error}
            <div className="mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRefreshAnalysis}
                className="bg-white hover:bg-white/90"
              >
                Try Again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>No keyword gaps found. This could mean you're ranking well for most keywords in your niche!</p>
        </div>
      )}
    </>
  );
}

export default KeywordGapEmpty;
