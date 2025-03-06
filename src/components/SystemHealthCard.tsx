
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ModelTestDialog } from "./system-health/ModelTestDialog";
import { SystemHealthHeader } from "./system-health/SystemHealthHeader";
import { SystemHealthGrid } from "./system-health/SystemHealthGrid";
import { useSystemHealth } from "./system-health/useSystemHealth";
import { useModelTesting } from "./system-health/useModelTesting";

const SystemHealthCard = () => {
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

  return (
    <Card className={cn(
      "transition-all duration-300", 
      expanded ? "w-full" : "w-full"
    )}>
      <CardContent className="py-4">
        <SystemHealthHeader
          healthStatus={systemHealth}
          expanded={expanded}
          onToggleExpand={() => setExpanded(!expanded)}
        />
        
        <SystemHealthGrid
          apiStates={apiStates}
          expanded={expanded}
          onRetry={retryApiConnection}
          onTestModels={handleTestModels}
          onOpenDocs={openDocsForApi}
        />

        <ModelTestDialog
          open={showModelDialog}
          onOpenChange={setShowModelDialog}
          models={apiStates[activeProvider].models}
          onTestModel={handleTestModel}
          testModelStatus={testModelStatus}
          testResponse={testResponse}
        />
      </CardContent>
    </Card>
  );
};

export default SystemHealthCard;
