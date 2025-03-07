
import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ApiDetails } from "@/types/apiIntegration";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getApiKey, setApiKey } from "@/services/keywords/apiConfig";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AIProvider, AIModel, getModelsForProvider } from "@/types/aiModels";
import { testSemrushConnection } from "@/services/keywords/semrushApi";
import { ModelTester } from "./ModelTester";
import { updateApi } from "@/services/apiIntegrationService";
import { broadcastApiChange } from "@/utils/apiIntegrationEvents";

interface ApiConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  api: ApiDetails;
}

export const ApiConfigDialog: React.FC<ApiConfigDialogProps> = ({ 
  isOpen, 
  onClose, 
  api 
}) => {
  const [apiKey, setApiKeyState] = useState<string>(getApiKey(api.id) || "");
  const [testPrompt, setTestPrompt] = useState<string>("");
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [isAiApi, setIsAiApi] = useState<boolean>(false);
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);

  useEffect(() => {
    if (api) {
      setApiKeyState(getApiKey(api.id) || "");
      setIsAiApi(api.id === "openai" || api.id === "gemini");
      
      if (api.id === "openai" || api.id === "gemini") {
        const provider = api.id as AIProvider;
        const models = getModelsForProvider(provider);
        setAvailableModels(models);
        
        // Set default model
        if (models.length > 0) {
          const defaultModel = models.find(m => m.isPrimary) || models[0];
          setSelectedModel(defaultModel.id);
        }
      }
    }
  }, [api]);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast.error("API Key is required");
      return;
    }

    const updatedApi: ApiDetails = {
      ...api,
      apiKey,
      isConfigured: true,
      isActive: true
    };

    try {
      setApiKey(api.id, apiKey);
      await updateApi(updatedApi);
      toast.success(`${api.name} API key saved successfully`);
      broadcastApiChange(api.id, 'update');
      onClose();
    } catch (error) {
      console.error("Error saving API key:", error);
      toast.error(`Failed to save ${api.name} API key`);
    }
  };

  const handleTest = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter an API key first");
      return;
    }

    setIsTesting(true);
    setTestResult("");

    try {
      if (api.id === "semrush") {
        const isConnected = await testSemrushConnection();
        setTestResult(isConnected ? "Connection successful!" : "Connection failed. Please check your API key.");
        toast[isConnected ? "success" : "error"](isConnected ? "Connection successful!" : "Connection failed");
      }
      // Test for AI APIs happens in the ModelTester component
    } catch (error) {
      console.error(`Error testing ${api.name} connection:`, error);
      setTestResult(`Error: ${error.message || "Unknown error occurred"}`);
      toast.error("Test failed");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {api.icon && <span>{api.icon}</span>}
            Configure {api.name} API
          </DialogTitle>
          <DialogDescription>
            {api.description || `Enter your ${api.name} API credentials to integrate with this service.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isAiApi ? (
            <Tabs defaultValue="config" className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="config">Configuration</TabsTrigger>
                <TabsTrigger value="test">Test Model</TabsTrigger>
              </TabsList>
              
              <TabsContent value="config" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="Enter your API key"
                    value={apiKey}
                    onChange={(e) => setApiKeyState(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Your API key is stored locally and never shared.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="test" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="modelSelect">Select Model</Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name} - {model.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <ModelTester 
                  apiProvider={api.id as AIProvider}
                  modelId={selectedModel}
                  apiKey={apiKey}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Enter your API key"
                  value={apiKey}
                  onChange={(e) => setApiKeyState(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Your API key is stored locally and never shared.
                </p>
              </div>
              
              {api.id === "semrush" && (
                <Button 
                  variant="outline" 
                  onClick={handleTest}
                  disabled={isTesting || !apiKey.trim()}
                  className="w-full mt-2"
                >
                  {isTesting ? "Testing..." : "Test Connection"}
                </Button>
              )}
              
              {testResult && (
                <Alert variant={testResult.includes("successful") ? "default" : "destructive"}>
                  <AlertDescription>{testResult}</AlertDescription>
                </Alert>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
