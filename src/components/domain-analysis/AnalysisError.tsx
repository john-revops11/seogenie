
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface AnalysisErrorProps {
  errorMessage: string;
  onReset: () => void;
}

export const AnalysisError = ({ errorMessage, onReset }: AnalysisErrorProps) => {
  // Determine if we should show troubleshooting tips based on error message
  const showTroubleshootingTips = 
    errorMessage.includes('404') || 
    errorMessage.includes('API') || 
    errorMessage.includes('credentials') ||
    errorMessage.includes('domain has no') ||
    errorMessage.includes('not have any keywords');
  
  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Analysis Error
        </CardTitle>
        <CardDescription>There was a problem analyzing the domains</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">{errorMessage}</p>
        
        {showTroubleshootingTips && (
          <div className="bg-muted/50 p-3 rounded-md text-sm space-y-2">
            <h4 className="font-medium">Troubleshooting Tips:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              {(errorMessage.includes('404') || errorMessage.includes('not have any keywords') || errorMessage.includes('domain has no')) && (
                <>
                  <li>Try using a more established domain with better search visibility</li>
                  <li>Use domains that run Google Ads campaigns for better data availability</li>
                  <li>Double-check the domain spelling</li>
                  <li>Remove "www." or any subdomain and try again</li>
                  <li>Popular domains like facebook.com, google.com, or nytimes.com should work</li>
                </>
              )}
              {errorMessage.includes('credentials') && (
                <li>Check your DataForSEO API credentials in the Settings tab</li>
              )}
              {errorMessage.includes('rate limit') && (
                <li>Wait a few minutes before trying again</li>
              )}
              <li>Try analyzing a different domain as a test</li>
            </ul>
          </div>
        )}
        
        <Button 
          onClick={onReset} 
          variant="outline" 
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </CardContent>
    </Card>
  );
};
