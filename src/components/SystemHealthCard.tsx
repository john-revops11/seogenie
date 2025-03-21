
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSystemHealth } from "@/components/system-health/useSystemHealth";
import { ModelTestDialog } from "@/components/system-health/ModelTestDialog";
import { Card, CardContent } from "@/components/ui/card";
import { useModelTesting } from "@/components/system-health/useModelTesting";
import { ApiStates } from "@/types/systemHealth";
import { Search, BarChart2 } from "lucide-react";
import { SystemHealthHeader } from "@/components/system-health/SystemHealthHeader";
import { ApiCardDetail } from "@/components/system-health/ApiCardDetail";

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
  
  if (!expanded) {
    return (
      <Card className="overflow-hidden cursor-pointer" onClick={() => setExpanded(true)}>
        <CardContent className="p-0">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-2">
              <BarChart2 className="h-5 w-5 text-amber-500" />
              <h3 className="font-medium text-sm">SEO Tools Status</h3>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <SystemHealthHeader 
          systemHealth={apiStates.dataForSeo.status === "success" ? "good" : "warning"} 
          expanded={expanded} 
          setExpanded={setExpanded} 
        />
        
        <div className="px-4 pb-4 space-y-2">
          {Object.entries(filteredApiStates).map(([key, state]) => {
            const apiKey = key as keyof ApiStates;
            let testModelsHandler = undefined;
            
            // Only provide the test models handler for the appropriate providers
            if (apiKey === 'openai' || apiKey === 'gemini') {
              testModelsHandler = () => handleTestModels(apiKey as "openai" | "gemini");
            }
            
            return (
              <ApiCardDetail
                key={key}
                api={apiKey}
                state={state}
                expanded={expanded}
                onRetry={() => retryApiConnection(apiKey)}
                onTestModels={testModelsHandler}
                onOpenDocs={() => openDocsForApi(apiKey)}
              />
            );
          })}
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
