
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSystemHealth } from "@/components/system-health/useSystemHealth";
import { SystemHealthHeader } from "@/components/system-health/SystemHealthHeader";
import { SystemHealthGrid } from "@/components/system-health/SystemHealthGrid";
import { ModelTestDialog } from "@/components/system-health/ModelTestDialog";
import { Card, CardContent } from "@/components/ui/card";
import { ApiHealthCard } from "@/components/api-integration/ApiHealthCard";

export const SystemHealthCard = () => {
  const { 
    apiStates,
    expanded,
    setExpanded,
    systemHealth,
    retryApiConnection,
    openDocsForApi
  } = useSystemHealth();
  
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testProvider, setTestProvider] = useState<"openai" | "gemini">("openai");
  
  // Filter to only show active API states
  const filteredApiStates = Object.entries(apiStates).reduce((acc, [key, value]) => {
    // Only include APIs that are configured or relevant to our app
    if (["openai", "gemini", "pinecone", "dataForSeo"].includes(key)) {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, any>);
  
  const handleTestModels = (provider: "openai" | "gemini") => {
    setTestProvider(provider);
    setTestDialogOpen(true);
  };
  
  const testModels = apiStates[testProvider]?.models || [];
  
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
          open={testDialogOpen}
          onOpenChange={setTestDialogOpen}
          models={testModels}
          onTestModel={() => {}}
          testModelStatus="idle"
          testResponse=""
        />
      </CardContent>
    </Card>
  );
};

export default SystemHealthCard;
