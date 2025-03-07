
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ApiConfigFormProps {
  apiId: string;
  apiName: string;
  initialApiKey: string;
  isTesting: boolean;
  testResult: string;
  onApiKeyChange: (value: string) => void;
  onTest?: () => void;
}

export const ApiConfigForm: React.FC<ApiConfigFormProps> = ({
  apiId,
  apiName,
  initialApiKey,
  isTesting,
  testResult,
  onApiKeyChange,
  onTest
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="apiKey">API Key</Label>
        <Input
          id="apiKey"
          type="password"
          placeholder="Enter your API key"
          value={initialApiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Your API key is stored locally and never shared.
        </p>
      </div>
      
      {apiId === "semrush" && onTest && (
        <Button 
          variant="outline" 
          onClick={onTest}
          disabled={isTesting || !initialApiKey.trim()}
          className="w-full mt-2"
        >
          {isTesting ? "Testing..." : "Test Connection"}
        </Button>
      )}
      
      {testResult && (
        <Alert variant={testResult.includes("successful") ? "default" : "destructive"}>
          <AlertDescription>{testResult}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};
