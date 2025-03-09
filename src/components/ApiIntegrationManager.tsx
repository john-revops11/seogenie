
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { ApiDetails } from "@/types/apiIntegration";
import { ApiCard } from "./api-integration/ApiCard";
import { AddApiDialog } from "./api-integration/AddApiDialog";
import { getDefaultApiConfigs } from "@/data/defaultApiConfigs";
import { isPineconeConfigured } from "@/services/vector/pineconeService";
import { 
  loadApisFromStorage, 
  saveApisToStorage, 
  addApi, 
  updateApi, 
  removeApi 
} from "@/services/apiIntegrationService";
import { setApiKey } from "@/services/keywords/apiConfig";
import { broadcastApiChange } from "@/utils/apiIntegrationEvents";

// Re-export the API change event for backward compatibility
export { API_CHANGE_EVENT, broadcastApiChange } from "@/utils/apiIntegrationEvents";

const ApiIntegrationManager = () => {
  const [apis, setApis] = useState<ApiDetails[]>(getDefaultApiConfigs());
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  useEffect(() => {
    const initialSetup = async () => {
      // Check if Pinecone is configured
      const pineconeConfigured = isPineconeConfigured();
      
      // Update DataForSEO configuration
      const dataforseoKey = "armin@revologyanalytics.com:ab4016dc9302b8cf"; // Default credentials
      
      setApis(prev => prev.map(api => {
        if (api.id === "pinecone") {
          return { 
            ...api, 
            isConfigured: pineconeConfigured,
            apiKey: pineconeConfigured ? "pcsk_2JMBqy_NGwjS5UqWkqAWDN6BGuW73KRJ9Hgd6G6T91LPpzsgkUMwchzzpXEQoFn7A1g797" : undefined,
            isActive: pineconeConfigured
          };
        }
        
        if (api.id === "dataforseo") {
          return {
            ...api,
            apiKey: dataforseoKey,
            isConfigured: true,
            isActive: true
          };
        }
        
        return api;
      }));
      
      // Load saved APIs from localStorage
      const savedApis = loadApisFromStorage();
      if (savedApis.length > 0) {
        setApis(prev => prev.map(api => {
          const savedApi = savedApis.find(a => a.id === api.id);
          return savedApi ? {...api, ...savedApi} : api;
        }));
      }
    };
    
    initialSetup();
  }, []);
  
  useEffect(() => {
    // Save APIs to localStorage whenever they change
    saveApisToStorage(apis);
    
    // Set API keys in the API config service
    apis.forEach(api => {
      if (api.isConfigured && api.apiKey) {
        setApiKey(api.id, api.apiKey);
      }
    });
  }, [apis]);
  
  const handleAddApi = (name: string, key: string, description: string) => {
    if (!name.trim() || !key.trim()) {
      return;
    }
    
    const newId = name.toLowerCase().replace(/\s+/g, '');
    
    if (apis.some(api => api.id === newId)) {
      return;
    }
    
    const newApi = addApi(name, key, description);
    setApis([...apis, newApi]);
    setShowAddDialog(false);
  };
  
  const handleUpdateApi = async (updatedApi: ApiDetails) => {
    const previousConfig = apis.find(api => api.id === updatedApi.id);
    
    setApis(prev => prev.map(api => 
      api.id === updatedApi.id ? updatedApi : api
    ));
    
    await updateApi(updatedApi, previousConfig);
  };
  
  const handleRemoveApi = (apiId: string) => {
    const updatedApis = removeApi(apiId, apis);
    setApis(updatedApis);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base">API Integrations</Label>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Add Custom API
            </Button>
          </DialogTrigger>
          <AddApiDialog 
            onAdd={handleAddApi}
            onClose={() => setShowAddDialog(false)}
          />
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {apis.map((api) => (
          <ApiCard 
            key={api.id}
            api={api}
            onUpdateApi={handleUpdateApi}
            onRemoveApi={handleRemoveApi}
          />
        ))}
      </div>
    </div>
  );
};

export default ApiIntegrationManager;
