
import { Check, AlertCircle } from "lucide-react";
import { ApiDetails } from "@/types/apiIntegration";
import { useEffect, useState } from "react";
import useApiHealth from "@/hooks/useApiHealth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const ApiHealthCard = () => {
  const { apis, isLoading, testConnection } = useApiHealth();
  const [configuredApis, setConfiguredApis] = useState<ApiDetails[]>([]);

  useEffect(() => {
    // Only show APIs that have credentials configured and are relevant to our app
    setConfiguredApis(apis.filter(api => 
      api.isConfigured && 
      api.apiKey && 
      ["openai", "gemini", "pinecone", "dataforseo"].includes(api.id)
    ));
  }, [apis]);

  const handleTestConnection = async (apiId: string) => {
    try {
      await testConnection(apiId);
      toast.success(`${apiId} connection tested successfully`);
    } catch (error) {
      toast.error(`Failed to test ${apiId} connection: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  if (isLoading || configuredApis.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 px-4 pt-4">
      {configuredApis.map((api) => (
        <div 
          key={api.id}
          className="flex items-center gap-2 px-3 py-1.5 border rounded-md bg-card shadow-sm min-w-fit"
        >
          <div className={`size-2 rounded-full ${api.isActive ? 'bg-green-500' : 'bg-amber-500'}`} />
          <span className="text-sm font-medium">{api.name}</span>
          {api.isActive ? 
            <Check className="h-3.5 w-3.5 text-green-500" /> : 
            <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
          }
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs h-6 ml-1"
            onClick={() => handleTestConnection(api.id)}
          >
            Test
          </Button>
        </div>
      ))}
    </div>
  );
};
