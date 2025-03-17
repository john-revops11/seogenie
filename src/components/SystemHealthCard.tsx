
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSystemHealth } from "@/components/system-health/useSystemHealth";
import { ModelTestDialog } from "@/components/system-health/ModelTestDialog";
import { Card, CardContent } from "@/components/ui/card";
import { useModelTesting } from "@/components/system-health/useModelTesting";
import { ApiStates } from "@/types/systemHealth";

export const SystemHealthCard = () => {
  const { 
    apiStates,
    expanded,
    setExpanded,
    retryApiConnection,
    openDocsForApi
  } = useSystemHealth();
  
  const {
    showModelDialog,
    setShowModelDialog,
    activeProvider,
    testModelStatus,
    testResponse,
    handleTestModels,
    handleTestModel
  } = useModelTesting();
  
  // Create a properly typed filtered version of apiStates
  const filteredApiStates: ApiStates = {
    pinecone: apiStates.pinecone,
    openai: apiStates.openai,
    gemini: apiStates.gemini,
    dataForSeo: apiStates.dataForSeo,
    googleAds: apiStates.googleAds,
    rapidApi: apiStates.rapidApi
  };
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <ModelTestDialog
          open={showModelDialog}
          onOpenChange={setShowModelDialog}
          models={apiStates[activeProvider]?.models || []}
          onTestModel={handleTestModel}
          testModelStatus={testModelStatus}
          testResponse={testResponse}
        />
      </CardContent>
    </Card>
  );
};

export default SystemHealthCard;
