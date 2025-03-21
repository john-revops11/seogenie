
import { ApiDetails } from "@/types/apiIntegration";
import { 
  setApiKey as setApiKeyConfig, 
  removeApiKey as removeApiKeyConfig,
  getApiKey as getConfigApiKey 
} from "@/services/keywords/apiConfig";
import { configurePinecone } from "@/services/vector/pineconeService";
import { testSemrushConnection } from "@/services/keywords/semrushApi";
import { toast } from "sonner";
import { broadcastApiChange } from "@/utils/apiIntegrationEvents";

// Load APIs from localStorage
export const loadApisFromStorage = (): ApiDetails[] => {
  try {
    const savedApis = localStorage.getItem('apiIntegrations');
    if (savedApis) {
      return JSON.parse(savedApis);
    }
  } catch (error) {
    console.error("Error loading saved API integrations:", error);
  }
  return [];
};

// Save APIs to localStorage
export const saveApisToStorage = (apis: ApiDetails[]) => {
  try {
    const apisToSave = apis.map(api => ({
      id: api.id,
      name: api.name,
      description: api.description,
      iconName: api.iconName,
      apiKey: api.apiKey,
      isConfigured: api.isConfigured,
      isActive: api.isActive
    }));
    
    localStorage.setItem('apiIntegrations', JSON.stringify(apisToSave));
  } catch (error) {
    console.error("Error saving API integrations:", error);
  }
};

// Add a new API
export const addApi = (name: string, apiKey: string, description: string): ApiDetails => {
  const newId = name.toLowerCase().replace(/\s+/g, '');
  
  const newApi: ApiDetails = {
    id: newId,
    name,
    description: description || "Custom API integration",
    iconName: "activity",
    apiKey,
    isConfigured: true,
    isActive: true
  };
  
  setApiKeyConfig(newId, apiKey);
  broadcastApiChange(newId, 'add');
  
  toast.success(`Added new API integration: ${name}`);
  
  return newApi;
};

// Update an API
export const updateApi = async (
  api: ApiDetails, 
  previousConfig?: ApiDetails
): Promise<void> => {
  const configChanged = previousConfig?.apiKey !== api.apiKey || 
                     previousConfig?.isActive !== api.isActive;
  
  if (api.id === "pinecone" && api.apiKey) {
    configurePinecone(api.apiKey);
  }
  
  if (api.apiKey) {
    setApiKeyConfig(api.id, api.apiKey);
    
    if (configChanged) {
      broadcastApiChange(api.id, 'update');
    }
    
    if (api.id === "semrush") {
      const isConnected = await testSemrushConnection();
      if (isConnected) {
        toast.success("SemRush API connection successful");
      } else {
        toast.error("SemRush API connection failed. Please check your API key.");
      }
    }
  } else if (previousConfig?.apiKey) {
    removeApiKeyConfig(api.id);
    broadcastApiChange(api.id, 'remove');
  }
  
  toast.success(`Updated ${api.name} API configuration`);
};

// Remove an API
export const removeApi = (apiId: string, apis: ApiDetails[]): ApiDetails[] => {
  const isBuiltIn = ["pinecone", "openai", "dataforseo", "googleads", "rapidapi", "semrush"].includes(apiId);
  
  let updatedApis: ApiDetails[];
  
  if (isBuiltIn) {
    updatedApis = apis.map(api => 
      api.id === apiId ? { ...api, isConfigured: false, apiKey: undefined, isActive: false } : api
    );
    removeApiKeyConfig(apiId);
    broadcastApiChange(apiId, 'remove');
    toast.success(`Removed API key for ${apis.find(api => api.id === apiId)?.name}`);
  } else {
    updatedApis = apis.filter(api => api.id !== apiId);
    removeApiKeyConfig(apiId);
    broadcastApiChange(apiId, 'remove');
    toast.success(`Removed custom API integration`);
  }
  
  return updatedApis;
};

// Export function that gets the API key for use in other parts of the app
export const getApiKey = (service: string): string => {
  return getConfigApiKey(service);
};
