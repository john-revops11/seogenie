
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  Search, 
  Zap, 
  Plus, 
  X, 
  Activity, 
  Database, 
  MessageSquareText,
  ExternalLink,
  Edit,
  Trash,
  Eye,
  EyeOff
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { configurePinecone, isPineconeConfigured } from "@/services/vector/pineconeService";

interface ApiDetails {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  apiKey?: string;
  isConfigured: boolean;
  isActive: boolean;
}

const ApiIntegrationManager = () => {
  const [apis, setApis] = useState<ApiDetails[]>([
    {
      id: "pinecone",
      name: "Pinecone",
      description: "Vector database for semantic search",
      icon: <Database className="h-5 w-5 text-blue-600" />,
      isConfigured: false,
      isActive: false
    },
    {
      id: "openai",
      name: "OpenAI",
      description: "AI models for content generation",
      icon: <MessageSquareText className="h-5 w-5 text-green-600" />,
      apiKey: "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",
      isConfigured: true,
      isActive: true
    },
    {
      id: "dataforseo",
      name: "DataForSEO",
      description: "Keyword research API",
      icon: <Search className="h-5 w-5 text-amber-600" />,
      apiKey: "john@revologyanalytics.com:c5a4c248785ced68",
      isConfigured: true,
      isActive: false
    },
    {
      id: "googleads",
      name: "Google Ads",
      description: "Keyword and ad performance data",
      icon: <Zap className="h-5 w-5 text-red-600" />,
      isConfigured: false,
      isActive: false
    },
    {
      id: "rapidapi",
      name: "RapidAPI",
      description: "API marketplace for keyword tools",
      icon: <ExternalLink className="h-5 w-5 text-purple-600" />,
      apiKey: "6549be50bbmsh1d48a68f7367e70p18d2c2jsnacb70e5f1571",
      isConfigured: true,
      isActive: false
    }
  ]);
  
  const [selectedApi, setSelectedApi] = useState<ApiDetails | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newApiName, setNewApiName] = useState("");
  const [newApiKey, setNewApiKey] = useState("");
  const [newApiDescription, setNewApiDescription] = useState("");
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    // Check if Pinecone is configured
    const pineconeConfigured = isPineconeConfigured();
    
    setApis(prev => prev.map(api => 
      api.id === "pinecone" 
        ? { 
            ...api, 
            isConfigured: pineconeConfigured,
            apiKey: pineconeConfigured ? "pcsk_2JMBqy_NGwjS5UqWkqAWDN6BGuW73KRJ9Hgd6G6T91LPpzsgkUMwchzzpXEQoFn7A1g797" : undefined,
            isActive: pineconeConfigured
          } 
        : api
    ));
    
    // Load APIs from localStorage if available
    try {
      const savedApis = localStorage.getItem('apiIntegrations');
      if (savedApis) {
        const parsedApis = JSON.parse(savedApis);
        setApis(prev => prev.map(api => {
          const savedApi = parsedApis.find((a: ApiDetails) => a.id === api.id);
          return savedApi ? {...api, ...savedApi} : api;
        }));
      }
    } catch (error) {
      console.error("Error loading saved API integrations:", error);
    }
  }, []);
  
  useEffect(() => {
    // Save APIs to localStorage when they change
    try {
      localStorage.setItem('apiIntegrations', JSON.stringify(apis));
    } catch (error) {
      console.error("Error saving API integrations:", error);
    }
  }, [apis]);
  
  const handleAddApi = () => {
    if (!newApiName.trim() || !newApiKey.trim()) {
      toast.error("Please provide both API name and key");
      return;
    }
    
    const newId = newApiName.toLowerCase().replace(/\s+/g, '');
    
    // Check if API with this ID already exists
    if (apis.some(api => api.id === newId)) {
      toast.error("An API with this name already exists");
      return;
    }
    
    const newApi: ApiDetails = {
      id: newId,
      name: newApiName,
      description: newApiDescription || "Custom API integration",
      icon: <Activity className="h-5 w-5 text-gray-600" />,
      apiKey: newApiKey,
      isConfigured: true,
      isActive: true
    };
    
    setApis([...apis, newApi]);
    
    setNewApiName("");
    setNewApiKey("");
    setNewApiDescription("");
    setShowAddDialog(false);
    
    toast.success(`Added new API integration: ${newApiName}`);
  };
  
  const handleRemoveApi = (apiId: string) => {
    // Don't allow removing built-in APIs
    const isBuiltIn = ["pinecone", "openai", "dataforseo", "googleads", "rapidapi"].includes(apiId);
    
    if (isBuiltIn) {
      setApis(prev => prev.map(api => 
        api.id === apiId ? { ...api, isConfigured: false, apiKey: undefined, isActive: false } : api
      ));
      toast.success(`Removed API key for ${apis.find(api => api.id === apiId)?.name}`);
    } else {
      setApis(prev => prev.filter(api => api.id !== apiId));
      toast.success(`Removed custom API integration`);
    }
  };
  
  const handleUpdateApi = () => {
    if (!selectedApi) return;
    
    setApis(prev => prev.map(api => 
      api.id === selectedApi.id ? { ...api, ...selectedApi } : api
    ));
    
    if (selectedApi.id === "pinecone" && selectedApi.apiKey) {
      configurePinecone(selectedApi.apiKey);
    }
    
    setSelectedApi(null);
    toast.success(`Updated ${selectedApi.name} API configuration`);
  };
  
  const toggleApiVisibility = (apiId: string) => {
    setShowApiKey(prev => ({
      ...prev,
      [apiId]: !prev[apiId]
    }));
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New API Integration</DialogTitle>
              <DialogDescription>
                Enter details for your custom API integration
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="api-name">API Name</Label>
                <Input 
                  id="api-name" 
                  placeholder="e.g., Ahrefs, SEMrush" 
                  value={newApiName}
                  onChange={(e) => setNewApiName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input 
                  id="api-key"
                  type="password"
                  placeholder="Enter your API key" 
                  value={newApiKey}
                  onChange={(e) => setNewApiKey(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="api-description">Description (optional)</Label>
                <Input 
                  id="api-description"
                  placeholder="What this API is used for" 
                  value={newApiDescription}
                  onChange={(e) => setNewApiDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddApi}>
                Add API
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {apis.map((api) => (
          <Card key={api.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                    {api.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{api.name}</h3>
                      {api.isConfigured && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                          Configured
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{api.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setSelectedApi(api)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      {selectedApi && (
                        <>
                          <DialogHeader>
                            <DialogTitle>Edit {selectedApi.name} API</DialogTitle>
                            <DialogDescription>
                              Update your API configuration
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-api-key">API Key</Label>
                              <div className="flex items-center gap-2">
                                <Input 
                                  id="edit-api-key"
                                  type={showApiKey[selectedApi.id] ? "text" : "password"}
                                  placeholder="Enter your API key" 
                                  value={selectedApi.apiKey || ""}
                                  onChange={(e) => setSelectedApi({
                                    ...selectedApi,
                                    apiKey: e.target.value,
                                    isConfigured: e.target.value.trim() !== ""
                                  })}
                                />
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => toggleApiVisibility(selectedApi.id)}
                                >
                                  {showApiKey[selectedApi.id] ? 
                                    <EyeOff className="h-4 w-4" /> : 
                                    <Eye className="h-4 w-4" />
                                  }
                                </Button>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Label htmlFor="api-active">Active</Label>
                              <input 
                                id="api-active"
                                type="checkbox"
                                className="rounded text-revology"
                                checked={selectedApi.isActive}
                                onChange={(e) => setSelectedApi({
                                  ...selectedApi,
                                  isActive: e.target.checked
                                })}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button 
                              variant="destructive" 
                              onClick={() => {
                                handleRemoveApi(selectedApi.id);
                                setSelectedApi(null);
                              }}
                              className="mr-auto"
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                            <Button variant="outline" onClick={() => setSelectedApi(null)}>
                              Cancel
                            </Button>
                            <Button onClick={handleUpdateApi}>
                              Save Changes
                            </Button>
                          </DialogFooter>
                        </>
                      )}
                    </DialogContent>
                  </Dialog>
                  
                  {api.isConfigured ? (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleRemoveApi(api.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-xs"
                          onClick={() => setSelectedApi(api)}
                        >
                          Configure
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  )}
                </div>
              </div>
              
              {api.isConfigured && api.apiKey && (
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">API Key: </Label>
                    <code className="text-xs bg-gray-100 p-1 rounded">
                      {showApiKey[api.id] ? api.apiKey : 
                        `${api.apiKey.substring(0, 5)}...${api.apiKey.substring(api.apiKey.length - 4)}`
                      }
                    </code>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-7 w-7 p-0" 
                    onClick={() => toggleApiVisibility(api.id)}
                  >
                    {showApiKey[api.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ApiIntegrationManager;
