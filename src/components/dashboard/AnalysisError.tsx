
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AnalysisErrorProps {
  errorMessage: string;
  onReset: () => void;
}

const AnalysisError = ({ errorMessage, onReset }: AnalysisErrorProps) => {
  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive">Analysis Error</CardTitle>
        <CardDescription>There was a problem analyzing the domains</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">{errorMessage}</p>
        <Button onClick={onReset} variant="outline">Try Again</Button>
      </CardContent>
    </Card>
  );
};

export default AnalysisError;
