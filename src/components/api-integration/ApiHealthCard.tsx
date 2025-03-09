
import { Check, AlertCircle } from "lucide-react";
import { ApiDetails } from "@/types/apiIntegration";
import { useEffect, useState } from "react";
import useApiHealth from "@/hooks/useApiHealth";

export const ApiHealthCard = () => {
  const { apis, isLoading } = useApiHealth();
  const [configuredApis, setConfiguredApis] = useState<ApiDetails[]>([]);

  useEffect(() => {
    // Only show APIs that have credentials configured
    setConfiguredApis(apis.filter(api => api.isConfigured && api.apiKey));
  }, [apis]);

  if (isLoading || configuredApis.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4">
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
        </div>
      ))}
    </div>
  );
};
