
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSystemHealth } from "@/components/system-health/useSystemHealth";
import { SystemHealthHeader } from "@/components/system-health/SystemHealthHeader";
import { SystemHealthGrid } from "@/components/system-health/SystemHealthGrid";
import { ModelTestDialog } from "@/components/system-health/ModelTestDialog";
import { Card, CardContent } from "@/components/ui/card";
import { ApiHealthCard } from "@/components/api-integration/ApiHealthCard";
import { useModelTesting } from "@/components/system-health/useModelTesting";

export const SystemHealthCard = () => {
  const { 
    apiStates,
    expanded,
    setExpanded,
    systemHealth,
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
  
  // Filter to only show active API states
  const filteredApiStates = Object.fromEntries(
    Object.entries(apiStates).filter(([key]) => 
      ["openai", "gemini", "pinecone", "dataForSeo"].includes(key)
    )
  );
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <ApiHealthCard />
        
        <div className="py-4">
          <SystemHealthHeader
            systemHealth={systemHealth}
            expanded={expanded}
            setExpanded={setExpanded}
          />
          
          {expanded && (
            <SystemHealthGrid
              apiStates={filteredApiStates}
              expanded={expanded}
              onRetry={retryApiConnection}
              onTestModels={handleTestModels}
              onOpenDocs={openDocsForApi}
            />
          )}
        </div>
        
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
